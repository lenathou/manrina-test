import { IGrower, IGrowerProductSuggestion, IMarketProductSuggestion } from '@/server/grower/IGrower';
import { 
    IGrowerStockUpdate, 
    IGrowerStockUpdateCreateParams, 
    IGrowerStockUpdateApprovalParams 
} from '@/server/grower/IGrowerStockValidation';
import { IGrowerStockUpdateWithRelations } from '@/hooks/useGrowerStockValidation';
import { IProductVariant } from '@/server/product/IProduct';

// Interface pour les produits de producteur
export interface IGrowerProduct {
    id: string;
    growerId: string;
    productId: string;
    variantId: string;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
}

// Interface pour le produit tel que retourné par Prisma (sans variants)
export interface IProductFromPrisma {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    imageUrl: string;
    category: string | null;
    showInStore: boolean;
}

// Interface pour les produits de producteur avec relations
export interface IGrowerProductWithRelations extends IGrowerProduct {
    product: IProductFromPrisma;
    variant: IProductVariant;
}

export type IGrowerCreateParams = Omit<IGrower, 'id' | 'createdAt' | 'updatedAt'>;
export type IGrowerUpdateParams = Omit<IGrower, 'email' | 'password' | 'createdAt'>;
export type IGrowerApprovalUpdateParams = {
    id: string;
    approved: boolean;
    approvedAt: Date | null;
    updatedAt: Date;
};
export type IGrowerProductSuggestionCreateParams = Omit<IGrowerProductSuggestion, 'id' | 'createdAt' | 'updatedAt'>;
export type IMarketProductSuggestionCreateParams = Omit<IMarketProductSuggestion, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'processedAt'>;
export type IMarketProductSuggestionUpdateParams = {
    id: string;
    status: 'APPROVED' | 'REJECTED';
    adminComment?: string;
};
export interface IGrowerRepository {
    findByEmail(email: string): Promise<IGrower | undefined>;
    findByIdWithPassword(growerId: string): Promise<IGrower | undefined>;
    findBySiret(siret: string): Promise<IGrower | undefined>;
    verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
    createGrower(props: IGrowerCreateParams): Promise<IGrower>;
    updatePassword(growerId: string, newPassword: string): Promise<void>;
    deleteGrower(growerId: string): Promise<void>;
    listGrowers(): Promise<IGrower[]>;
    updateGrower(props: IGrowerUpdateParams): Promise<IGrower>;
    updateGrowerApproval(props: IGrowerApprovalUpdateParams): Promise<IGrower>;
    
    // Méthodes pour la réinitialisation de mot de passe
    setPasswordResetToken(email: string, token: string, expires: Date): Promise<boolean>;
    findByPasswordResetToken(token: string): Promise<IGrower | null>;
    resetPassword(id: string, newPassword: string): Promise<void>;
    addGrowerProduct(params: { growerId: string; productId: string; variantId: string; stock: number }): Promise<IGrowerProduct>;
    removeGrowerProduct(params: { growerId: string; variantId: string }): Promise<void>;
    listGrowerProducts(growerId: string): Promise<IGrowerProductWithRelations[]>;
    updateGrowerProductStock(params: { growerId: string; variantId: string; stock: number }): Promise<IGrowerProduct>;
    updateGrowerProductPrice(params: { growerId: string; variantId: string; price: number }): Promise<IGrowerProduct>;
    createGrowerProductSuggestion(params: IGrowerProductSuggestionCreateParams): Promise<IGrowerProductSuggestion>;
    listGrowerProductSuggestions(growerId: string): Promise<IGrowerProductSuggestion[]>;
    deleteGrowerProductSuggestion(id: string): Promise<void>;
    
    // Market product suggestions methods
    createMarketProductSuggestion(params: IMarketProductSuggestionCreateParams): Promise<IMarketProductSuggestion>;
    listMarketProductSuggestions(growerId: string): Promise<IMarketProductSuggestion[]>;
    getAllMarketProductSuggestions(): Promise<IMarketProductSuggestion[]>;
    updateMarketProductSuggestionStatus(params: IMarketProductSuggestionUpdateParams): Promise<IMarketProductSuggestion>;
    deleteMarketProductSuggestion(id: string): Promise<void>;
    
    // Stock validation methods
    createStockUpdateRequest(params: IGrowerStockUpdateCreateParams): Promise<IGrowerStockUpdate>;
    getStockUpdateRequestById(requestId: string): Promise<IGrowerStockUpdate | null>;
    getStockUpdateRequestsByGrower(growerId: string): Promise<IGrowerStockUpdate[]>;
    getAllPendingStockRequests(): Promise<IGrowerStockUpdateWithRelations[]>;
    updateStockUpdateRequestStatus(params: IGrowerStockUpdateApprovalParams): Promise<IGrowerStockUpdate>;
    deleteStockUpdateRequest(requestId: string): Promise<void>;
}
