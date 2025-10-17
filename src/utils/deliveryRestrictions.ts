import { GetServerSidePropsContext } from 'next';

/**
 * Vérifie si la livraison est activée via l'API features
 */
export async function checkDeliveryEnabled(context: GetServerSidePropsContext): Promise<boolean> {
  try {
    const protocol = context.req.headers['x-forwarded-proto'] || 'http';
    const host = context.req.headers.host;
    const baseUrl = `${protocol}://${host}`;
    
    const response = await fetch(`${baseUrl}/api/features`, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'NextJS-Server'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return Boolean(data?.deliveryEnabled);
    }
    
    // En cas d'erreur API, on bloque par sécurité
    return false;
  } catch (error) {
    console.error('Erreur lors de la vérification de la livraison:', error);
    // En cas d'erreur réseau, on bloque par sécurité
    return false;
  }
}

/**
 * Vérifie si l'utilisateur est admin via les cookies
 */
export function isAdminUser(context: GetServerSidePropsContext): boolean {
  const adminCookie = context.req.cookies['manrina_admin'];
  return adminCookie === '1';
}

/**
 * Fonction utilitaire pour les pages nécessitant la livraison
 * Retourne une redirection vers /service-indisponible si nécessaire
 */
export async function withDeliveryRestriction(context: GetServerSidePropsContext) {
  // Les admins peuvent toujours accéder
  if (isAdminUser(context)) {
    return { props: {} };
  }
  
  // Vérifier si la livraison est activée
  const deliveryEnabled = await checkDeliveryEnabled(context);
  
  if (!deliveryEnabled) {
    return {
      redirect: {
        destination: '/service-indisponible',
        permanent: false,
      },
    };
  }
  
  return { props: {} };
}