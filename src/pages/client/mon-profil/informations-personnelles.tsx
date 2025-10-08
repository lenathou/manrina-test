/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';

import { ICustomerTokenPayload, ICustomerUpdateParams } from '@/server/customer/ICustomer';
import { backendFetchService } from '@/service/BackendFetchService';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui';

interface ProfileFormData {
    name: string;
    email: string;
    phone: string;
}

function ClientProfile({ authenticatedClient }: { authenticatedClient: ICustomerTokenPayload }) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<ProfileFormData>({
        name: authenticatedClient?.name || '',
        email: authenticatedClient?.email || '',
        phone: authenticatedClient?.phone || '',
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const updateParams: ICustomerUpdateParams = {
                id: authenticatedClient.id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
            };

            await backendFetchService.updateCustomer(updateParams);
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
            setIsEditing(false);
            
            // Optionnel : recharger la page pour mettre à jour les données
            setTimeout(() => {
                router.reload();
            }, 1500);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil. Veuillez réessayer.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: authenticatedClient?.name || '',
            email: authenticatedClient?.email || '',
            phone: authenticatedClient?.phone || '',
        });
        setIsEditing(false);
        setMessage(null);
    };

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="p-6">
                <h2 className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4">
                    Mon profil
                </h2>
                <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
                    Gérez vos informations personnelles et vos préférences de compte.
                </p>
            </div>

            {/* Message de feedback */}
            {message && (
                <div className={`p-4 rounded-lg ${
                    message.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            {/* Informations du profil */}
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-secondary font-bold text-xl sm:text-2xl text-[var(--color-secondary)]">
                        Informations personnelles
                    </h3>
                    {!isEditing && (
                        <Button
                            onClick={() => setIsEditing(true)}
                        >
                            Modifier
                        </Button>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                                Nom complet *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full p-3 border bg-white border-[var(--muted)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                placeholder="Votre nom complet"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                                Adresse e-mail *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full p-3 border bg-white border-[var(--muted)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                placeholder="votre@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                                Numéro de téléphone *
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                className="w-full p-3 bg-white border border-[var(--muted)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                placeholder="Votre numéro de téléphone"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCancel}
                                disabled={isLoading}
                                variant='danger'
                            >
                                Annuler
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                                    Nom complet
                                </label>
                                <p className="font-semibold text-base text-[var(--color-secondary)]">
                                    {authenticatedClient?.name || 'Non renseigné'}
                                </p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                                    Adresse e-mail
                                </label>
                                <p className="font-semibold text-base text-[var(--color-secondary)]">
                                    {authenticatedClient?.email || 'Non renseigné'}
                                </p>
                            </div>
                            
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                                    Numéro de téléphone
                                </label>
                                <p className="font-semibold text-base text-[var(--color-secondary)]">
                                    {authenticatedClient?.phone || 'Non renseigné'}
                                </p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                                    Identifiant client
                                </label>
                                <p className="font-semibold text-[var(--color-secondary)] font-mono text-sm">
                                    {authenticatedClient?.id || 'Non disponible'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}

export default ClientProfile;