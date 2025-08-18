import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MarketSessionWithProducts, CreateMarketSessionRequest, UpdateMarketSessionRequest } from '../../../types/market';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

interface SessionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateMarketSessionRequest | UpdateMarketSessionRequest) => void;
    session?: MarketSessionWithProducts | null;
    title: string;
}

export default function SessionForm({ isOpen, onClose, onSubmit, session, title }: SessionFormProps) {
    const [formData, setFormData] = useState<CreateMarketSessionRequest>({
        name: '',
        date: '',
        status: 'UPCOMING',
        description: '',
        location: '',
        startTime: '',
        endTime: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Remplir le formulaire avec les données de la session à modifier
    useEffect(() => {
        if (session) {
            setFormData({
                name: session.name || '',
                date: session.date ? new Date(session.date).toISOString().split('T')[0] : '',
                status: session.status || 'UPCOMING',
                description: session.description || '',
                location: session.location || '',
                startTime: session.startTime ? new Date(session.startTime).toTimeString().slice(0, 5) : '',
                endTime: session.endTime ? new Date(session.endTime).toTimeString().slice(0, 5) : '',
            });
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
            });
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
            const selectedDate = new Date(formData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            if (session) {
                // C'est une modification, inclure l'ID
                onSubmit({ ...formData, id: session.id } as UpdateMarketSessionRequest);
            } else {
                // C'est une création
                onSubmit(formData as CreateMarketSessionRequest);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Effacer l'erreur pour ce champ
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
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

                    {/* Boutons */}
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="secondary"
                            className="w-full sm:w-auto order-2 sm:order-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full sm:w-auto order-1 sm:order-2"
                        >
                            {session ? 'Modifier' : 'Créer'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
