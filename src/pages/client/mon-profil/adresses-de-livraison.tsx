/* eslint-disable react/no-unescaped-entities */
import React from 'react';

import { ICustomerTokenPayload } from '@/server/customer/ICustomer';
import { useState, useEffect } from 'react';
import { backendFetchService } from '@/service/BackendFetchService';
import { Address } from '@/server/customer/Address';
import CityPostalCodeSelector, { DeliveryDayWithTime, getDeliveryInfoFromPostalCode, isValidCityPostalCode } from '@/components/client/CityPostalCodeSelector';

interface AddressFormData {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    name: string;
    type: string;
    firstName: string;
    lastName: string;
}

// Fonction utilitaire pour séparer le nom complet en prénom et nom
const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length === 1) {
        return { firstName: nameParts[0], lastName: '' };
    }
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    return { firstName, lastName };
};

function AdressesLivraison({ authenticatedClient }: { authenticatedClient: ICustomerTokenPayload }) {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    // Séparer le nom complet de l'utilisateur connecté
    const { firstName: userFirstName, lastName: userLastName } = splitFullName(authenticatedClient?.name || '');
    
    const [formData, setFormData] = useState<AddressFormData>({
        address: '',
        city: '',
        postalCode: '',
        country: 'Martinique',
        name: '',
        type: 'customer',
        firstName: userFirstName,
        lastName: userLastName,
    });
    const [isAddressValid, setIsAddressValid] = useState(true);
    const [, setDeliveryInfo] = useState<{ zone: string; isAvailable: boolean; deliveryDays: DeliveryDayWithTime[] } | null>(null);

    // Charger les adresses au montage du composant
    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            setIsLoading(true);
            const addresses = await backendFetchService.getCustomerAddresses();
            setAddresses(addresses || []);
        } catch (error) {
            console.error('Erreur lors du chargement des adresses:', error);
            setMessage({ type: 'error', text: 'Erreur lors du chargement des adresses' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        // Vérifier la limite de 2 adresses pour les nouvelles adresses
        if (!editingAddress && addresses.length >= 2) {
            setMessage({ type: 'error', text: 'Vous devez d\'abord supprimer une adresse' });
            setIsSubmitting(false);
            return;
        }

        // Vérifier la validité de l'adresse (ville/code postal)
        if (!isAddressValid) {
            setMessage({ type: 'error', text: 'Veuillez vérifier la ville et le code postal saisis' });
            setIsSubmitting(false);
            return;
        }

        try {
            if (editingAddress) {
                await backendFetchService.updateCustomerAddress(editingAddress.id, formData);
            } else {
                await backendFetchService.createCustomerAddress(formData);
            }

            setMessage({ 
                type: 'success', 
                text: editingAddress ? 'Adresse modifiée avec succès' : 'Adresse ajoutée avec succès' 
            });
            resetForm();
            loadAddresses();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde de l\'adresse' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setFormData({
            address: address.address,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
            name: address.name || '',
            type: address.type,
            firstName: address.firstName || '',
            lastName: address.lastName || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (addressId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
            return;
        }

        try {
            await backendFetchService.deleteCustomerAddress(addressId);
            setMessage({ type: 'success', text: 'Adresse supprimée avec succès' });
            loadAddresses();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la suppression de l\'adresse' });
        }
    };

    const resetForm = () => {
        setFormData({
            address: '',
            city: '',
            postalCode: '',
            country: 'Martinique',
            name: '',
            type: 'customer',
            firstName: userFirstName,
            lastName: userLastName,
        });
        setEditingAddress(null);
        setShowForm(false);
        setIsAddressValid(true);
        setDeliveryInfo(null);
    };

    const handleCityChange = (city: string) => {
        setFormData(prev => ({ ...prev, city }));
    };

    const handlePostalCodeChange = (postalCode: string) => {
        setFormData(prev => ({ ...prev, postalCode }));
    };

    const handleValidationChange = (isValid: boolean, deliveryInfo: { zone: string; isAvailable: boolean; deliveryDays: DeliveryDayWithTime[] } | null) => {
        setIsAddressValid(isValid);
        setDeliveryInfo(deliveryInfo);
    };

    // Fonction pour obtenir les informations de livraison d'une adresse
    const getDeliveryInfoFromAddress = (city: string, postalCode: string) => {
        if (isValidCityPostalCode(city, postalCode)) {
            return getDeliveryInfoFromPostalCode(city, postalCode);
        }
        return null;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)]">
                        Mes adresses de livraison
                    </h2>
                    <button
                        onClick={() => {
                            if (!showForm && addresses.length >= 2) {
                                setMessage({ type: 'error', text: 'Vous devez d\'abord supprimer une adresse' });
                                return;
                            }
                            setShowForm(!showForm);
                            if (showForm) {
                                setMessage(null);
                            }
                        }}
                        className={`px-4 py-2 rounded-lg font-secondary font-bold transition-opacity ${
                            !showForm && addresses.length >= 2 
                                ? 'bg-gray-400 text-gray-600' 
                                : 'bg-[var(--color-primary)] text-white hover:opacity-90'
                        }`}
                    >
                        {showForm ? 'Annuler' : 'Ajouter une adresse'}
                    </button>
                </div>
                <p className="text-base text-[var(--muted-foreground)]">
                    Gérez vos adresses de livraison pour faciliter vos commandes futures.
                </p>
            </div>

            {/* Messages */}
            {message && (
                <div className={`p-4 rounded-lg ${
                    message.type === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Formulaire d'ajout/modification */}
            {showForm && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-secondary font-bold text-xl text-[var(--color-secondary)] mb-4">
                        {editingAddress ? 'Modifier l\'adresse' : 'Ajouter une nouvelle adresse'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Nom de l'adresse
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Domicile, Travail, etc."
                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="Votre prénom"
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Votre nom de famille"
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Adresse *
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Numéro et nom de rue"
                                required
                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                            />
                        </div>

                        <CityPostalCodeSelector
                            city={formData.city}
                            postalCode={formData.postalCode}
                            onCityChange={handleCityChange}
                            onPostalCodeChange={handlePostalCodeChange}
                            onValidationChange={handleValidationChange}
                        />

                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Pays *
                            </label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                placeholder="France"
                                required
                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Type d'adresse *
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                            >
                                <option value="customer">Client</option>
                                <option value="relay">Point relais</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg font-secondary font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isSubmitting ? 'Enregistrement...' : (editingAddress ? 'Modifier' : 'Ajouter')}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg font-secondary font-bold hover:opacity-90 transition-opacity"
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Liste des adresses */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-secondary font-bold text-xl text-[var(--color-secondary)] mb-4">
                    Mes adresses enregistrées
                </h3>
                
                {addresses.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-[var(--muted-foreground)] mb-4">
                            Vous n'avez pas encore d'adresse enregistrée.
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg font-secondary font-bold hover:opacity-90 transition-opacity"
                        >
                            Ajouter votre première adresse
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.map((address) => (
                            <div key={address.id} className="border border-[var(--border)] rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {address.name && (
                                                <span className="text-xs bg-[var(--color-primary)] text-white px-2 py-1 rounded font-semibold">
                                                    {address.name}
                                                </span>
                                            )}
                                        </div>
                                        {address.name && (
                                            <p className="text-[var(--color-primary)] font-semibold mb-1">{address.name}</p>
                                        )}
                                        {(address.firstName || address.lastName) && (
                                            <p className="text-[var(--foreground)] font-medium mb-1">
                                                {address.firstName} {address.lastName}
                                            </p>
                                        )}
                                        <p className="text-[var(--foreground)] mb-1">{address.address}</p>
                                        <p className="text-[var(--muted-foreground)] mb-2">
                                            {address.postalCode} {address.city}, {address.country}
                                        </p>
                                        <p className="text-sm text-[var(--muted-foreground)]">
                                            <strong>Type:</strong> {address.type === 'customer' ? 'Client' : address.type === 'relay' ? 'Point relais' : 'Autre'}
                                        </p>
                                        {(() => {
                                            // Afficher les informations de livraison pour cette adresse
                                            const deliveryInfo = getDeliveryInfoFromAddress(address.city, address.postalCode);
                                            if (deliveryInfo) {
                                                return (
                                                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                                        <p className="text-gray-600">
                                                            <strong>Zone:</strong> {deliveryInfo.zone}
                                                        </p>
                                                        {deliveryInfo.deliveryDays.length > 0 ? (
                                                            <p className="text-green-600 flex items-center gap-1">
                                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                                Livraison à domicile disponible
                                                            </p>
                                                        ) : (
                                                            <p className="text-orange-600">
                                                                Livraison en point relais uniquement
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleEdit(address)}
                                            className="text-[var(--color-primary)] hover:underline text-sm font-medium"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDelete(address.id)}
                                            className="text-red-600 hover:underline text-sm font-medium"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}

export default AdressesLivraison;