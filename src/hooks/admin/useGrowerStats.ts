import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { BasketSession, BasketSessionItem } from '@prisma/client';

interface GrowerStats {
  totalProducts: number;
  totalSales: string;
  totalOrders: number;
  averageOrderValue: string;
  lastSaleDate: string | null;
  firstSaleDate: string | null;
  salesThisMonth: number;
  salesThisYear: number;
  topSellingProducts: Array<{
    id: string;
    name: string;
    totalSold: number;
    revenue: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

export const useGrowerDetailedStats = (growerId: string) => {
  return useQuery({
    queryKey: ['admin', 'grower', growerId, 'detailed-stats'],
    queryFn: async (): Promise<GrowerStats> => {
      // Récupérer les produits du producteur
      const products = await backendFetchService.listGrowerProducts(growerId);
      
      // Récupérer les commandes liées aux produits du producteur
      // Pour l'instant, on simule les données car il n'y a pas d'endpoint spécifique
      const orders: (BasketSession & { 
        total: number; 
        createdAt: Date;
        items?: BasketSessionItem[];
      })[] = [];
      
      if (!orders || orders.length === 0) {
        return {
          totalProducts: products?.length || 0,
          totalSales: '0,00 €',
          totalOrders: 0,
          averageOrderValue: '0,00 €',
          lastSaleDate: null,
          firstSaleDate: null,
          salesThisMonth: 0,
          salesThisYear: 0,
          topSellingProducts: [],
          monthlyRevenue: [],
        };
      }

      // Calculer les statistiques
      const totalOrders = orders.length;
      const totalSales = orders.reduce((sum: number, order) => sum + (order.total || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      
      // Trier les commandes par date
      const sortedOrders = orders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      const lastSaleDate = sortedOrders[0]?.createdAt.toISOString() || null;
      const firstSaleDate = sortedOrders[sortedOrders.length - 1]?.createdAt.toISOString() || null;
      
      // Calculer les ventes de ce mois et cette année
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const salesThisMonth = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      }).length;
      
      const salesThisYear = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getFullYear() === currentYear;
      }).length;
      
      // Calculer les produits les plus vendus
      const productSales = new Map<string, { name: string; totalSold: number; revenue: number }>();
      
      orders.forEach(order => {
        order.items?.forEach((item: BasketSessionItem) => {
          const productId = item.productId;
          const productName = item.name || 'Produit inconnu';
          const quantity = item.quantity || 0;
          const price = item.price || 0;
          
          if (productSales.has(productId)) {
            const existing = productSales.get(productId)!;
            existing.totalSold += quantity;
            existing.revenue += price * quantity;
          } else {
            productSales.set(productId, {
              name: productName,
              totalSold: quantity,
              revenue: price * quantity,
            });
          }
        });
      });
      
      const topSellingProducts = Array.from(productSales.entries())
        .map(([id, data]) => ({
          id,
          name: data.name,
          totalSold: data.totalSold,
          revenue: `${data.revenue.toFixed(2).replace('.', ',')} €`,
        }))
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5);
      
      // Calculer les revenus mensuels des 12 derniers mois
      const monthlyRevenue = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === date.getMonth() && 
                 orderDate.getFullYear() === date.getFullYear();
        });
        
        const monthRevenue = monthOrders.reduce((sum: number, order) => sum + (order.total || 0), 0);
        
        monthlyRevenue.push({
          month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
        });
      }
      
      return {
        totalProducts: products?.length || 0,
        totalSales: `${totalSales.toFixed(2).replace('.', ',')} €`,
        totalOrders,
        averageOrderValue: `${averageOrderValue.toFixed(2).replace('.', ',')} €`,
        lastSaleDate,
        firstSaleDate,
        salesThisMonth,
        salesThisYear,
        topSellingProducts,
        monthlyRevenue,
      };
    },
    enabled: !!growerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Hook pour récupérer les produits récents d'un producteur
export const useGrowerRecentProducts = (growerId: string, limit: number = 5) => {
  return useQuery({
    queryKey: ['admin', 'grower', growerId, 'recent-products', limit],
    queryFn: async () => {
      const products = await backendFetchService.listGrowerProducts(growerId);
      return products || [];
    },
    enabled: !!growerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};