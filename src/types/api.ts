import { MarketStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Types pour les requêtes de sessions de marché
export interface MarketSessionWhereInput {
  status?: MarketStatus;
  date?: {
    gte: Date;
  };
}

export interface MarketSessionQueryOptions {
  where: MarketSessionWhereInput;
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
    _count: {
      select: {
        marketProducts: true;
        participations: true;
      };
    };
  };
  orderBy: {
    date: 'asc' | 'desc';
  };
  take?: number;
}

export interface MarketSessionUpdateData {
  name?: string;
  date?: Date;
  description?: string | null;
  location?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  status?: MarketStatus;
}

// Types pour les requêtes de produits de marché
export interface MarketProductWhereInput {
  marketSessionId?: string;
  growerId?: string;
  category?: string;
  isActive?: boolean;
  OR?: Array<{
    name?: { contains: string; mode: 'insensitive' };
    description?: { contains: string; mode: 'insensitive' };
  }>;
}

export interface MarketProductUpdateData {
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: Decimal;
  stock?: number;
  unit?: string | null;
  category?: string | null;
  isActive?: boolean;
}

// Types pour les corps de requête
export interface CreateMarketSessionBody {
  name: string;
  date: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
}

export interface UpdateMarketSessionBody {
  id: string;
  name?: string;
  date?: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  status?: MarketStatus;
}

export interface CreateMarketProductBody {
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

export interface UpdateMarketProductBody {
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

export interface DeleteMarketSessionBody {
  createNext?: boolean;
}