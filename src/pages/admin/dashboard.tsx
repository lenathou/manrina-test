/* eslint-disable react/no-unescaped-entities */
import { useAppRouter } from '@/router/useAppRouter';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';
import { useFeatureToggle } from '@/contexts/FeatureToggleContext';
import { useEffect } from 'react';

function AdminDashboard({ }: { authenticatedAdmin: IAdminTokenPayload }) {
    const { navigate } = useAppRouter();
    const { features, toggleFeature, admin, loginAdmin } = useFeatureToggle();

    // S'assurer que l'utilisateur est marqué comme admin dans le contexte FeatureToggle
    useEffect(() => {
        if (!admin.isAdmin) {
            loginAdmin('admin123'); // Utiliser le mot de passe par défaut
        }
    }, [admin.isAdmin, loginAdmin]);

    const handleToggleDelivery = () => {
        toggleFeature('deliveryEnabled');
    };

    return (
        <div className="space-y-6">
            {/* En-tête de bienvenue */}
            <div className="p-6">
                <h2 className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4">
                    Tableau de bord administrateur
                </h2>
                <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
                    Gérez l'ensemble de la plateforme, surveillez les performances et administrez les utilisateurs.
                </p>
            </div>

            {/* Statistiques rapides */}

            {/* Actions rapides */}
            <div className="p-6">
                <h3 className="font-secondary font-bold text-xl sm:text-2xl text-[var(--color-secondary)] mb-4">
                    Actions rapides
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={navigate.admin.toStock}
                        className="w-full flex items-center justify-between p-4 bg-[var(--color-background)] rounded-lg hover:bg-[var(--muted)] transition-colors"
                    >
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold">📦</span>
                            </div>
                            <span className="font-semibold text-base">Gérer le stock</span>
                        </div>
                        <span className="text-[var(--muted-foreground)]">→</span>
                    </button>
                    
                    <button
                        onClick={navigate.admin.toCommandes}
                        className="w-full flex items-center justify-between p-4 bg-[var(--color-background)] rounded-lg hover:bg-[var(--muted)] transition-colors"
                    >
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-[var(--color-light-green)] rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold">📋</span>
                            </div>
                            <span className="font-semibold text-base">Voir les commandes</span>
                        </div>
                        <span className="text-[var(--muted-foreground)]">→</span>
                    </button>
                    
                    <button
                        onClick={navigate.admin.toProducteurs}
                        className="w-full flex items-center justify-between p-4 bg-[var(--color-background)] rounded-lg hover:bg-[var(--muted)] transition-colors"
                    >
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-[var(--color-blue)] rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold">👥</span>
                            </div>
                            <span className="font-semibold text-base">Gérer les producteurs</span>
                        </div>
                        <span className="text-[var(--muted-foreground)]">→</span>
                    </button>
                </div>
            </div>

            {/* Gestion des restrictions de livraison */}
            <div className="p-6">
                <h3 className="font-secondary font-bold text-xl sm:text-2xl text-[var(--color-secondary)] mb-4">
                    Restrictions d'accès
                </h3>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-base text-gray-700 mb-2">
                                Contrôlez l'accès aux pages de commande (panier, paiement) en gérant la disponibilité du service de livraison.
                            </p>
                            <p className="text-sm text-[var(--muted-foreground)]">
                                Service de livraison : <span className={`font-semibold ${features.deliveryEnabled ? 'text-green-600' : 'text-red-600'}`}>
                                    {features.deliveryEnabled ? 'Disponible' : 'Indisponible'}
                                </span>
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                {features.deliveryEnabled 
                                    ? 'Les clients peuvent accéder au panier et effectuer des commandes' 
                                    : 'Les pages de commande sont temporairement inaccessibles'}
                            </p>
                        </div>
                        <button
                            onClick={handleToggleDelivery}
                            className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                                features.deliveryEnabled 
                                    ? 'bg-red-500 hover:bg-red-600' 
                                    : 'bg-green-500 hover:bg-green-600'
                            }`}
                        >
                            {features.deliveryEnabled ? 'Rendre indisponible' : 'Rendre disponible'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Informations système */}
            <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg shadow p-6 text-white">
                <h3 className="font-secondary font-bold text-xl sm:text-2xl mb-3">
                    ⚙️ Administration système
                </h3>
                <p className="text-base sm:text-lg mb-4 opacity-90">
                    Surveillez les performances de la plateforme et gérez les paramètres système pour assurer un fonctionnement optimal.
                </p>
                <button 
                    onClick={() => {}}
                    className="bg-white text-[var(--color-primary)] py-2 px-6 rounded-lg font-secondary font-bold hover:bg-gray-100 transition-colors"
                >
                    Accéder aux paramètres
                </button>
            </div>
        </div>
    );
}

export default AdminDashboard;
