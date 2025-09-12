import React from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useClientRecentOrders, useClientOrdersStats } from '@/hooks/admin/useClientOrders';


interface ClientOrdersCardProps {
  clientId: string;
}

export function ClientOrdersCard({ clientId }: ClientOrdersCardProps) {
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useClientRecentOrders(clientId, 5);
  
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useClientOrdersStats(clientId);
  
  const isLoading = ordersLoading || statsLoading;
  const error = ordersError || statsError;
  
  // Transformation des données pour correspondre à l'interface Order existante
  const transformedOrders = orders.map(order => ({
    id: order.basket.id,
    date: order.basket.createdAt,
    total: `${order.order.Total.toFixed(2)} €`,
    status: order.basket.paymentStatus,
    itemsCount: order.basket.items.length
  }));

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'terminée':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'annulée':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Terminée';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Historique des commandes
      </h3>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg mb-1">🛒</div>
          <div className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</div>
          <div className="text-xs text-gray-500">Commandes</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg mb-1">💰</div>
          <div className="text-2xl font-bold text-gray-900">{stats?.totalSpent ? `${stats.totalSpent.toFixed(2)} €` : '0,00 €'}</div>
          <div className="text-xs text-gray-500">Total dépensé</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg mb-1">📅</div>
          <div className="text-sm font-bold text-gray-900">
            {stats?.lastOrderDate ? new Date(stats.lastOrderDate).toLocaleDateString('fr-FR') : 'Aucune'}
          </div>
          <div className="text-xs text-gray-500">Dernière commande</div>
        </div>
      </div>

      {/* Liste des commandes récentes */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          📈 Commandes récentes
        </h4>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="small" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-600 text-sm">
            {error.message || 'Erreur lors du chargement des commandes'}
          </div>
        ) : transformedOrders.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Aucune commande trouvée
          </div>
        ) : (
          <div className="space-y-3">
            {transformedOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      Commande #{order.id.slice(-8)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {order.date ? new Date(order.date).toLocaleDateString('fr-FR') : 'Date inconnue'} • {order.itemsCount} article{order.itemsCount > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {order.total}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {transformedOrders.length > 0 && (
          <div className="mt-4 text-center">
            <button className="text-sm text-[var(--color-primary)] hover:underline">
              Voir toutes les commandes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}