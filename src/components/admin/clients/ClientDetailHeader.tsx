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

interface ClientDetailHeaderProps {
  client: ClientWithDetails;
  isEditing: boolean;
  isSaving: boolean;
  onBackClick: () => void;
  onEditClick: () => void;
  onSaveClick: () => void;
  onCancelClick: () => void;
}

export function ClientDetailHeader({
  client,
  isEditing,
  isSaving,
  onBackClick,
  onEditClick,
  onSaveClick,
  onCancelClick,
}: ClientDetailHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackClick}
            className="text-[var(--muted-foreground)] hover:text-[var(--color-primary)] transition-colors"
          >
            <span className="font-secondary font-medium">← Retour aux clients</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={onCancelClick}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <span className="font-secondary font-medium">Annuler</span>
              </button>
              <button
                onClick={onSaveClick}
                disabled={isSaving}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <span className="font-secondary font-medium">
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </span>
              </button>
            </>
          ) : (
            <button
              onClick={onEditClick}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <span className="font-secondary font-medium">Modifier</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h1 className="text-2xl font-bold text-gray-900 font-secondary">
          {client.name}
        </h1>
        <div className="mt-2 flex items-center space-x-4 text-sm text-[var(--muted-foreground)]">
          <span>{client.email}</span>
          <span>•</span>
          <span>{client.phone}</span>
        </div>
      </div>
    </div>
  );
}