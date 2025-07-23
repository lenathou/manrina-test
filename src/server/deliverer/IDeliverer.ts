export interface IDeliverer {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  vehicle?: string;
  zone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDelivererLoginPayload {
  email: string;
  password: string;
}

export interface IDelivererLoginResponse {
  success: boolean;
  jwt: string;
  message?: string;
}

export interface IDelivererTokenPayload {
  id: string;
  email: string;
  name: string;
  zone?: string;
}

// Interface pour les paniers dans les livraisons
export interface IDeliveryBasket {
  id: string;
  customerId?: string;
  status: string;
  totalAmount?: number;
  // Ajoutez d'autres propriétés selon vos besoins
}

export interface IDelivery {
  id: string;
  delivererId?: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'DELIVERED' | 'FAILED';
  scheduledAt?: Date;
  deliveredAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relation avec les paniers (au lieu d'un seul basketId)
  baskets?: IDeliveryBasket[];
  deliverer?: IDeliverer;
}