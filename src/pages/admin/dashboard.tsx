/* eslint-disable react/no-unescaped-entities */
import { useAppRouter } from '@/router/useAppRouter';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';

function AdminDashboard({ }: { authenticatedAdmin: IAdminTokenPayload }) {
    const { navigate } = useAppRouter();

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
