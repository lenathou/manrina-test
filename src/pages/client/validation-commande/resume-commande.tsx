/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '@/context/AppContext';
import { backendFetchService } from '@/service/BackendFetchService';
import { ROUTES } from '@/router/routes';

import { Button } from '@/components/ui/Button';
import { ICustomerTokenPayload } from '@/server/customer/ICustomer';
// import { withClientAuth } from '@/components/client/withClientAuth'; // Removed - using DynamicLayout authentication
import { Address } from '@/server/customer/Address';
import { numberFormat } from '@/service/NumberFormat';
import { getTotalPriceWithDelivery } from '@/payments/getTotalPrice';
import { DeliveryMethod } from '@/types/DeliveryMethodsType';
import { ContactInfo } from '@/payments/ContactInfo';
import { ICheckoutCreatePayload, anonymizeCheckoutSession } from '@/server/payment/CheckoutSession';
import { checkoutSessionService } from '@/service/CheckoutSessionService';

interface OrderSummaryPageProps {
    authenticatedClient: ICustomerTokenPayload;
}

interface DeliveryData {
    addressId: string;
    method: 'home' | 'relay' | 'store';
    relayPointId?: string | null;
}

const OrderSummaryPage: React.FC<OrderSummaryPageProps> = ({ authenticatedClient }) => {
    const router = useRouter();
    const { basketStorage, resetBasketStorage } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [deliveryMessage, setDeliveryMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);
    const [submissionInProgress, setSubmissionInProgress] = useState(false);
    const [walletAmountToUse, setWalletAmountToUse] = useState(0);
    const [useWallet, setUseWallet] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [walletLoading, setWalletLoading] = useState(true);

    useEffect(() => {
        if (!authenticatedClient) {
            router.push(ROUTES.CUSTOMER.LOGIN);
            return;
        }

        if (!basketStorage.items || basketStorage.items.length === 0) {
            router.push(ROUTES.PANIER);
            return;
        }

        // Récupérer les données de livraison stockées
        const storedDeliveryData = localStorage.getItem('selectedDeliveryData');
        if (!storedDeliveryData) {
            router.push(ROUTES.VALIDATION.DELIVERY);
            return;
        }

        try {
            const parsedData: DeliveryData = JSON.parse(storedDeliveryData);
            setDeliveryData(parsedData);
            loadAddressDetails(parsedData.addressId);
        } catch (err) {
            console.error('Erreur lors du parsing des données de livraison:', err);
            router.push(ROUTES.VALIDATION.DELIVERY);
        }
    }, [authenticatedClient, basketStorage.items, router]);

    // Charger le solde des avoirs depuis l'API
    useEffect(() => {
        const loadWalletBalance = async () => {
            try {
                setWalletLoading(true);
                const response = await fetch('/api/client/wallet-balance', {
                    method: 'GET',
                    credentials: 'include',
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setWalletBalance(data.walletBalance || 0);
                } else {
                    console.error('Erreur lors du chargement du solde des avoirs');
                    setWalletBalance(0);
                }
            } catch (error) {
                console.error('Erreur lors du chargement du solde des avoirs:', error);
                setWalletBalance(0);
            } finally {
                setWalletLoading(false);
            }
        };

        if (authenticatedClient) {
            loadWalletBalance();
        }
    }, [authenticatedClient]);

    const loadAddressDetails = async (addressId: string) => {
        try {
            setLoading(true);
            const addresses = await backendFetchService.getCustomerAddresses();
            const address = addresses.find((addr) => addr.id === addressId);
            if (address) {
                setSelectedAddress(address);
            } else {
                setError('Adresse non trouvée');
            }
        } catch (err) {
            console.error("Erreur lors du chargement de l'adresse:", err);
            setError("Erreur lors du chargement de l'adresse");
        } finally {
            setLoading(false);
        }
    };

    const createDeliveryMethod = (): DeliveryMethod => {
        if (!deliveryData || !selectedAddress) {
            throw new Error('Données de livraison manquantes');
        }

        if (deliveryData.method === 'home') {
            return {
                id: `delivery_${deliveryData.method}_${selectedAddress.id}`, // ID unique pour la méthode de livraison
                name: 'Livraison à domicile',
                basePrice: 3,
                additionalInfo: '',
                location: {
                    postalCode: selectedAddress.postalCode,
                    address: selectedAddress.address,
                    city: selectedAddress.city,
                    phone: null,
                    name: selectedAddress.name || 'Adresse de livraison',
                },
            } as DeliveryMethod;
        }

        // Pour les points relais, on devrait récupérer les détails du point relais
        // Pour l'instant, on utilise une structure basique
        return {
            id: `delivery_${deliveryData.method}_${selectedAddress.id}`, // ID unique pour la méthode de livraison
            name: 'Point relais',
            basePrice: 0,
            additionalInfo: 'Point relais',
            location: {
                postalCode: selectedAddress.postalCode,
                address: 'Point relais sélectionné',
                city: selectedAddress.city,
                phone: null,
                name: 'Point relais',
            },
        } as DeliveryMethod;
    };

    // Le solde des avoirs est maintenant chargé depuis l'API côté serveur

    // Vérifier que les données de livraison sont chargées avant de calculer le total
    const basketTotal =
        deliveryData && selectedAddress
            ? getTotalPriceWithDelivery(basketStorage, createDeliveryMethod())
            : { totalPrice: 0, deliveryCost: 0 };

    const maxWalletUsage = Math.min(walletBalance, basketTotal.totalPrice);
    const finalTotal = Math.max(0, basketTotal.totalPrice - walletAmountToUse);

    const handleWalletToggle = () => {
        if (!useWallet) {
            setUseWallet(true);
            setWalletAmountToUse(maxWalletUsage);
        } else {
            setUseWallet(false);
            setWalletAmountToUse(0);
        }
    };

    const handleWalletAmountChange = (amount: number) => {
        const clampedAmount = Math.max(0, Math.min(amount, maxWalletUsage));
        setWalletAmountToUse(clampedAmount);
        setUseWallet(clampedAmount > 0);
    };

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

    const createContactInfo = (): ContactInfo => {
        // Vérifier que le client authentifié et son email sont disponibles
        if (!authenticatedClient) {
            throw new Error('Client non authentifié');
        }
        if (!authenticatedClient.email) {
            throw new Error('Email du client requis pour créer la commande');
        }

        // Utiliser les données du client authentifié en priorité
        const { firstName, lastName } = splitFullName(authenticatedClient.name || '');

        // Si le nom du client est vide, essayer d'utiliser les données de l'adresse
        const addressFirstName = selectedAddress?.firstName || '';
        const addressLastName = selectedAddress?.lastName || '';

        // Construire le nom complet en utilisant les données du client en priorité
        const fullName =
            firstName && lastName
                ? `${firstName} ${lastName}`.trim()
                : addressFirstName && addressLastName
                  ? `${addressFirstName} ${addressLastName}`.trim()
                  : authenticatedClient.name || authenticatedClient.email;

        return {
            name: fullName,
            email: authenticatedClient.email,
            phone: authenticatedClient.phone || '',
            comments: deliveryMessage,
        };
    };

    const handleValidateOrder = async () => {
        if (!deliveryData || !selectedAddress) return;

        // Protection contre les soumissions multiples rapides
        const currentTime = Date.now();
        const timeSinceLastSubmission = currentTime - lastSubmissionTime;
        
        // Empêcher les soumissions si moins de 2 secondes se sont écoulées
        if (timeSinceLastSubmission < 2000 && lastSubmissionTime > 0) {
            console.log('Soumission trop rapide, ignorée');
            return;
        }

        // Empêcher les soumissions multiples simultanées
        if (submissionInProgress) {
            console.log('Soumission déjà en cours, ignorée');
            return;
        }

        try {
            setIsProcessing(true);
            setSubmissionInProgress(true);
            setLastSubmissionTime(currentTime);
            setError(null); // Réinitialiser les erreurs précédentes

            const deliveryMethod = createDeliveryMethod();
            const contactData = createContactInfo();

            // Debug logs pour comprendre le problème
            console.log('Debug validation:', {
                basketTotalPrice: basketTotal.totalPrice,
                walletAmountToUse,
                finalTotal,
                walletBalance,
                useWallet
            });

            const checkoutCreatePayload: ICheckoutCreatePayload = {
                contact: contactData,
                deliveryMethod: deliveryMethod,
                dayChosen: 'Lundi', // TODO: Récupérer le jour choisi depuis les données stockées
                items: basketStorage.items,
                lastUpdated: basketStorage.lastUpdated,
                deliveryMessage,
                walletAmountUsed: walletAmountToUse,
            };

            // Validation : s'assurer que la commande est soit entièrement couverte par les avoirs, soit a un montant positif à payer
            if (finalTotal === 0 && walletAmountToUse > 0 && walletAmountToUse >= basketTotal.totalPrice) {
                // Commande entièrement payée par les avoirs - traitement direct
                // Créer une session de checkout sans paiement Stripe
                const response = await backendFetchService.createFreeCheckoutSession(checkoutCreatePayload);

                checkoutSessionService.saveCheckoutSession(
                    anonymizeCheckoutSession({ id: response.checkoutSessionId, ...checkoutCreatePayload }),
                );

                // Vider le panier localStorage
                resetBasketStorage();

                // Afficher un message de succès avant la redirection
                alert(
                    '✅ Votre commande a été validée avec succès ! Vous allez être redirigé vers la page de confirmation.',
                );

                // Rediriger directement vers la page de confirmation
                router.push(`/checkout-over?session_id=${response.checkoutSessionId}&status=success`);
            } else {
                // Montant à payer > 0, utiliser le processus de paiement Stripe normal
                const checkoutStatusUrl = `${window.location.origin}/checkout-over`;
                const response = await backendFetchService.createCheckoutSession(
                    checkoutCreatePayload,
                    checkoutStatusUrl,
                );

                const { checkoutSessionId, paymentUrl } = response;
                checkoutSessionService.saveCheckoutSession(
                    anonymizeCheckoutSession({ id: checkoutSessionId, ...checkoutCreatePayload }),
                );

                // Vider le panier localStorage après la création réussie de la session
                resetBasketStorage();

                // Rediriger vers la page de paiement
                if (paymentUrl) {
                    window.open(paymentUrl, '_blank');
                }
            }
        } catch (err) {
            console.error('Erreur lors de la validation de la commande:', err);
            setError('Erreur lors de la validation de la commande');
        } finally {
            setIsProcessing(false);
            setSubmissionInProgress(false);
        }
    };

    if (!authenticatedClient) {
        return null;
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p>Chargement du résumé...</p>
                </div>
            </div>
        );
    }

    if (error || !deliveryData || !selectedAddress) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-600">
                    <p>{error || 'Données de livraison manquantes'}</p>
                    <Button
                        onClick={() => router.push(ROUTES.VALIDATION.DELIVERY)}
                        className="mt-4"
                    >
                        Retour à la sélection de livraison
                    </Button>
                </div>
            </div>
        );
    }

    const deliveryMethod = createDeliveryMethod();
    const contactData = createContactInfo();

    return (
        <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* En-tête */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h1 className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4">
                            RÉSUMÉ DE LA COMMANDE
                        </h1>
                        <p className="text-base text-[var(--muted-foreground)]">
                            Vérifiez les détails de votre commande avant de procéder au paiement
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {/* Section Livraison */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="font-secondary font-bold text-xl text-[var(--color-secondary)] mb-4">
                            {deliveryData.method === 'home' ? 'Livraison à domicile' : 'Retrait en point relais'}
                        </h2>
                        <div className="space-y-2">
                            <p className="text-[var(--foreground)]">
                                <span className="font-medium">Jour de livraison:</span> Lundi{' '}
                                {/* TODO: Récupérer le jour choisi */}
                            </p>
                            {deliveryMethod.location && (
                                <div className="space-y-1">
                                    <p className="text-[var(--foreground)]">{deliveryMethod.location.address}</p>
                                    <p className="text-[var(--foreground)]">
                                        {deliveryMethod.location.postalCode} {deliveryMethod.location.city}
                                    </p>
                                    {deliveryMethod.location.phone && (
                                        <p className="text-[var(--foreground)]">{deliveryMethod.location.phone}</p>
                                    )}
                                </div>
                            )}
                            <p className="text-[var(--foreground)]">
                                <span className="font-medium">Frais de livraison:</span>{' '}
                                {numberFormat.toPrice(deliveryMethod.basePrice || 0)}
                            </p>
                        </div>
                    </div>

                    {/* Section Contact */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="font-secondary font-bold text-xl text-[var(--color-secondary)] mb-4">
                            Informations de contact
                        </h2>
                        <div className="space-y-2">
                            <p className="text-[var(--foreground)]">
                                <span className="font-medium">Nom:</span> {contactData.name}
                            </p>
                            <p className="text-[var(--foreground)]">
                                <span className="font-medium">Email:</span> {contactData.email}
                            </p>
                            {contactData.phone && (
                                <p className="text-[var(--foreground)]">
                                    <span className="font-medium">Téléphone:</span> {contactData.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Message de livraison */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="font-secondary font-bold text-xl text-[var(--color-secondary)] mb-4">
                            Message pour le livreur (optionnel)
                        </h2>
                        <textarea
                            value={deliveryMessage}
                            onChange={(e) => setDeliveryMessage(e.target.value)}
                            placeholder="Instructions spéciales pour la livraison..."
                            className="w-full p-3 border border-[var(--border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                            rows={3}
                        />
                    </div>

                    {/* Contenu du panier */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="font-secondary font-bold text-xl text-[var(--color-secondary)] mb-4">
                            Contenu du panier
                        </h2>
                        <div className="space-y-4">
                            {basketStorage.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-b-0"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-[var(--foreground)]">
                                            {item.product.name} {item.productVariant.optionSet}{' '}
                                            {item.productVariant.optionValue}
                                        </p>
                                        <p className="text-sm text-[var(--muted-foreground)]">
                                            {numberFormat.toPrice(item.price)} × {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-[var(--foreground)]">
                                            {numberFormat.toPrice(item.price * item.quantity)}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Utilisation du portefeuille */}
                            {walletBalance > 0 && (
                                <div className="pt-4 border-t border-[var(--border)]">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-[var(--foreground)]">
                                                Solde disponible:
                                            </span>
                                            <span className="text-[var(--color-primary)] font-medium">
                                                {numberFormat.toPrice(walletBalance)}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id="useWallet"
                                                checked={useWallet}
                                                onChange={handleWalletToggle}
                                                className="w-4 h-4 text-[var(--color-primary)] border-[var(--border)] rounded focus:ring-[var(--color-primary)]"
                                            />
                                            <label
                                                htmlFor="useWallet"
                                                className="text-[var(--foreground)] font-medium"
                                            >
                                                Utiliser mon solde d'avoirs
                                            </label>
                                        </div>

                                        {useWallet && (
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-[var(--foreground)]">
                                                    Montant à utiliser (max: {numberFormat.toPrice(maxWalletUsage)})
                                                </label>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={maxWalletUsage}
                                                        step="0.01"
                                                        value={walletAmountToUse}
                                                        onChange={(e) =>
                                                            handleWalletAmountChange(parseFloat(e.target.value) || 0)
                                                        }
                                                        className="flex-1 p-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                                    />
                                                    <span className="text-[var(--muted-foreground)]">€</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
                                                    <span>
                                                        Montant utilisé: {numberFormat.toPrice(walletAmountToUse)}
                                                    </span>
                                                    <span>
                                                        Solde restant:{' '}
                                                        {numberFormat.toPrice(walletBalance - walletAmountToUse)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Total */}
                            <div className="pt-4 border-t border-[var(--border)]">
                                {walletAmountToUse > 0 && (
                                    <div className="space-y-2 mb-3">
                                        <div className="flex justify-between items-center text-[var(--muted-foreground)]">
                                            <span>Sous-total:</span>
                                            <span>{numberFormat.toPrice(basketTotal.totalPrice)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[var(--muted-foreground)]">
                                            <span>Avoirs utilisés:</span>
                                            <span>-{numberFormat.toPrice(walletAmountToUse)}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Total à payer:</span>
                                    <span className="text-[var(--color-primary)]">
                                        {numberFormat.toPrice(finalTotal)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={() => router.push(ROUTES.VALIDATION.DELIVERY)}
                                variant="secondary"
                                className="flex-1"
                            >
                                Modifier la livraison
                            </Button>
                            <Button
                                onClick={handleValidateOrder}
                                variant="primary"
                                className="flex-1"
                                disabled={isProcessing}
                            >
                                {isProcessing
                                    ? 'Traitement...'
                                    : finalTotal <= 0
                                      ? 'VALIDER LA COMMANDE'
                                      : `Valider ma commande (${numberFormat.toPrice(finalTotal)})`}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default OrderSummaryPage;
