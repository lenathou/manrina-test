import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';

interface ClientStats {
  totalOrders: number;
  totalSpent: string;
  lastOrderDate: string | null;
  averageOrderValue: string;
  firstOrderDate: string | null;
  ordersThisMonth: number;
  ordersThisYear: number;
}

export const useClientStats = (clientId: string) => {
  return useQuery({
    queryKey: ['admin', 'client', clientId, 'stats'],
    queryFn: async (): Promise<ClientStats> => {
      // Récupérer les commandes du client
      const orders = await backendFetchService.getCustomerOrders(clientId);
      
      if (!orders || orders.length === 0) {
        return {
          totalOrders: 0,
          totalSpent: '0,00 €',
          lastOrderDate: null,
          averageOrderValue: '0,00 €',
          firstOrderDate: null,
          ordersThisMonth: 0,
          ordersThisYear: 0,
        };
      }

      // Calculer les statistiques
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + (order.order?.Total || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      
      // Trier les commandes par date
      const sortedOrders = orders.sort((a, b) => 
        new Date(b.basket.createdAt as string).getTime() - new Date(a.basket.createdAt as string).getTime()
      );
      
      const lastOrderDate = sortedOrders[0]?.basket.createdAt as string || null;
      const firstOrderDate = sortedOrders[sortedOrders.length - 1]?.basket.createdAt as string || null;
      
      // Calculer les commandes de ce mois et cette année
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const ordersThisMonth = orders.filter(order => {
        const orderDate = new Date(order.basket.createdAt as string);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      }).length;
      
      const ordersThisYear = orders.filter(order => {
        const orderDate = new Date(order.basket.createdAt as string);
        return orderDate.getFullYear() === currentYear;
      }).length;
      
      return {
        totalOrders,
        totalSpent: `${totalSpent.toFixed(2).replace('.', ',')} €`,
        lastOrderDate,
        averageOrderValue: `${averageOrderValue.toFixed(2).replace('.', ',')} €`,
        firstOrderDate,
        ordersThisMonth,
        ordersThisYear,
      };
    },
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook pour récupérer les commandes récentes d'un client
export const useClientRecentOrders = (clientId: string, limit: number = 5) => {
  return useQuery({
    queryKey: ['admin', 'client', clientId, 'recent-orders', limit],
    queryFn: async () => {
      const orders = await backendFetchService.getCustomerOrders(clientId, { limit });
      return orders || [];
    },
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};