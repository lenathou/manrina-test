import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useMarketSessions, useMarketProducts, useProductCopy } from '../../../hooks/useMarket';
import {
    MarketSessionWithProducts,
    MarketProduct,
    CreateMarketSessionRequest,
    UpdateMarketSessionRequest,
    CreateMarketProductRequest,
    UpdateMarketProductRequest,
    CopyProductRequest,
} from '../../../types/market';
import ConfirmDialog from '../../common/ConfirmDialog';
import SessionForm from './SessionForm';
import ProductForm from './ProductForm';
import GrowersModal from './GrowersModal';

interface MarketManagementProps {
    className?: string;
}

export default function MarketManagement({ className = '' }: MarketManagementProps) {
    const [activeTab, setActiveTab] = useState<'sessions' | 'products'>('sessions');
    const [selectedSession, setSelectedSession] = useState<MarketSessionWithProducts | null>(null);
    const [showCreateSession, setShowCreateSession] = useState(false);
    const [showEditSession, setShowEditSession] = useState(false);
    const [showCreateProduct, setShowCreateProduct] = useState(false);
    const [showEditProduct, setShowEditProduct] = useState(false);
    const [productToEdit, setProductToEdit] = useState<MarketProduct | null>(null);
    const [sessionToEdit, setSessionToEdit] = useState<MarketSessionWithProducts | null>(null);
    const [showGrowersModal, setShowGrowersModal] = useState(false);
    const [selectedSessionForGrowers, setSelectedSessionForGrowers] = useState<MarketSessionWithProducts | null>(null);

    // États pour les dialogues de confirmation
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        type: 'session' | 'product';
        id: string;
        name: string;
    }>({ isOpen: false, type: 'session', id: '', name: '' });

    const {
        sessions,
        loading: sessionsLoading,
        error: sessionsError,
        refetch: refetchSessions,
        createSession,
        updateSession,
    } = useMarketSessions();

    // Stabiliser l'objet filters pour éviter les re-rendus inutiles
    const productFilters = useMemo(
        () => ({
            sessionId: selectedSession?.id || undefined,
        }),
        [selectedSession],
    );

    const {
        products,
        loading: productsLoading,
        error: productsError,
        createProduct,
        updateProduct,
        deleteProduct,
    } = useMarketProducts(productFilters);

    const { copyProduct, loading: copyLoading } = useProductCopy();

    const handleCreateSession = async (sessionData: CreateMarketSessionRequest) => {
        try {
            await createSession(sessionData);
            setShowCreateSession(false);
        } catch (error) {
            console.error('Error creating session:', error);
        }
    };

    const handleEditSession = async (sessionData: UpdateMarketSessionRequest) => {
        try {
            await updateSession(sessionData);
            setShowEditSession(false);
            setSessionToEdit(null);
        } catch (error) {
            console.error('Erreur lors de la modification de la session:', error);
        }
    };

    const handleEditProduct = async (productData: UpdateMarketProductRequest) => {
        try {
            await updateProduct(productData);
            setShowEditProduct(false);
            setProductToEdit(null);
        } catch (error) {
            console.error('Erreur lors de la modification du produit:', error);
        }
    };

    const handleCreateOrUpdateProduct = async (data: CreateMarketProductRequest | UpdateMarketProductRequest) => {
        if ('id' in data) {
            // C'est une mise à jour
            await handleEditProduct(data as UpdateMarketProductRequest);
        } else {
            // C'est une création
            await handleCreateProduct(data as CreateMarketProductRequest);
        }
    };

    const handleCreateOrUpdateSession = async (data: CreateMarketSessionRequest | UpdateMarketSessionRequest) => {
        if ('id' in data) {
            // C'est une mise à jour
            await handleEditSession(data as UpdateMarketSessionRequest);
        } else {
            // C'est une création
            await handleCreateSession(data as CreateMarketSessionRequest);
        }
    };

    const handleCreateProduct = async (productData: CreateMarketProductRequest) => {
        try {
            await createProduct(productData);
            setShowCreateProduct(false);
        } catch (error) {
            console.error('Error creating product:', error);
        }
    };

    const handleCreateAutoMarket = async () => {
        try {
            const response = await fetch('/api/market/auto-sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Recharger les sessions
                await refetchSessions();
            } else {
                const error = await response.json();
                alert(`Erreur: ${error.error}`);
            }
        } catch (error) {
            console.error('Error creating auto market:', error);
            alert('Erreur lors de la création du marché automatique');
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) return;

        setConfirmDialog({
            isOpen: true,
            type: 'session',
            id: sessionId,
            name: session.name,
        });
    };

    const confirmDeleteSession = async () => {
        try {
            const { id } = confirmDialog;

            const response = await fetch(`/api/market/sessions?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Session supprimée avec succès!');
                // Recharger les sessions
                await refetchSessions();
            } else {
                const error = await response.json();
                alert(`Erreur: ${error.error}`);
            }
        } catch (error) {
            console.error('Error deleting session:', error);
            alert('Erreur lors de la suppression');
        } finally {
            setConfirmDialog({ isOpen: false, type: 'session', id: '', name: '' });
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return;

        setConfirmDialog({
            isOpen: true,
            type: 'product',
            id: productId,
            name: product.name,
        });
    };

    const confirmDeleteProduct = async () => {
        try {
            await deleteProduct(confirmDialog.id);
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Erreur lors de la suppression du produit');
        } finally {
            setConfirmDialog({ isOpen: false, type: 'session', id: '', name: '' });
        }
    };

    const handleCopyToDelivery = async (marketProduct: MarketProduct) => {
        try {
            const copyData: CopyProductRequest = {
                sourceType: 'MARKET',
                targetType: 'DELIVERY',
                sourceProductId: marketProduct.id,
                copiedBy: 'admin', // À remplacer par l'ID de l'utilisateur connecté
                notes: `Copié depuis le marché "${marketProduct.marketSession.name}"`,
            };

            await copyProduct(copyData);
            alert('Produit copié vers le système de livraison avec succès!');
        } catch (error) {
            console.error('Error copying product:', error);
            alert('Erreur lors de la copie du produit');
        }
    };

    const formatDate = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    return (
        <div className={`bg-white rounded-lg shadow-lg ${className}`}>
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900">Gestion du Marché</h2>
                <p className="text-gray-600 mt-2">Gérez les sessions de marché et les produits associés</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'sessions'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Sessions de Marché
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'products'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Produits du Marché
                    </button>
                </nav>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'sessions' && (
                    <div>
                        {/* Sessions Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">
                                Sessions de Marché ({sessions.length})
                            </h3>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => handleCreateAutoMarket()}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Créer Marché Auto
                                </button>
                                <button
                                    onClick={() => setShowCreateSession(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Nouvelle Session
                                </button>
                            </div>
                        </div>

                        {/* Sessions List */}
                        {sessionsLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 mt-2">Chargement des sessions...</p>
                            </div>
                        ) : sessionsError ? (
                            <div className="text-center py-8 text-red-600">Erreur: {sessionsError}</div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">Aucune session de marché trouvée</div>
                        ) : (
                            <div className="grid gap-4">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={`border rounded-lg p-4 transition-colors ${
                                            selectedSession?.id === session.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div
                                                className="flex-1 cursor-pointer"
                                                onClick={() => setSelectedSession(session)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-gray-900">{session.name}</h4>

                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{formatDate(session.date)}</p>
                                                {session.location && (
                                                    <p className="text-sm text-gray-500 mt-1">📍 {session.location}</p>
                                                )}
                                                {session.description && (
                                                    <p className="text-sm text-gray-600 mt-2">{session.description}</p>
                                                )}
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-2">
                                                <div>
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            session.status === 'UPCOMING'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : session.status === 'ACTIVE'
                                                                  ? 'bg-green-100 text-green-800'
                                                                  : session.status === 'COMPLETED'
                                                                    ? 'bg-gray-100 text-gray-800'
                                                                    : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {session.status}
                                                    </span>
                                                    <p
                                                        className="text-sm text-blue-600 hover:text-blue-800 mt-1 cursor-pointer underline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedSessionForGrowers(session);
                                                            setShowGrowersModal(true);
                                                        }}
                                                    >
                                                        {session._count?.participations || 0} producteurs participants
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSessionToEdit(session);
                                                            setShowEditSession(true);
                                                        }}
                                                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors font-medium"
                                                    >
                                                        ✏️ Modifier
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteSession(session.id);
                                                        }}
                                                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors font-medium"
                                                    >
                                                        🗑️ Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'products' && (
                    <div>
                        {/* Products Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Produits du Marché</h3>
                                {selectedSession && (
                                    <p className="text-sm text-gray-600 mt-1">Session: {selectedSession?.name}</p>
                                )}
                            </div>
                            <div className="flex space-x-3">
                                {selectedSession && (
                                    <button
                                        onClick={() => setShowCreateProduct(true)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        Nouveau Produit
                                    </button>
                                )}
                            </div>
                        </div>

                        {!selectedSession ? (
                            <div className="text-center py-8 text-gray-500">
                                Sélectionnez une session de marché pour voir les produits
                            </div>
                        ) : productsLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 mt-2">Chargement des produits...</p>
                            </div>
                        ) : productsError ? (
                            <div className="text-center py-8 text-red-600">Erreur: {productsError}</div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Aucun produit trouvé pour cette session
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    {product.imageUrl && (
                                                        <Image
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            width={48}
                                                            height={48}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            Par {product.grower.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                {product.description && (
                                                    <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                                                )}
                                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                    <span>Prix: {formatPrice(Number(product.price))}</span>
                                                    <span>
                                                        Stock: {product.stock} {product.unit}
                                                    </span>
                                                    {product.category && <span>Catégorie: {product.category}</span>}
                                                </div>
                                            </div>
                                            <div className="flex flex-col space-y-2">
                                                <button
                                                    onClick={() => {
                                                        setProductToEdit(product);
                                                        setShowEditProduct(true);
                                                    }}
                                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                                                >
                                                    Modifier
                                                </button>
                                                <button
                                                    onClick={() => handleCopyToDelivery(product)}
                                                    disabled={copyLoading}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                >
                                                    {copyLoading ? 'Copie...' : 'Copier vers Livraison'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                                >
                                                    🗑️ Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Dialogue de confirmation */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onCancel={() => setConfirmDialog({ isOpen: false, type: 'session', id: '', name: '' })}
                onConfirm={confirmDialog.type === 'session' ? confirmDeleteSession : confirmDeleteProduct}
                title={`Supprimer ${confirmDialog.type === 'session' ? 'la session' : 'le produit'}`}
                message={
                    confirmDialog.type === 'session'
                        ? `Êtes-vous sûr de vouloir supprimer la session "${confirmDialog.name}" ?`
                        : `Êtes-vous sûr de vouloir supprimer le produit "${confirmDialog.name}" ?`
                }
                confirmText="Supprimer"
                cancelText="Annuler"
                type="danger"
            />

            {/* Modal de création de session */}
            <SessionForm
                isOpen={showCreateSession}
                onClose={() => setShowCreateSession(false)}
                onSubmit={handleCreateOrUpdateSession}
                title="Créer une nouvelle session"
            />

            <SessionForm
                isOpen={showEditSession}
                onClose={() => {
                    setShowEditSession(false);
                    setSessionToEdit(null);
                }}
                onSubmit={handleCreateOrUpdateSession}
                session={sessionToEdit}
                title="Modifier la session"
            />

            {/* Modal de création de produit */}
            {selectedSession && (
                <ProductForm
                    isOpen={showCreateProduct}
                    onClose={() => setShowCreateProduct(false)}
                    onSubmit={handleCreateOrUpdateProduct}
                    sessionId={selectedSession.id}
                    title="Créer un nouveau produit"
                />
            )}

            {/* Modal de modification de produit */}
            {selectedSession && (
                <ProductForm
                    isOpen={showEditProduct}
                    onClose={() => {
                        setShowEditProduct(false);
                        setProductToEdit(null);
                    }}
                    onSubmit={handleCreateOrUpdateProduct}
                    product={productToEdit}
                    sessionId={selectedSession.id}
                    title="Modifier le produit"
                />
            )}

            {/* Modal des producteurs */}
            <GrowersModal
                isOpen={showGrowersModal}
                onClose={() => {
                    setShowGrowersModal(false);
                    setSelectedSessionForGrowers(null);
                }}
                session={selectedSessionForGrowers}
            />
        </div>
    );
}
