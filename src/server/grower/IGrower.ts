export interface IGrower {
    id: string;
    name: string;
    profilePhoto: string;
    email: string;
    password: string;
    passwordResetToken?: string | null;
    passwordResetExpires?: Date | null;
    siret: string | null;
    createdAt: Date;
    updatedAt: Date;
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
