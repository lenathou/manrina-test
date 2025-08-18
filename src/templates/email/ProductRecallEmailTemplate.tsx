'use client';

import React from 'react';
import { CreateNotificationInput } from '@/server/services/NotificationService/handlers/INotificationHandler';

interface ProductRecallEmailTemplateProps {
  input: CreateNotificationInput;
  recipient: {
    email: string;
    name: string;
  };
  product: {
    id: string;
    name: string;
    grower: {
      name: string;
    };
  };
}

/**
 * Template d'email spécialisé pour les rappels de produit
 * Utilise uniquement Tailwind CSS
 */
const ProductRecallEmailTemplate: React.FC<ProductRecallEmailTemplateProps> = ({
  input,
  recipient,
  product
}) => {
  return (
    <div className="font-sans max-w-2xl mx-auto p-5" style={{ backgroundColor: '#f8f0e9' }}>
      <div className="bg-white rounded-lg p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-red-50 rounded-full w-20 h-20 mx-auto mb-5 flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-red-800 text-3xl font-bold m-0" style={{ fontFamily: 'Redgar, serif' }}>
            ⚠️ {input.title}
          </h1>
        </div>

        {/* Content */}
        <div className="mb-8">
          <p className="text-gray-600 text-base leading-relaxed mb-5">
            <strong>Bonjour {recipient.name},</strong>
          </p>
          
          <div className="bg-white p-4 rounded border my-5">
            <h3 className="text-red-800 m-0 mb-2 text-lg font-semibold">Produit concerné :</h3>
            <p className="text-gray-600 my-1 text-sm">
              <span className="font-semibold">Nom :</span> {product.name}
            </p>
            <p className="text-gray-600 my-1 text-sm">
              <span className="font-semibold">Producteur :</span> {product.grower.name}
            </p>
            <p className="text-gray-600 my-1 text-sm">
              <span className="font-semibold">ID Produit :</span> {product.id}
            </p>
          </div>

          <div className="bg-red-50 border-l-4 border-red-600 p-5 my-5 rounded">
            <h3 className="text-red-800 m-0 mb-2 text-lg font-semibold">Mesures à prendre :</h3>
            <p className="text-gray-600 text-base leading-relaxed m-0">
              {input.message}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded my-5">
            <h3 className="text-amber-800 m-0 mb-2 text-lg font-semibold">Actions recommandées :</h3>
            <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
              <li>Cessez immédiatement la vente de ce produit</li>
              <li>Retirez le produit de vos étalages</li>
              <li>Contactez vos clients qui ont acheté ce produit</li>
              <li>Conservez le produit pour inspection si nécessaire</li>
            </ul>
          </div>

          <p className="text-gray-600 text-base leading-relaxed">
            Pour toute question concernant ce rappel, n'hésitez pas à nous contacter.
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
export const generateProductRecallEmailHTML = (
  input: CreateNotificationInput,
  recipient: { email: string; name: string },
  product: { id: string; name: string; grower: { name: string } }
): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Rappel de produit urgent</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div class="font-sans max-w-2xl mx-auto p-5 bg-orange-50">
          <div class="bg-white rounded-lg p-8 shadow-lg">
            <!-- Header -->
            <div class="text-center mb-8">
              <div class="bg-red-50 rounded-full w-20 h-20 mx-auto mb-5 flex items-center justify-center">
                <span class="text-4xl">⚠️</span>
              </div>
              <h1 class="text-red-800 text-3xl font-bold m-0 font-serif">
                ⚠️ ${input.title}
              </h1>
            </div>

            <!-- Content -->
            <div class="mb-8">
              <p class="text-gray-600 text-base leading-relaxed mb-5">
                <strong>Bonjour ${recipient.name},</strong>
              </p>
              
              <div class="bg-white p-4 rounded border my-5">
                <h3 class="text-red-800 m-0 mb-2 text-lg font-semibold">Produit concerné :</h3>
                <p class="text-gray-600 my-1 text-sm">
                  <span class="font-semibold">Nom :</span> ${product.name}
                </p>
                <p class="text-gray-600 my-1 text-sm">
                  <span class="font-semibold">Producteur :</span> ${product.grower.name}
                </p>
                <p class="text-gray-600 my-1 text-sm">
                  <span class="font-semibold">ID Produit :</span> ${product.id}
                </p>
              </div>

              <div class="bg-red-50 border-l-4 border-red-600 p-5 my-5 rounded">
                <h3 class="text-red-800 m-0 mb-2 text-lg font-semibold">Mesures à prendre :</h3>
                <p class="text-gray-600 text-base leading-relaxed m-0">
                  ${input.message}
                </p>
              </div>

              <div class="bg-amber-50 border border-amber-200 p-4 rounded my-5">
                <h3 class="text-amber-800 m-0 mb-2 text-lg font-semibold">Actions recommandées :</h3>
                <ul class="text-gray-600 text-sm list-disc list-inside space-y-1">
                  <li>Cessez immédiatement la vente de ce produit</li>
                  <li>Retirez le produit de vos étalages</li>
                  <li>Contactez vos clients qui ont acheté ce produit</li>
                  <li>Conservez le produit pour inspection si nécessaire</li>
                </ul>
              </div>

              <p class="text-gray-600 text-base leading-relaxed">
                Pour toute question concernant ce rappel, n'hésitez pas à nous contacter.
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

export default ProductRecallEmailTemplate;