/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState } from 'react';

import PasswordChangeForm from '@/components/common/PasswordChangeForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Shield } from '@/components/icons/lock';

const ProducteurSecurityPage: React.FC = () => {
  const [] = useState(false);


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-[var(--primary)]" />
            <h1 className="text-3xl font-bold text-[var(--foreground)]">
              Sécurité
            </h1>
          </div>
          <p className="text-[var(--muted-foreground)] text-lg">
            Gérez les paramètres de sécurité de votre compte producteur
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {/* Section Modification du mot de passe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Modification du mot de passe
              </CardTitle>
              <CardDescription>
                Changez votre mot de passe pour sécuriser votre compte producteur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-md">
                <PasswordChangeForm
                  userType="grower"
                  title=""
                  description=""
                />
              </div>
            </CardContent>
          </Card>

          {/* Section Informations de sécurité */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de sécurité</CardTitle>
              <CardDescription>
                Conseils pour maintenir la sécurité de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Conseils pour un mot de passe sécurisé :
                  </h3>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Utilisez au moins 8 caractères</li>
                    <li>• Mélangez lettres majuscules et minuscules</li>
                    <li>• Incluez des chiffres et des caractères spéciaux</li>
                    <li>• Évitez les informations personnelles</li>
                    <li>• Ne réutilisez pas vos anciens mots de passe</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">
                    Sécurité de votre activité :
                  </h3>
                  <ul className="text-green-800 space-y-1 text-sm">
                    <li>• Protégez l'accès à vos stocks et produits</li>
                    <li>• Vérifiez régulièrement vos participations au marché</li>
                    <li>• Signalez toute activité suspecte</li>
                    <li>• Gardez vos informations de profil à jour</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default ProducteurSecurityPage;