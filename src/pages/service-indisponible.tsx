/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { useRouter } from 'next/router';
import { ROUTES } from '../router/routes';

const ServiceIndisponible = () => {
  const router = useRouter();

  const handleReturnHome = () => {
    router.push(ROUTES.PRODUITS);
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-5">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <span className="text-8xl">🚫</span>
        </div>
        
        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-5">
          Service temporairement indisponible
        </h1>
        
        <p className="text-lg text-gray-900 mb-4 leading-6">
          Nous sommes désolés, mais le service de livraison est actuellement indisponible.
        </p>
        
        <p className="text-base text-[var(--muted-foreground)] mb-10 leading-5">
          Notre équipe travaille pour rétablir ce service dans les plus brefs délais.
          Merci de votre compréhension.
        </p>
        
        <button 
          className="bg-[var(--color-primary)] text-white px-8 py-4 rounded-lg font-bold text-base shadow-lg hover:shadow-xl transition-shadow"
          onClick={handleReturnHome}
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default ServiceIndisponible;