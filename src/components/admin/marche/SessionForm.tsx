import React, { useState, useEffect } from 'react';
import { MarketSessionWithProducts, CreateMarketSessionRequest, UpdateMarketSessionRequest } from '../../../types/market';

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-4"
                >
                    {/* Nom */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Nom de la session *
                        </label>
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
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Date */}
                    <div>
                        <label
                            htmlFor="date"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Date *
                        </label>
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
                        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                    </div>

                    {/* Statut */}
                    <div>
                        <label
                            htmlFor="status"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Statut
                        </label>
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
                        <label
                            htmlFor="location"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Lieu
                        </label>
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="startTime"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Heure de début
                            </label>
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
                            <label
                                htmlFor="endTime"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Heure de fin
                            </label>
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
                            {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Description
                        </label>
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
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            {session ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
