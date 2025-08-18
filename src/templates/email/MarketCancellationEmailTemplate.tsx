'use client';

import React from 'react';
import { CreateNotificationInput } from '@/server/services/NotificationService/handlers/INotificationHandler';

interface MarketCancellationEmailTemplateProps {
  input: CreateNotificationInput;
  marketSession?: {
    name: string;
    date: string;
  };
  recipientName?: string;
}

/**
 * Template d'email spécialisé pour les annulations de marché
 * Utilise uniquement Tailwind CSS
 */
const MarketCancellationEmailTemplate: React.FC<MarketCancellationEmailTemplateProps> = ({
  input,
  marketSession,
  recipientName = 'Cher utilisateur'
}) => {
  const marketName = marketSession?.name || 'Marché';
  const marketDate = marketSession?.date
    ? new Date(marketSession.date).toLocaleDateString('fr-FR')
    : 'Date non spécifiée';

  return (
    <div className="font-sans max-w-2xl mx-auto p-5" style={{ backgroundColor: '#f8f0e9' }}>
      <div className="bg-white rounded-lg p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-red-50 rounded-full w-20 h-20 mx-auto mb-5 flex items-center justify-center">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-red-800 text-3xl font-bold m-0" style={{ fontFamily: 'Redgar, serif' }}>
            {input.title}
          </h1>
        </div>

        {/* Content */}
        <div className="mb-8">
          <p className="text-gray-600 text-base leading-relaxed mb-5">
            Bonjour {recipientName},
          </p>
          
          <p className="text-gray-600 text-base leading-relaxed mb-5">
            {input.message}
          </p>

          <div className="bg-red-50 border-l-4 border-red-600 p-5 my-5 rounded">
            <h3 className="text-red-800 m-0 mb-2 text-lg font-semibold">Détails du marché :</h3>
            <p className="text-gray-600 my-1 text-sm">
              <span className="font-semibold">Nom :</span> {marketName}
            </p>
            <p className="text-gray-600 my-1 text-sm">
              <span className="font-semibold">Date :</span> {marketDate}
            </p>
          </div>

          <p className="text-gray-600 text-base leading-relaxed">
            Nous nous excusons pour la gêne occasionnée et vous remercions de votre compréhension.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-5 text-center">
          <p className="text-gray-800 text-lg font-bold m-0 mb-2">
            L'équipe Manrina
          </p>
          <p className="text-gray-600 text-sm m-0">
            Votre marché local de confiance
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Fonction utilitaire pour générer le HTML de l'email
 */
export const generateMarketCancellationEmailHTML = (
  input: CreateNotificationInput,
  marketSession?: { name: string; date: string },
  recipientName?: string
): string => {
  const marketName = marketSession?.name || 'Marché';
  const marketDate = marketSession?.date
    ? new Date(marketSession.date).toLocaleDateString('fr-FR')
    : 'Date non spécifiée';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Annulation de marché</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div class="font-sans max-w-2xl mx-auto p-5 bg-orange-50">
          <div class="bg-white rounded-lg p-8 shadow-lg">
            <!-- Header -->
            <div class="text-center mb-8">
              <div class="bg-red-50 rounded-full w-20 h-20 mx-auto mb-5 flex items-center justify-center">
                <span class="text-4xl">🚫</span>
              </div>
              <h1 class="text-red-800 text-3xl font-bold m-0 font-serif">
                ${input.title}
              </h1>
            </div>

            <!-- Content -->
            <div class="mb-8">
              <p class="text-gray-600 text-base leading-relaxed mb-5">
                Bonjour ${recipientName || 'Cher utilisateur'},
              </p>
              
              <p class="text-gray-600 text-base leading-relaxed mb-5">
                ${input.message}
              </p>

              <div class="bg-red-50 border-l-4 border-red-600 p-5 my-5 rounded">
                <h3 class="text-red-800 m-0 mb-2 text-lg font-semibold">Détails du marché :</h3>
                <p class="text-gray-600 my-1 text-sm">
                  <span class="font-semibold">Nom :</span> ${marketName}
                </p>
                <p class="text-gray-600 my-1 text-sm">
                  <span class="font-semibold">Date :</span> ${marketDate}
                </p>
              </div>

              <p class="text-gray-600 text-base leading-relaxed">
                Nous nous excusons pour la gêne occasionnée et vous remercions de votre compréhension.
              </p>
            </div>

            <!-- Footer -->
            <div class="border-t border-gray-200 pt-5 text-center">
              <p class="text-gray-800 text-lg font-bold m-0 mb-2">
                L'équipe Manrina
              </p>
              <p class="text-gray-600 text-sm m-0">
                Votre marché local de confiance
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export default MarketCancellationEmailTemplate;