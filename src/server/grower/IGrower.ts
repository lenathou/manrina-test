// Removed Decimal import - using number instead

export interface IGrower {
    id: string;
    name: string;
    profilePhoto: string;
    email: string;
    password: string;
    passwordResetToken?: string | null;
    passwordResetExpires?: Date | null;
    siret: string | null;
    approved: boolean;
    approvedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    phone?: string | null;
    commissionRate: number;
    deliveryCommissionRate?: number | null;
    bio?: string | null;
    assignmentId?: string | null;
}

export interface IGrowerProductSuggestion {
    id: string;
    growerId: string;
    name: string;
    description?: string;
    pricing?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMarketProductSuggestion {
    id: string;
    growerId: string;
    name: string;
    description?: string;
    pricing: string;
    unit?: string;
    category?: string;
    imageUrl?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    adminComment?: string;
    createdAt: Date;
    updatedAt: Date;
    processedAt?: Date;
}

export interface IGrowerLoginPayload {
    email: string;
    password: string;
}

export interface IGrowerLoginResponse {
    success: boolean;
    jwt: string;
    message?: string;
}

export interface IGrowerTokenPayload {
    id: string;
    email: string;
    name: string;
    profilePhoto: string;
    iat?: number;
    exp?: number;
}

export interface IGrowerProductVariant {
    productId: string;
    productName: string;
    productImageUrl: string;
    variantId: string;
    variantOptionValue: string;
    price: number;
    stock: number;
}
