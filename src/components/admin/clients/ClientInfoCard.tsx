/* eslint-disable react/no-unescaped-entities */
import React from 'react';


interface ClientWithDetails {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  totalOrders?: number;
  totalSpent?: string;
  registrationDate?: string;
  lastOrderDate?: string | null;
}

interface ClientInfoCardProps {
  client: ClientWithDetails;
  isEditing: boolean;
  onEdit: () => void;
  onSave?: (data: { name: string; email: string; phone?: string }) => void;
  onCancel: () => void;
  isSaving?: boolean;
  onFieldChange: (field: keyof ClientWithDetails, value: string | boolean | number | null) => void;
}

export function ClientInfoCard({ client, isEditing, onFieldChange }: ClientInfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Informations personnelles
      </h3>

      <div className="space-y-6">
        {/* Nom complet */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom complet
          </label>
          {isEditing ? (
            <input
              type="text"
              value={client.name || ''}
              onChange={(e) => onFieldChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              placeholder="Nom complet du client"
            />
          ) : (
            <div className="text-gray-900">
              {client.name || 'Non renseigné'}
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresse email
          </label>
          {isEditing ? (
            <input
              type="email"
              value={client.email || ''}
              onChange={(e) => onFieldChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              placeholder="email@exemple.com"
            />
          ) : (
            <div className="text-gray-900">
              {client.email || 'Non renseigné'}
            </div>
          )}
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de téléphone
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={client.phone || ''}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              placeholder="06 12 34 56 78"
            />
          ) : (
            <div className="text-gray-900">
              {client.phone || 'Non renseigné'}
            </div>
          )}
        </div>

        {/* Informations en lecture seule */}
        {!isEditing && (
          <>
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Date d'inscription
                  </label>
                  <span className="text-sm text-gray-900">
                    {client.registrationDate || new Date(client.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Dernière modification
                  </label>
                  <span className="text-sm text-gray-900">
                    {new Date(client.updatedAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {isEditing && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note :</strong> Les modifications des informations personnelles prendront effet immédiatement après la sauvegarde.
          </p>
        </div>
      )}
    </div>
  );
}