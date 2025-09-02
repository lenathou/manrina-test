import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MarketSessionWithProducts, CreateMarketSessionRequest, UpdateMarketSessionRequest, DuplicateError } from '@/types/market';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import PartnerSelector from './PartnerSelector';
import { Partner } from '@prisma/client';
import { formatDateForInput, formatTimeForInput, isDateInPast } from '@/utils/dateUtils';

interface SessionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateMarketSessionRequest | UpdateMarketSessionRequest) => Promise<void>;
    session?: MarketSessionWithProducts | null;
    title: string;
}

export default function SessionForm({ isOpen, onClose, onSubmit, session, title }: SessionFormProps) {
    const { success } = useToast();
    
    const [formData, setFormData] = useState<CreateMarketSessionRequest>({
        name: '',
        date: '',
        status: 'UPCOMING',
        description: '',
        location: '',
        startTime: '',
        endTime: '',
        partnerIds: [],
    });

    const [selectedPartners, setSelectedPartners] = useState<Partner[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [duplicateError, setDuplicateError] = useState<{
        message: string;
        details?: string;
        existingSessionId?: string;
    } | null>(null);

    // Remplir le formulaire avec les données de la session à modifier
    useEffect(() => {
        if (session) {
            const sessionPartners = session.partners?.map(sp => sp.partner) || [];
            setFormData({
                name: session.name || '',
                date: session.date ? formatDateForInput(session.date) : '',
                status: session.status || 'UPCOMING',
                description: session.description || '',
                location: session.location || '',
                startTime: session.startTime ? formatTimeForInput(session.startTime) : '',
                endTime: session.endTime ? formatTimeForInput(session.endTime) : '',
                partnerIds: sessionPartners.map(partner => partner.id),
            });
            setSelectedPartners(sessionPartners);
        } else {
            // Réinitialiser le formulaire pour une nouvelle session
            setFormData({
                name: '',
                date: '',
                status: 'UPCOMING',
                description: '',
                location: '',
                startTime: '',
                endTime: '',
                partnerIds: [],
            });
            setSelectedPartners([]);
        }
        setErrors({});
    }, [session, isOpen]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Le nom est requis';
        }

        if (!formData.date) {
            newErrors.date = 'La date est requise';
        } else {
            if (isDateInPast(formData.date)) {
                newErrors.date = 'La date ne peut pas être dans le passé';
            }
        }

        if (formData.startTime && formData.endTime) {
            if (formData.startTime >= formData.endTime) {
                newErrors.endTime = "L'heure de fin doit être après l'heure de début";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        setSubmitError(null);
        setDuplicateError(null);
        
        try {
            if (session) {
                // C'est une modification, inclure l'ID
                await onSubmit({ ...formData, id: session.id } as UpdateMarketSessionRequest);
                success(`Session "${formData.name}" modifiée avec succès !`);
            } else {
                // C'est une création
                await onSubmit(formData as CreateMarketSessionRequest);
                success(`Session "${formData.name}" créée avec succès !`);
            }
            onClose();
        } catch (error) {
            if (error instanceof Error && 'isDuplicate' in error) {
                // Gestion spéciale pour les erreurs de duplication
                const duplicateError = error as DuplicateError;
                setDuplicateError({
                    message: duplicateError.message,
                    details: duplicateError.details,
                    existingSessionId: duplicateError.existingSessionId
                });
            } else {
                setSubmitError(error instanceof Error ? error.message : 'Une erreur est survenue');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Effacer l'erreur pour ce champ
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        
        // Effacer les erreurs de soumission quand l'utilisateur modifie le formulaire
        if (submitError) setSubmitError(null);
        if (duplicateError) setDuplicateError(null);
    };

    const handlePartnersChange = (partners: Partner[]) => {
        const partnerIds = partners.map(partner => partner.id);
        setSelectedPartners(partners);
        setFormData((prev) => ({ ...prev, partnerIds }));
        
        // Effacer les erreurs de soumission quand l'utilisateur modifie le formulaire
        if (submitError) setSubmitError(null);
        if (duplicateError) setDuplicateError(null);
    };

    const handleViewExistingSession = () => {
        if (duplicateError?.existingSessionId) {
            // Fermer le modal actuel et naviguer vers la session existante
            onClose();
            // Ici, on pourrait émettre un événement ou utiliser un callback pour naviguer
            // vers la session existante dans la liste
            console.log('Navigate to existing session:', duplicateError.existingSessionId);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <Text variant="h4" className="text-lg sm:text-xl font-semibold text-gray-900">{title}</Text>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-4 sm:p-6 space-y-4"
                >
                    {/* Nom */}
                    <div>
                        <Text variant="small" className="block text-sm font-medium text-gray-700 mb-1">
                            Nom de la session *
                        </Text>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Ex: Marché du 15 janvier 2024"
                        />
                        {errors.name && <Text variant="small" className="text-red-500 text-sm mt-1">{errors.name}</Text>}
                    </div>

                    {/* Date */}
                    <div>
                        <Text variant="small" className="block text-sm font-medium text-gray-700 mb-1">
                            Date *
                        </Text>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.date ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.date && <Text variant="small" className="text-red-500 text-sm mt-1">{errors.date}</Text>}
                    </div>

                    {/* Statut */}
                    <div>
                        <Text variant="small" className="block text-sm font-medium text-gray-700 mb-1">
                            Statut
                        </Text>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="UPCOMING">À venir</option>
                            <option value="ACTIVE">Actif</option>
                            <option value="COMPLETED">Terminé</option>
                            <option value="CANCELLED">Annulé</option>
                        </select>
                    </div>

                    {/* Lieu */}
                    <div>
                        <Text variant="small" className="block text-sm font-medium text-gray-700 mb-1">
                            Lieu
                        </Text>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Place du marché, Fort-de-France"
                        />
                    </div>

                    {/* Heures */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Text variant="small" className="block text-sm font-medium text-gray-700 mb-1">
                                Heure de début
                            </Text>
                            <input
                                type="time"
                                id="startTime"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <Text variant="small" className="block text-sm font-medium text-gray-700 mb-1">
                                Heure de fin
                            </Text>
                            <input
                                type="time"
                                id="endTime"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.endTime ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.endTime && <Text variant="small" className="text-red-500 text-sm mt-1">{errors.endTime}</Text>}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <Text variant="small" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </Text>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Description optionnelle de la session..."
                        />
                    </div>

                    {/* Sélection des partenaires */}
                    <PartnerSelector
                        selectedPartners={selectedPartners}
                        onPartnersChange={handlePartnersChange}
                    />

                    {/* Message d'erreur de duplication */}
                    {duplicateError && (
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <h3 className="text-sm font-medium text-amber-800">
                                        Session déjà existante
                                    </h3>
                                    <div className="mt-2 text-sm text-amber-700">
                                        <p>{duplicateError.message}</p>
                                        {duplicateError.details && (
                                            <p className="mt-1">{duplicateError.details}</p>
                                        )}
                                    </div>
                                    <div className="mt-3 flex space-x-3">
                                        <Button
                                            type="button"
                                            onClick={handleViewExistingSession}
                                            variant="secondary"
                                            className="text-xs px-3 py-1 bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                                        >
                                            Voir la session existante
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => setDuplicateError(null)}
                                            variant="secondary"
                                            className="text-xs px-3 py-1 bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                                        >
                                            Modifier les détails
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Message d'erreur générale */}
                    {submitError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <Text variant="small" className="text-red-600">
                                {submitError}
                            </Text>
                        </div>
                    )}

                    {/* Boutons */}
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="secondary"
                            className="w-full sm:w-auto order-2 sm:order-1"
                            disabled={isSubmitting}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full sm:w-auto order-1 sm:order-2 flex items-center justify-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {session ? 'Modification...' : 'Création...'}
                                </>
                            ) : (
                                session ? 'Modifier' : 'Créer'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
