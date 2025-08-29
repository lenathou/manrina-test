/* eslint-disable react/no-unescaped-entities */
'use client';

import React from 'react';
import { CreateNotificationInput } from '@/server/services/NotificationService/handlers/INotificationHandler';

interface SystemMaintenanceEmailTemplateProps {
  input: CreateNotificationInput;
  recipientName?: string;
}

/**
 * Template d'email spécialisé pour la maintenance système
 * Utilise uniquement Tailwind CSS
 */
const SystemMaintenanceEmailTemplate: React.FC<SystemMaintenanceEmailTemplateProps> = ({
  input,
  recipientName = 'Cher utilisateur'
}) => {
  const maintenanceDate = input.expiresAt
    ? new Date(input.expiresAt).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Date à déterminer';

  return (
    <div className="font-sans max-w-2xl mx-auto p-5" style={{ backgroundColor: '#f8f0e9' }}>
      <div className="bg-white rounded-lg p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-amber-100 rounded-full w-20 h-20 mx-auto mb-5 flex items-center justify-center">
            <span className="text-4xl">🔧</span>
          </div>
          <h1 className="text-amber-600 text-3xl font-bold m-0" style={{ fontFamily: 'Redgar, serif' }}>
            {input.title}
          </h1>
        </div>

        {/* Content */}
        <div className="mb-8">
          <p className="text-gray-600 text-base leading-relaxed mb-5">
            Bonjour {recipientName},
          </p>
          
          <div className="bg-amber-100 border-l-4 border-amber-500 p-5 my-5 rounded">
            <h3 className="text-amber-600 m-0 mb-2 text-lg font-semibold">Information importante :</h3>
            <p className="text-gray-600 text-base leading-relaxed m-0">
              {input.message}
            </p>
          </div>

          {input.expiresAt && (
            <div className="bg-gray-100 rounded p-4 my-5">
              <p className="text-gray-600 my-1 text-sm">
                <span className="font-semibold">Période concernée :</span> {maintenanceDate}
              </p>
            </div>
          )}

          <p className="text-gray-600 text-base leading-relaxed">
            Nous nous excusons pour la gêne occasionnée et vous remercions de votre compréhension.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-5 text-center">
          <p className="text-gray-800 text-lg font-bold m-0 mb-2">
            L'équipe technique Manrina
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
export const generateSystemMaintenanceEmailHTML = (
  input: CreateNotificationInput,
  recipientName?: string
): string => {
  const maintenanceDate = input.expiresAt
    ? new Date(input.expiresAt).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Date à déterminer';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Maintenance système</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div class="font-sans max-w-2xl mx-auto p-5 bg-orange-50">
          <div class="bg-white rounded-lg p-8 shadow-lg">
            <!-- Header -->
            <div class="text-center mb-8">
              <div class="bg-amber-100 rounded-full w-20 h-20 mx-auto mb-5 flex items-center justify-center">
                <span class="text-4xl">🔧</span>
              </div>
              <h1 class="text-amber-600 text-3xl font-bold m-0 font-serif">
                ${input.title}
              </h1>
            </div>

            <!-- Content -->
            <div class="mb-8">
              <p class="text-gray-600 text-base leading-relaxed mb-5">
                Bonjour ${recipientName || 'Cher utilisateur'},
              </p>
              
              <div class="bg-amber-100 border-l-4 border-amber-500 p-5 my-5 rounded">
                <h3 class="text-amber-600 m-0 mb-2 text-lg font-semibold">Information importante :</h3>
                <p class="text-gray-600 text-base leading-relaxed m-0">
                  ${input.message}
                </p>
              </div>

              ${input.expiresAt ? `
              <div class="bg-gray-100 rounded p-4 my-5">
                <p class="text-gray-600 my-1 text-sm">
                  <span class="font-semibold">Période concernée :</span> ${maintenanceDate}
                </p>
              </div>
              ` : ''}

              <p class="text-gray-600 text-base leading-relaxed">
                Nous nous excusons pour la gêne occasionnée et vous remercions de votre compréhension.
              </p>
            </div>

            <!-- Footer -->
            <div class="border-t border-gray-200 pt-5 text-center">
              <p class="text-gray-800 text-lg font-bold m-0 mb-2">
                L'équipe technique Manrina
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

export default SystemMaintenanceEmailTemplate;