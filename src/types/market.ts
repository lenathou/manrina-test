import { Prisma } from '@prisma/client';

// Type pour les produits du système de livraison
export type DeliveryProduct = Prisma.ProductGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    imageUrl: true;
    category: true;
    createdAt: true;
    updatedAt: true;
    showInStore: true;
  };
}>;

// Types pour les sessions de marché
export type MarketSession = Prisma.MarketSessionGetPayload<{
  include: {
    marketProducts: true;
    _count: {
      select: {
        marketProducts: true;
        participations: true;
      };
    };
  };
}> & {
  isAutomatic?: boolean;
};

export type MarketSessionWithProducts = Prisma.MarketSessionGetPayload<{
  include: {
    marketProducts: {
      include: {
        grower: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
    participations: {
      include: {
        grower: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
    partners: {
      include: {
        partner: true;
      };
    };
    _count: {
      select: {
        marketProducts: true;
        participations: true;
      };
    };
  };
}>;

export type MarketSessionCreateInput = Prisma.MarketSessionCreateInput;
export type MarketSessionUpdateInput = Prisma.MarketSessionUpdateInput;

// Types pour les produits du marché
export type MarketProduct = Prisma.MarketProductGetPayload<{
  include: {
    grower: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    marketSession: {
      select: {
        id: true;
        name: true;
        date: true;
        status: true;
        isAutomatic: true;
        recurringDay: true;
        timezone: true;
        autoCreateTime: true;
      };
    };
  };
}>;

export type MarketProductCreateInput = Prisma.MarketProductCreateInput;
export type MarketProductUpdateInput = Prisma.MarketProductUpdateInput;

// Types pour l'historique des copies
export type ProductCopyHistory = Prisma.ProductCopyHistoryGetPayload<{
  include: {
    marketProduct: {
      select: {
        id: true;
        name: true;
        price: true;
        marketSession: {
          select: {
            name: true;
            date: true;
          };
        };
      };
    };
    product: {
      select: {
        id: true;
        name: true;
        price: true;
      };
    };
  };
}>;

export type ProductCopyHistoryCreateInput = Prisma.ProductCopyHistoryCreateInput;

// Types pour les requêtes API
export interface CreateMarketSessionRequest {
  name: string;
  date: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  partnerIds?: string[];
}

export interface UpdateMarketSessionRequest {
  id: string;
  name?: string;
  date?: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  partnerIds?: string[];
}

export interface CreateMarketProductRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  stock?: number;
  unit?: string;
  category?: string;
  marketSessionId: string;
  growerId: string;
  isActive?: boolean;
}

export interface UpdateMarketProductRequest {
  id: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  stock?: number;
  unit?: string;
  category?: string;
  isActive?: boolean;
}

export interface CopyProductRequest {
  sourceType: 'MARKET' | 'DELIVERY';
  targetType: 'MARKET' | 'DELIVERY';
  sourceProductId: string;
  targetSessionId?: string; // Requis pour copier vers le marché
  copiedBy: string;
  notes?: string;
}

// Types pour les réponses API
export interface MarketSessionResponse {
  id: string;
  name: string;
  date: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
  marketProducts?: MarketProduct[];
  _count?: {
    marketProducts: number;
    participations: number;
  };
}

export interface MarketProductResponse {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  stock: number;
  unit?: string;
  category?: string;
  isActive: boolean;
  marketSessionId: string;
  growerId: string;
  createdAt: string;
  updatedAt: string;
  grower: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  marketSession: {
    id: string;
    name: string;
    date: string;
    status: string;
  };
}

export interface CopyProductResponse {
  newProduct: MarketProductResponse | DeliveryProduct;
  copyHistory: ProductCopyHistory;
  message: string;
}

// Types utilitaires
export interface MarketFilters {
  sessionId?: string;
  growerId?: string;
  category?: string;
  isActive?: boolean;
  search?: string;
}

export interface SessionFilters {
  status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  upcoming?: boolean;
  limit?: number;
}

// Interface pour les erreurs de duplication
export interface DuplicateError extends Error {
  isDuplicate: boolean;
  details?: string;
  existingSessionId?: string;
}

// Types pour les partenaires
export type Partner = Prisma.PartnerGetPayload<{}>;

export interface CreatePartnerRequest {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdatePartnerRequest {
  id: string;
  name?: string;
  description?: string;
  imageUrl?: string;
}

export interface PartnerResponse {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    sessions: number;
  };
}