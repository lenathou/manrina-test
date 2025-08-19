/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

interface MarketProducer {
  id: string;
  name: string;
  profilePhoto: string;
  email?: string;
  phone?: string;
  totalProducts: number;
  totalStock: number;
  isActive: boolean;
}

interface ParticipantSelectorProps {
  selectedParticipants: MarketProducer[];
  onParticipantsChange: (participants: MarketProducer[]) => void;
  disabled?: boolean;
}

export const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  selectedParticipants,
  onParticipantsChange,
  disabled = false
}) => {
  const [availableParticipants, setAvailableParticipants] = useState<MarketProducer[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<MarketProducer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Charger les participants disponibles (producteurs)
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/market/producers');
        if (response.ok) {
          const producers = await response.json();
          setAvailableParticipants(producers);
          setFilteredParticipants(producers);
        } else {
          setError('Erreur lors du chargement des producteurs');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des producteurs:', err);
        setError('Erreur lors du chargement des producteurs');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  // Filtrer les participants selon les critères
  useEffect(() => {
    let filtered = availableParticipants;

    // Filtre par nom
    if (searchFilter) {
      filtered = filtered.filter(participant =>
        participant.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (participant.email && participant.email.toLowerCase().includes(searchFilter.toLowerCase()))
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(participant =>
        statusFilter === 'active' ? participant.isActive : !participant.isActive
      );
    }

    setFilteredParticipants(filtered);
  }, [availableParticipants, searchFilter, statusFilter]);

  // Ajouter un participant à la sélection
  const handleAddParticipant = (participant: MarketProducer) => {
    if (!selectedParticipants.find(p => p.id === participant.id)) {
      onParticipantsChange([...selectedParticipants, participant]);
    }
    setShowDropdown(false);
  };

  // Retirer un participant de la sélection
  const handleRemoveParticipant = (participantId: string) => {
    onParticipantsChange(selectedParticipants.filter(p => p.id !== participantId));
  };

  // Filtrer les participants non sélectionnés
  const unselectedParticipants = filteredParticipants.filter(
    participant => !selectedParticipants.find(selected => selected.id === participant.id)
  );

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Participants (Producteurs)
        </label>
        <div className="flex items-center justify-center h-20 border border-gray-300 rounded-md">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Participants (Producteurs)
        </label>
        <div className="p-3 border border-red-300 rounded-md bg-red-50">
          <Text variant="small" className="text-red-600">{error}</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Participants de l'événement (Producteurs)
      </label>
      
      {/* Participants sélectionnés */}
      {selectedParticipants.length > 0 && (
        <div className="space-y-2">
          <Text variant="small" className="font-medium text-gray-600">
            Participants sélectionnés ({selectedParticipants.length})
          </Text>
          {selectedParticipants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                {participant.profilePhoto ? (
                  <Image
                    src={participant.profilePhoto}
                    alt={participant.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <Text variant="body" className="font-medium text-gray-900">
                    {participant.name}
                  </Text>
                  <div className="flex items-center space-x-2">
                    {participant.email && (
                      <Text variant="small" className="text-gray-500">
                        {participant.email}
                      </Text>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      participant.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {participant.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
              {!disabled && (
                <Button
                  onClick={() => handleRemoveParticipant(participant.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-800 hover:border-red-300"
                >
                  Retirer
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bouton pour ajouter des participants */}
      {!disabled && (
        <div className="relative">
          <Button
            onClick={() => setShowDropdown(!showDropdown)}
            variant="outline"
            className="w-full justify-center"
          >
            Ajouter un participant
          </Button>

          {/* Dropdown des participants disponibles */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
              {/* Filtres */}
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou email..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1 rounded-md text-xs font-medium ${
                        statusFilter === 'all'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Tous
                    </button>
                    <button
                      onClick={() => setStatusFilter('active')}
                      className={`px-3 py-1 rounded-md text-xs font-medium ${
                        statusFilter === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Actifs
                    </button>
                    <button
                      onClick={() => setStatusFilter('inactive')}
                      className={`px-3 py-1 rounded-md text-xs font-medium ${
                        statusFilter === 'inactive'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Inactifs
                    </button>
                  </div>
                </div>
              </div>

              {/* Liste des participants */}
              <div className="max-h-60 overflow-y-auto">
                {unselectedParticipants.length > 0 ? (
                  unselectedParticipants.map((participant) => (
                    <button
                      key={participant.id}
                      onClick={() => handleAddParticipant(participant)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        {participant.profilePhoto ? (
                          <Image
                            src={participant.profilePhoto}
                            alt={participant.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-sm">
                              {participant.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <Text variant="body" className="font-medium text-gray-900">
                            {participant.name}
                          </Text>
                          <div className="flex items-center space-x-2">
                            {participant.email && (
                              <Text variant="small" className="text-gray-500">
                                {participant.email}
                              </Text>
                            )}
                            <Text variant="small" className="text-gray-400">
                              {participant.totalProducts} produits
                            </Text>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        participant.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {participant.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <Text variant="small">
                      {searchFilter || statusFilter !== 'all' 
                        ? 'Aucun producteur trouvé avec ces critères'
                        : 'Tous les producteurs disponibles ont été sélectionnés'
                      }
                    </Text>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages d'état */}
      {availableParticipants.length === 0 && (
        <div className="text-center py-3">
          <Text variant="small" className="text-gray-500 mb-2">
            Aucun producteur disponible
          </Text>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/admin/gestion-producteurs', '_blank')}
          >
            Gérer les producteurs
          </Button>
        </div>
      )}
    </div>
  );
};

export default ParticipantSelector;