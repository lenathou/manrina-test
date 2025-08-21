/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState } from 'react';
import { useCreateMarketProductSuggestion } from '@/hooks/useMarketProductSuggestion';
import { IMarketProductSuggestionCreateParams } from '@/server/grower/IGrowerRepository';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';


interface MarketProductSuggestionFormProps {
    growerId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const PRODUCT_CATEGORIES = [
    'Légumes',
    'Fruits',
    'Herbes aromatiques',
    'Céréales',
    'Légumineuses',
    'Produits transformés',
    'Autres'
];

const UNITS = [
    { value: 'kg', label: 'Kilogramme (kg)' },
    { value: 'g', label: 'Gramme (g)' },
    { value: 'piece', label: 'Pièce' },
    { value: 'bunch', label: 'Botte' },
    { value: 'liter', label: 'Litre (L)' },
    { value: 'ml', label: 'Millilitre (mL)' },
];

export const MarketProductSuggestionForm: React.FC<MarketProductSuggestionFormProps> = ({
    growerId,
    onSuccess,
    onCancel,
}) => {
    const [formData, setFormData] = useState<Omit<IMarketProductSuggestionCreateParams, 'growerId'>>({
        name: '',
        description: '',
        pricing: '',
        unit: 'kg',
        category: '',
        imageUrl: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const createMutation = useCreateMarketProductSuggestion();

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Le nom du produit est requis';
        }

        if (!formData.description?.trim()) {
            newErrors.description = 'La description est requise';
        }

        if (!formData.category) {
            newErrors.category = 'La catégorie est requise';
        }

        if (!formData.pricing || parseFloat(formData.pricing) <= 0) {
            newErrors.pricing = 'Le prix doit être supérieur à 0';
        }

        if (!formData.unit) {
            newErrors.unit = 'L\'unité est requise';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await createMutation.mutateAsync({ ...formData, growerId } as IMarketProductSuggestionCreateParams);
            
            // Reset form
            setFormData({
                name: '',
                description: '',
                pricing: '',
                unit: 'kg',
                category: '',
                imageUrl: '',
            });
            setErrors({});
            
            onSuccess?.();
        } catch (error) {
            console.error('Error creating market product suggestion:', error);
        }
    };

    const handleInputChange = (field: keyof typeof formData, value: string | number): void => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <span className="text-lg">+</span>
                        Proposer un nouveau produit pour le marché
                    </span>
                    {onCancel && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCancel}
                            className="h-8 w-8 p-0"
                        >
                            <span className="text-sm">×</span>
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {createMutation.isError && (
                    <div className="mb-4 border border-red-200 bg-red-50 p-3 rounded">
                        <div className="text-red-800">
                            Une erreur est survenue lors de la création de la suggestion.
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom du produit *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Ex: Tomates cerises bio"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Catégorie *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => handleInputChange('category', value)}
                            >
                                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Sélectionner une catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRODUCT_CATEGORIES.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && (
                                <p className="text-sm text-red-500">{errors.category}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Décrivez votre produit (origine, méthode de culture, caractéristiques...)"
                            rows={3}
                            className={errors.description ? 'border-red-500' : ''}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-500">{errors.description}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="pricing">Prix proposé (€) *</Label>
                            <Input
                                id="pricing"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.pricing}
                                onChange={(e) => handleInputChange('pricing', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                className={errors.pricing ? 'border-red-500' : ''}
                            />
                            {errors.pricing && (
                                <p className="text-sm text-red-500">{errors.pricing}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unit">Unité *</Label>
                            <Select
                                value={formData.unit}
                                onValueChange={(value) => handleInputChange('unit', value)}
                            >
                                <SelectTrigger className={errors.unit ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Sélectionner une unité" />
                                </SelectTrigger>
                                <SelectContent>
                                    {UNITS.map((unit) => (
                                        <SelectItem key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.unit && (
                                <p className="text-sm text-red-500">{errors.unit}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">URL de l'image (optionnel)</Label>
                        <Input
                            id="imageUrl"
                            value={formData.imageUrl}
                            onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                            placeholder="https://exemple.com/image.jpg"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="flex-1"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                                    Envoi en cours...
                                </>
                            ) : (
                                'Envoyer la suggestion'
                            )}
                        </Button>
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={createMutation.isPending}
                            >
                                Annuler
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};