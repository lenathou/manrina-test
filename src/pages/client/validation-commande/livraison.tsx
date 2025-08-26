/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '@/context/AppContext';
import { Address } from '@/server/customer/Address';
import { backendFetchService } from '@/service/BackendFetchService';
import { ROUTES } from '@/router/routes';


import { Button } from '@/components/ui/Button';
import { ICustomerTokenPayload } from '@/server/customer/ICustomer';
import { withClientAuth } from '@/components/client/withClientAuth';
import { getDeliveryInfoFromPostalCode } from '@/components/client/CityPostalCodeSelector';
import RelayPointsList from '@/components/client/RelayPointsList';

interface DeliveryPageProps {
    authenticatedClient: ICustomerTokenPayload;
}

type DeliveryMethod = 'home' | 'relay' | 'store';

const DeliveryPage: React.FC<DeliveryPageProps> = ({ authenticatedClient }) => {
    const router = useRouter();
    const { basketStorage } = useAppContext();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [homeDeliveryAvailable, setHomeDeliveryAvailable] = useState(false);
    const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<'home' | 'relay' | 'store' | null>(null);
    const [selectedRelayPointId, setSelectedRelayPointId] = useState<string | null>(null);

    // Fonction pour obtenir les informations de livraison d'une adresse
    const getDeliveryInfoFromAddress = (city: string, postalCode: string) => {
        if (city && postalCode) {
            return getDeliveryInfoFromPostalCode(city, postalCode);
        }
        return { zone: '', isAvailable: false, deliveryDays: [] };
    };

    const loadAddresses = useCallback(async () => {
        if (!authenticatedClient) return;

        try {
            setLoading(true);
            const customerAddresses = await backendFetchService.getCustomerAddresses();
            setAddresses(customerAddresses);

            // Sélectionner automatiquement la première adresse si disponible
            if (customerAddresses.length > 0) {
                setSelectedAddressId(customerAddresses[0].id);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des adresses:', err);
            setError('Erreur lors du chargement des adresses');
        } finally {
            setLoading(false);
        }
    }, [authenticatedClient]);

    useEffect(() => {
        if (!authenticatedClient) {
            router.push(ROUTES.CUSTOMER.LOGIN);
            return;
        }

        if (!basketStorage.items || basketStorage.items.length === 0) {
            router.push(ROUTES.PANIER);
            return;
        }

        loadAddresses();
    }, [authenticatedClient, basketStorage.items, router, loadAddresses]);

    const handleAddressSelect = (addressId: string) => {
        setSelectedAddressId(addressId);
        const selectedAddress = addresses.find((addr) => addr.id === addressId);
        if (selectedAddress) {
            const deliveryInfo = getDeliveryInfoFromAddress(selectedAddress.city, selectedAddress.postalCode);
            setHomeDeliveryAvailable(deliveryInfo?.isAvailable || false);
        }
        // Réinitialiser la méthode de livraison sélectionnée
        setSelectedDeliveryMethod(null);
    };

    const handleDeliveryMethodSelect = (method: DeliveryMethod) => {
        setSelectedDeliveryMethod(method);
        // Réinitialiser le point relais sélectionné si on change de méthode
        if (method !== 'relay') {
            setSelectedRelayPointId(null);
        }
    };

    const handleRelayPointSelect = (relayPointId: string) => {
        setSelectedRelayPointId(relayPointId);
    };

    const handleContinueToSummary = () => {
        if (selectedAddressId && selectedDeliveryMethod) {
            // Vérifier si un point relais est sélectionné quand la méthode est "relay"
            if (selectedDeliveryMethod === 'relay' && !selectedRelayPointId) {
                return; // Ne pas continuer si aucun point relais n'est sélectionné
            }

            // Stocker les données de livraison sélectionnées
            const deliveryData = {
                addressId: selectedAddressId,
                method: selectedDeliveryMethod,
                relayPointId: selectedDeliveryMethod === 'relay' ? selectedRelayPointId : null,
            };
            localStorage.setItem('selectedDeliveryData', JSON.stringify(deliveryData));
            router.push(ROUTES.VALIDATION.SUMMARY);
        }
    };

    if (!authenticatedClient) {
        return null;
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p>Chargement des adresses...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-600">
                    <p>{error}</p>
                    <Button
                        onClick={loadAddresses}
                        className="mt-4"
                    >
                        Réessayer
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* En-tête */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h1 className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4">
                            LIVRAISON
                        </h1>
                        <p className="text-base text-[var(--muted-foreground)]">
                            Sélectionnez votre méthode de livraison
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
                        </div>
                    ) : (
                        <>
                            {/* Sélection d'adresse */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="font-secondary font-bold text-xl text-[var(--color-secondary)] mb-4">
                                    Choisir une adresse
                                </h2>

                                {addresses.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-[var(--muted-foreground)] mb-4">Aucune adresse trouvée</p>
                                        <Button
                                            onClick={() => router.push(ROUTES.CUSTOMER.ADDRESSES)}
                                            variant="primary"
                                        >
                                            Ajouter une adresse
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-4">
                                        {addresses.map((address) => {
                                            const deliveryInfo = getDeliveryInfoFromAddress(
                                                address.city,
                                                address.postalCode,
                                            );
                                            return (
                                                <div
                                                    key={address.id}
                                                    className={`border rounded-lg p-4 cursor-pointer transition-all flex-1 min-w-[300px] ${
                                                        selectedAddressId === address.id
                                                            ? 'border-[var(--color-primary)] bg-blue-50 ring-2 ring-[var(--color-primary)] ring-opacity-20'
                                                            : 'border-[var(--border)] hover:border-gray-300'
                                                    }`}
                                                    onClick={() => handleAddressSelect(address.id)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                {address.name && (
                                                                    <span className="text-xs bg-[var(--color-primary)] text-white px-2 py-1 rounded font-semibold">
                                                                        {address.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {(address.firstName || address.lastName) && (
                                                                <p className="text-[var(--foreground)] font-medium mb-1">
                                                                    {address.firstName} {address.lastName}
                                                                </p>
                                                            )}
                                                            <p className="text-[var(--foreground)] mb-1">
                                                                {address.address}
                                                            </p>
                                                            <p className="text-[var(--muted-foreground)] mb-2">
                                                                {address.postalCode} {address.city}, {address.country}
                                                            </p>
                                                            <p className="text-sm text-[var(--muted-foreground)]">
                                                                <strong>Type:</strong>{' '}
                                                                {address.type === 'customer'
                                                                    ? 'Client'
                                                                    : address.type === 'relay'
                                                                      ? 'Point relais'
                                                                      : 'Autre'}
                                                            </p>
                                                            {deliveryInfo && (
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
                                                                        <p className="text-orange-600 flex items-center gap-1">
                                                                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                                                            Livraison à domicile non disponible
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center ml-4">
                                                            <input
                                                                type="radio"
                                                                checked={selectedAddressId === address.id}
                                                                onChange={() => handleAddressSelect(address.id)}
                                                                className="h-4 w-4 text-[var(--color-primary)]"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Options de livraison */}
                            {selectedAddressId && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="font-secondary font-bold text-xl text-[var(--color-secondary)] mb-4">
                                        Sélectionnez votre méthode de livraison
                                    </h2>

                                    <div className="space-y-3">
                                        {/* Livraison à domicile */}
                                        <div
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                                !homeDeliveryAvailable
                                                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                                    : selectedDeliveryMethod === 'home'
                                                      ? 'border-[var(--color-primary)] bg-blue-50 ring-2 ring-[var(--color-primary)] ring-opacity-20'
                                                      : 'border-[var(--border)] hover:border-gray-300'
                                            }`}
                                            onClick={() => homeDeliveryAvailable && handleDeliveryMethodSelect('home')}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <svg
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M16 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V8L16 3Z"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                        <path
                                                            d="M16 3V8H21"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    <div>
                                                        <h3 className="font-semibold text-[var(--foreground)]">
                                                            Livraison à domicile (3€)
                                                        </h3>
                                                        <p className="text-sm text-[var(--muted-foreground)]">
                                                            {homeDeliveryAvailable
                                                                ? 'Livraison directement à votre domicile'
                                                                : 'Non disponible pour cette adresse'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="radio"
                                                    checked={selectedDeliveryMethod === 'home'}
                                                    onChange={() =>
                                                        homeDeliveryAvailable && handleDeliveryMethodSelect('home')
                                                    }
                                                    disabled={!homeDeliveryAvailable}
                                                    className="h-4 w-4 text-[var(--color-primary)]"
                                                />
                                            </div>
                                        </div>

                                        {/* Retrait en point relais */}
                                        <div
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                                selectedDeliveryMethod === 'relay'
                                                    ? 'border-[var(--color-primary)] bg-blue-50 ring-2 ring-[var(--color-primary)] ring-opacity-20'
                                                    : 'border-[var(--border)] hover:border-gray-300'
                                            }`}
                                            onClick={() => handleDeliveryMethodSelect('relay')}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <svg
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M12 2L2 7L12 12L22 7L12 2Z"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                        <path
                                                            d="M2 17L12 22L22 17"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                        <path
                                                            d="M2 12L12 17L22 12"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    <div>
                                                        <h3 className="font-semibold text-[var(--foreground)]">
                                                            Retrait en point relais
                                                        </h3>
                                                        <p className="text-sm text-[var(--muted-foreground)]">
                                                            Récupérez votre commande dans un point relais
                                                        </p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="radio"
                                                    checked={selectedDeliveryMethod === 'relay'}
                                                    onChange={() => handleDeliveryMethodSelect('relay')}
                                                    className="h-4 w-4 text-[var(--color-primary)]"
                                                />
                                            </div>
                                        </div>

                                        {/* Retrait en magasin */}
                                        <div
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                                selectedDeliveryMethod === 'store'
                                                    ? 'border-[var(--color-primary)] bg-blue-50 ring-2 ring-[var(--color-primary)] ring-opacity-20'
                                                    : 'border-[var(--border)] hover:border-gray-300'
                                            }`}
                                            onClick={() => handleDeliveryMethodSelect('store')}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <svg
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                        <path
                                                            d="M9 22V12H15V22"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    <div>
                                                        <h3 className="font-semibold text-[var(--foreground)]">
                                                            Retrait en magasin
                                                        </h3>
                                                        <p className="text-sm text-[var(--muted-foreground)]">
                                                            Récupérez votre commande directement en magasin
                                                        </p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="radio"
                                                    checked={selectedDeliveryMethod === 'store'}
                                                    onChange={() => handleDeliveryMethodSelect('store')}
                                                    className="h-4 w-4 text-[var(--color-primary)]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Liste des points relais - Affichage conditionnel */}
                            {selectedDeliveryMethod === 'relay' && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <RelayPointsList
                                        selectedRelayPointId={selectedRelayPointId}
                                        onRelayPointSelect={handleRelayPointSelect}
                                    />
                                </div>
                            )}

                            {/* Boutons d'action */}
                            {addresses.length > 0 && (
                                <div className="flex justify-between">
                                    <Button
                                        onClick={() => router.push(ROUTES.CUSTOMER.ADDRESSES)}
                                        variant="secondary"
                                    >
                                        Gérer mes adresses
                                    </Button>
                                    <Button
                                        onClick={handleContinueToSummary}
                                        variant="primary"
                                        disabled={
                                            !selectedAddressId ||
                                            !selectedDeliveryMethod ||
                                            (selectedDeliveryMethod === 'relay' && !selectedRelayPointId)
                                        }
                                    >
                                        Voir le résumé
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
    );
};

export default withClientAuth(DeliveryPage);

export async function getServerSideProps() {
    return {
        props: {},
    };
}
