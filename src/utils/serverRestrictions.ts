import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { getPageRestriction } from '@/config/restrictedPages';

/**
 * Utilitaire pour vérifier les restrictions côté serveur
 */
export async function checkServerSideRestrictions(
  context: GetServerSidePropsContext,
  pathname?: string
): Promise<GetServerSidePropsResult<Record<string, unknown>> | null> {
  const currentPath = pathname || context.resolvedUrl;
  
  // Vérifier si la page a des restrictions
  const restriction = getPageRestriction(currentPath);
  
  if (!restriction) {
    return null; // Pas de restriction
  }

  // Vérifier le bypass admin via cookie
  const adminCookie = context.req.cookies['manrina_admin'];
  if (adminCookie === '1') {
    return null; // Admin peut contourner
  }

  // Vérifier les restrictions spécifiques
  switch (restriction.restriction) {
    case 'delivery':
      try {
        // Appeler l'API features pour vérifier le statut
        const protocol = context.req.headers['x-forwarded-proto'] || 'http';
        const host = context.req.headers.host;
        const apiUrl = `${protocol}://${host}/api/features`;
        
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          if (!data.deliveryEnabled) {
            return {
              redirect: {
                destination: restriction.redirectTo,
                permanent: false,
              },
            };
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des restrictions:', error);
        // En cas d'erreur, rediriger par sécurité
        return {
          redirect: {
            destination: restriction.redirectTo,
            permanent: false,
          },
        };
      }
      break;
  }

  return null; // Pas de redirection nécessaire
}

/**
 * HOC pour ajouter automatiquement les vérifications de restrictions
 * aux getServerSideProps existantes
 */
export function withServerSideRestrictions<T extends Record<string, unknown>>(
  getServerSideProps?: (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<T>>
) {
  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
    // Vérifier les restrictions en premier
    const restrictionResult = await checkServerSideRestrictions(context);
    if (restrictionResult) {
      return restrictionResult as GetServerSidePropsResult<T>;
    }

    // Si pas de restriction, exécuter les getServerSideProps originales
    if (getServerSideProps) {
      return await getServerSideProps(context);
    }

    // Retourner des props vides si pas de getServerSideProps
    return {
      props: {} as T,
    };
  };
}