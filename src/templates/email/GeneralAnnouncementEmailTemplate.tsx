'use client';

import React from 'react';
import { CreateNotificationInput } from '@/server/services/NotificationService/handlers/INotificationHandler';

interface GeneralAnnouncementEmailTemplateProps {
  input: CreateNotificationInput;
  recipientName?: string;
}

/**
 * Template d'email spécialisé pour les annonces générales
 * Utilise uniquement Tailwind CSS
 */
const GeneralAnnouncementEmailTemplate: React.FC<GeneralAnnouncementEmailTemplateProps> = ({
  input,
  recipientName = 'Cher utilisateur'
}) => {
  return (
    <div className="font-sans max-w-2xl mx-auto p-5" style={{ backgroundColor: '#f8f0e9' }}>
      <div className="bg-white rounded-lg p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-sky-50 rounded-full w-20 h-20 mx-auto mb-5 flex items-center justify-center">
            <span className="text-4xl">📢</span>
          </div>
          <h1 className="text-blue-800 text-3xl font-bold m-0" style={{ fontFamily: 'Redgar, serif' }}>
            {input.title}
          </h1>
        </div>

        {/* Content */}
        <div className="mb-8">
          <p className="text-gray-600 text-base leading-relaxed mb-5">
            Bonjour {recipientName},
          </p>
          
          <div className="bg-sky-50 border-l-4 border-blue-500 p-5 my-5 rounded">
            <p className="text-gray-600 text-base leading-relaxed m-0">
              {input.message}
            </p>
          </div>

          <p className="text-gray-600 text-base leading-relaxed">
            Merci de votre attention.
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
export const generateGeneralAnnouncementEmailHTML = (
  input: CreateNotificationInput,
  recipientName?: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Annonce générale</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div class="font-sans max-w-2xl mx-auto p-5 bg-orange-50">
          <div class="bg-white rounded-lg p-8 shadow-lg">
            <!-- Header -->
            <div class="text-center mb-8">
              <div class="bg-sky-50 rounded-full w-20 h-20 mx-auto mb-5 flex items-center justify-center">
                <span class="text-4xl">📢</span>
              </div>
              <h1 class="text-blue-800 text-3xl font-bold m-0 font-serif">
                ${input.title}
              </h1>
            </div>

            <!-- Content -->
            <div class="mb-8">
              <p class="text-gray-600 text-base leading-relaxed mb-5">
                Bonjour ${recipientName || 'Cher utilisateur'},
              </p>
              
              <div class="bg-sky-50 border-l-4 border-blue-500 p-5 my-5 rounded">
                <p class="text-gray-600 text-base leading-relaxed m-0">
                  ${input.message}
                </p>
              </div>

              <p class="text-gray-600 text-base leading-relaxed">
                Merci de votre attention.
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

export default GeneralAnnouncementEmailTemplate;