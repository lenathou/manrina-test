import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';

// Types pour les adresses
interface OrderAddress {
  id: string;
  postalCode: string;
  address: string;
  city: string;
  country: string;
  name: string | null;
  type: string;
}

// Types pour les articles du panier
interface BasketItem {
  id?: string;
  productId: string;
  productVariantId: string;
  quantity: number;
  name: string;
  price: number;
  vatRateId?: string;
  description?: string | null;
  refundStatus?: 'refunded' | 'none';
}

// Type pour le panier
interface OrderBasket {
  id: string;
  orderIndex: number;
  createdAt: Date | string | null;
  customerId: string;
  items: BasketItem[];
  total: number;
  paymentStatus: string;
  address: OrderAddress | null;
  deliveryCost: number;
  deliveryDay: string | null;
  delivered: string | null;
  retrieved: string | null;
  rawCustomer: {
    email: string;
    name: string;
    phone: string;
    comments?: string;
  } | null;
  deliveryMessage: string | null;
  walletAmountUsed: number | null;
}

// Type pour le client
interface OrderCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Type pour les détails de commande
interface OrderDetails {
  Order: string;
  Email: string;
  Date: Date | string | null;
  'Payment status': string;
  'Paid at': number;
  'Payment method': string;
  'Order status': string;
  Subtotal: number | string;
  Shipping: number;
  Taxes: number | string;
  Discount: number | string;
  Total: number;
  'Customer name': string;
  'Customer phone number': string;
  'Shipping address - street': string;
  'Shipping address - street number': string;
  'Shipping address - city': string;
  'Shipping address - zip code': string;
  'Shipping address - country code': string;
  'Shipping method name': string;
  'Shipping method type': string;
  'Message for customer': string;
  Notes: string;
  'Tracking url': string;
  'Is Archived': string;
}

// Type principal pour une commande complète (BasketWithCustomerToShow)
interface CustomerOrder {
  basket: OrderBasket;
  customer: OrderCustomer | {
    email: string;
    name: string;
    phone: string;
    comments?: string;
  };
  order: OrderDetails;
}

interface OrderStatistics {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  lastOrderStatus: string | null;
}



interface UseClientOrdersParams {
  clientId: string;
  page?: number;
  limit?: number;
}


export const useClientOrders = ({ clientId, page = 1, limit = 10 }: UseClientOrdersParams) => {
  return useQuery({
    queryKey: ['admin', 'client', clientId, 'orders', { page, limit }],
    queryFn: async (): Promise<CustomerOrder[]> => {
      const offset = (page - 1) * limit;
      return await backendFetchService.getCustomerOrders(clientId, { limit, offset });
    },
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook pour récupérer uniquement les statistiques (plus léger)
export const useClientOrdersStats = (clientId: string) => {
  return useQuery({
    queryKey: ['admin', 'client', clientId, 'orders', 'stats'],
    queryFn: async (): Promise<OrderStatistics> => {
      const data: CustomerOrder[] = await backendFetchService.getCustomerOrders(clientId, { limit: 1 });
      return {
        totalOrders: data.length,
        totalSpent: data.length > 0 ? data[0].order.Total : 0,
        lastOrderDate: data.length > 0 ? data[0].basket.createdAt as string : null,
        lastOrderStatus: data.length > 0 ? data[0].basket.paymentStatus : null
      };
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour récupérer les dernières commandes (pour l'affichage rapide)
export const useClientRecentOrders = (clientId: string, limit: number = 5) => {
  return useQuery({
    queryKey: ['admin', 'client', clientId, 'orders', 'recent', limit],
    queryFn: async (): Promise<CustomerOrder[]> => {
      const data: CustomerOrder[] = await backendFetchService.getCustomerOrders(clientId, { limit });
      return data;
    },
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};