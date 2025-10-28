/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  useClientAddresses, 
  useCreateClientAddress, 
  useUpdateClientAddress, 
  useDeleteClientAddress 
} from '@/hooks/admin/useClientAddresses';

interface Address {
  id: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  type: string;
  customerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ClientAddressesCardProps {
  clientId: string;
}

export function ClientAddressesCard({ clientId }: ClientAddressesCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editedAddress, setEditedAddress] = useState<Partial<Address>>({});
  const [newAddress, setNewAddress] = useState<Partial<Address>>({});
  
  const { 
    data: addresses = [], 
    isLoading, 
    error 
  } = useClientAddresses(clientId);
  
  const createAddressMutation = useCreateClientAddress();
  const updateAddressMutation = useUpdateClientAddress();
  const deleteAddressMutation = useDeleteClientAddress();

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setEditedAddress(address);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditedAddress({});
    setNewAddress({});
  };

  const handleSave = async (addressData: Partial<Address>) => {
    try {
      if (editingId) {
        // Mise à jour d'une adresse existante
        await updateAddressMutation.mutateAsync({
          clientId,
          addressId: editingId,
          data: {
            customerId: clientId,
            address: addressData.address!,
            city: addressData.city!,
            postalCode: addressData.postalCode!,
            country: addressData.country!,
            type: addressData.type!
          }
        });
      } else {
        // Création d'une nouvelle adresse
        await createAddressMutation.mutateAsync({
          clientId,
          data: {
            customerId: clientId,
            address: addressData.address!,
            city: addressData.city!,
            postalCode: addressData.postalCode!,
            country: addressData.country!,
            type: addressData.type!
          }
        });
      }
      
      setEditingId(null);
      setIsAdding(false);
      setEditedAddress({});
      setNewAddress({});
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      return;
    }
    
    try {
      await deleteAddressMutation.mutateAsync({ clientId, addressId });
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingId(null);
    setNewAddress({
      address: '',
      city: '',
      postalCode: '',
      country: 'France',
      type: 'home'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Adresses du client
        </h3>
        <button 
          onClick={handleAddNew}
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          <span>+ Ajouter une adresse</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="small" />
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-600 text-sm">
          {error.message || 'Erreur lors du chargement des adresses'}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-6xl mb-3 text-gray-300">📍</div>
          <p className="text-sm">Aucune adresse enregistrée</p>
          <p className="text-xs text-gray-400 mt-1">
            Cliquez sur "Ajouter une adresse" pour commencer
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {isAdding && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="new-address" className="block text-xs font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <input
                      type="text"
                      id="new-address"
                      value={newAddress.address || ''}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-city" className="block text-xs font-medium text-gray-700 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      id="new-city"
                      value={newAddress.city || ''}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-postal-code" className="block text-xs font-medium text-gray-700 mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      id="new-postal-code"
                      value={newAddress.postalCode || ''}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-country" className="block text-xs font-medium text-gray-700 mb-1">
                      Pays
                    </label>
                    <input
                      type="text"
                      id="new-country"
                      value={newAddress.country || ''}
                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="new-type" className="block text-xs font-medium text-gray-700 mb-1">
                      Type d'adresse
                    </label>
                    <select
                      id="new-type"
                      value={newAddress.type || 'home'}
                      onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent"
                    >
                      <option value="home">Domicile</option>
                      <option value="work">Travail</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                      <span>Annuler</span>
                    </button>
                    <button
                      onClick={() => handleSave(newAddress)}
                      disabled={createAddressMutation.isPending}
                      className="px-3 py-1 text-xs bg-[var(--color-primary)] text-white rounded hover:opacity-90 disabled:opacity-50"
                    >
                      <span>{createAddressMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {addresses.map((address) => (
            <div key={address.id} className="border border-gray-200 rounded-lg p-4">
              {editingId === address.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`edit-address-${address.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                        Adresse
                      </label>
                      <input
                        type="text"
                        id={`edit-address-${address.id}`}
                        value={editedAddress.address || ''}
                        onChange={(e) => setEditedAddress({ ...editedAddress, address: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-city-${address.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                        Ville
                      </label>
                      <input
                        type="text"
                        id={`edit-city-${address.id}`}
                        value={editedAddress.city || ''}
                        onChange={(e) => setEditedAddress({ ...editedAddress, city: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-postal-code-${address.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                        Code postal
                      </label>
                      <input
                        type="text"
                        id={`edit-postal-code-${address.id}`}
                        value={editedAddress.postalCode || ''}
                        onChange={(e) => setEditedAddress({ ...editedAddress, postalCode: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-country-${address.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                        Pays
                      </label>
                      <input
                        type="text"
                        id={`edit-country-${address.id}`}
                        value={editedAddress.country || ''}
                        onChange={(e) => setEditedAddress({ ...editedAddress, country: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <label htmlFor={`edit-type-${address.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                        Type d'adresse
                      </label>
                      <select
                        id={`edit-type-${address.id}`}
                        value={editedAddress.type || 'home'}
                        onChange={(e) => setEditedAddress({ ...editedAddress, type: e.target.value })}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent"
                      >
                        <option value="home">Domicile</option>
                        <option value="work">Travail</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                      >
                        <span>Annuler</span>
                      </button>
                      <button
                        onClick={() => handleSave(editedAddress)}
                        disabled={updateAddressMutation.isPending}
                        className="px-3 py-1 text-xs bg-[var(--color-primary)] text-white rounded hover:opacity-90 disabled:opacity-50"
                      >
                        <span>{updateAddressMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {address.type === 'home' ? 'Domicile' : address.type === 'work' ? 'Travail' : 'Autre'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900">
                        <div>{address.address}</div>
                        <div>{address.postalCode} {address.city}</div>
                        <div>{address.country}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(address)}
                        className="p-1 text-gray-400 hover:text-[var(--color-primary)] transition-colors text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        disabled={deleteAddressMutation.isPending}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}