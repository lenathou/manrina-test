/* eslint-disable react/no-unescaped-entities */
import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { useToast } from '@/components/ui/Toast';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/Card';
import { formatDateLong } from '@/utils/dateUtils';
import { Prisma, Assignment } from '@prisma/client';
import { useAssignments } from '@/hooks/useAssignments';

type MarketProduct = Prisma.MarketProductGetPayload<{
    include: {
        grower: true;
        marketSession: true;
    };
}>;

type MarketSession = {
    id: string;
    name: string;
    date: Date | string;
    location: string | null;
    status: string;
};

type Unit = {
    id: string;
    symbol: string;
    name: string;
};

interface MarketProductValidationModalProps {
    isOpen: boolean;
    onClose: () => void;
    standProducts: MarketProduct[];
    selectedSession: MarketSession | null;
    units: Unit[];
    growerId: string;
    onProductToggle: (productId: string, isActive: boolean) => Promise<boolean>;
    onValidateList: (sessionId: string, products: MarketProduct[]) => Promise<boolean>;
    onConfirmParticipation?: (sessionId: string) => Promise<boolean>;
    isSubmitting?: boolean;
}

export function MarketProductValidationModal({
    isOpen,
    onClose,
    standProducts,
    selectedSession,
    onProductToggle,
    onValidateList,
    onConfirmParticipation,
}: MarketProductValidationModalProps) {
    const { success, error } = useToast();
    const [localProductStates, setLocalProductStates] = useState<Record<string, boolean>>({});
    const [isTogglingProduct, setIsTogglingProduct] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const { assignments } = useAssignments();
    const [availableAssignments, setAvailableAssignments] = useState<Assignment[]>([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
    const [initialAssignmentId, setInitialAssignmentId] = useState<string>('');

    // Initialiser les états locaux des produits
    React.useEffect(() => {
        if (isOpen && standProducts.length > 0) {
            const initialStates: Record<string, boolean> = {};
            standProducts.forEach(product => {
                initialStates[product.id] = product.isActive;
            });
            setLocalProductStates(initialStates);
        }
    }, [isOpen, standProducts]);

    // Charger l'affectation actuelle au moment de l'ouverture
    React.useEffect(() => {
        if (!isOpen) return;
        (async () => {
            try {
                const res = await fetch('/api/grower/profile');
                if (res.ok) {
                    const data = await res.json();
                    const currentId = data?.grower?.assignmentId || '';
                    setSelectedAssignmentId(currentId);
                    setInitialAssignmentId(currentId);
                }
            } catch (_) {
                // no-op
            }
        })();
    }, [isOpen]);

    // Charger la liste des affectations (fallback local si le hook est vide)
    React.useEffect(() => {
        if (!isOpen) return;
        if (assignments && assignments.length > 0) {
            setAvailableAssignments(assignments);
            return;
        }
        (async () => {
            try {
                const resp = await fetch('/api/admin/assignments');
                if (resp.ok) {
                    const data = await resp.json();
                    setAvailableAssignments(data || []);
                }
            } catch (_) {
                setAvailableAssignments([]);
            }
        })();
    }, [isOpen, assignments]);

    // Filtrer les produits actifs
    const activeProducts = useMemo(() => {
        return standProducts.filter(product => {
            const localState = localProductStates[product.id];
            return localState !== undefined ? localState : product.isActive;
        });
    }, [standProducts, localProductStates]);

    // Gérer le toggle d'un produit
    const handleProductToggle = useCallback(async (productId: string, newState: boolean) => {
        setIsTogglingProduct(productId);
        try {
            const result = await onProductToggle(productId, newState);
            if (result) {
                setLocalProductStates(prev => ({
                    ...prev,
                    [productId]: newState
                }));
            } else {
                error('Erreur lors de la mise à jour du produit');
            }
        } catch (err) {
            error('Erreur lors de la mise à jour du produit');
        } finally {
            setIsTogglingProduct(null);
        }
    }, [onProductToggle, error]);

    // Valider la liste pour la session
    const handleValidateList = useCallback(async () => {
        if (!selectedSession || activeProducts.length === 0) return;

        setIsValidating(true);
        try {
            // Mettre à jour l'affectation si elle a changé
            if (selectedAssignmentId !== initialAssignmentId) {
                const resp = await fetch('/api/grower/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ assignmentId: selectedAssignmentId || null }),
                });
                if (!resp.ok) {
                    error("Erreur lors de la mise à jour de l'affectation");
                    setIsValidating(false);
                    return;
                }
            }
            // D'abord confirmer la participation si la fonction est fournie
            if (onConfirmParticipation) {
                const participationResult = await onConfirmParticipation(selectedSession.id);
                if (!participationResult) {
                    error('Erreur lors de la confirmation de la participation');
                    return;
                }
            }

            // Ensuite valider la liste
            const result = await onValidateList(selectedSession.id, activeProducts);
            if (result) {
                success(`Participation confirmée et liste validée avec succès pour la session "${selectedSession.name}"!`);
                onClose();
            } else {
                error('Erreur lors de la validation de la liste');
            }
        } catch (err) {
            error('Erreur lors de la validation de la liste');
        } finally {
            setIsValidating(false);
        }
    }, [selectedSession, activeProducts, onValidateList, onConfirmParticipation, success, onClose, error, selectedAssignmentId, initialAssignmentId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="bg-background max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <CardHeader className="bg-secondary text-white">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold text-white">
                            Validation de ma liste de produits
                        </CardTitle>
                        <button
                            onClick={onClose}
                            className="text-gray-300 hover:text-white transition-colors"
                            disabled={isValidating}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {selectedSession && (
                        <div className="mt-2 text-sm text-white">
                            <p><strong>Session:</strong> {selectedSession.name}</p>
                            <p><strong>Date:</strong> {formatDateLong(selectedSession.date)}</p>
                            {selectedSession.location && (
                                <p><strong>Lieu:</strong> {selectedSession.location}</p>
                            )}
                        </div>
                    )}
                </CardHeader>

                <CardContent className="max-h-96 overflow-y-auto">
                    {/* Affectation du producteur */}
                    <div className="mb-4">
                        <Label htmlFor="assignment-select" className="text-sm font-medium text-gray-700">
                            Mon affectation sur le marché
                        </Label>
                        <select
                            id="assignment-select"
                            className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            value={selectedAssignmentId}
                            onChange={(e) => {
                                const newId = e.target.value;
                                setSelectedAssignmentId(newId);
                            }}
                            disabled={isValidating}
                        >
                            <option value="">Aucune affectation</option>
                            {availableAssignments.map((a: Assignment) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>
                    {standProducts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Aucun produit dans votre stand.</p>
                            <p className="text-sm mt-1">Ajoutez des produits à votre stand pour pouvoir les envoyer à une session.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Mes produits ({standProducts.length})
                                </h3>
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium text-green-600">{activeProducts.length}</span> actif{activeProducts.length > 1 ? 's' : ''}
                                </div>
                            </div>

                            {standProducts.map((product) => {
                                const isActive = localProductStates[product.id] !== undefined 
                                    ? localProductStates[product.id] 
                                    : product.isActive;
                                const isToggling = isTogglingProduct === product.id;

                                return (
                                    <div 
                                        key={product.id} 
                                        className={`border rounded-lg p-4 transition-all ${
                                            isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h4 className={`font-medium ${
                                                        isActive ? 'text-gray-900' : 'text-gray-500'
                                                    }`}>
                                                        {product.name}
                                                    </h4>
                                                    <span className={`text-lg font-semibold ${
                                                        isActive ? 'text-green-600' : 'text-gray-400'
                                                    }`}>
                                                        {product.price.toString()}€
                                                        {product.unit && (
                                                            <span className="text-sm font-normal">/{product.unit}</span>
                                                        )}
                                                    </span>
                                                </div>
                                                {product.description && (
                                                    <p className={`text-sm mt-1 ${
                                                        isActive ? 'text-gray-600' : 'text-gray-400'
                                                    }`}>
                                                        {product.description}
                                                    </p>
                                                )}
                                                <div className={`flex gap-4 text-xs mt-2 ${
                                                    isActive ? 'text-gray-500' : 'text-gray-400'
                                                }`}>
                                                    {product.stock !== null && (
                                                        <span>Stock: {product.stock}</span>
                                                    )}
                                                    {product.category && (
                                                        <span>Catégorie: {product.category}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Label htmlFor={`product-${product.id}`} className="text-sm font-medium">
                                                    {isActive ? 'Actif' : 'Inactif'}
                                                </Label>
                                                <Switch
                                                    checked={isActive}
                                                    onCheckedChange={(checked) => handleProductToggle(product.id, checked)}
                                                    disabled={isToggling || isValidating}
                                                />
                                                {isToggling && (
                                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="border-t border-gray-200 bg-gray-50">
                    {selectedSession && activeProducts.length > 0 && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium">Attention</p>
                                    <p>
                                        Valider votre liste marquera automatiquement votre participation 
                                        à la session <strong>"{selectedSession.name}"</strong> 
                                        du {formatDateLong(selectedSession.date)}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={isValidating}
                            className="w-full sm:w-auto"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleValidateList}
                            disabled={!selectedSession || activeProducts.length === 0 || isValidating}
                            className="w-full sm:w-auto"
                        >
                            {isValidating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Validation en cours...
                                </>
                            ) : (
                                `Valider ma liste pour la session (${activeProducts.length} produit${activeProducts.length > 1 ? 's' : ''})`
                            )}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

export default MarketProductValidationModal;
