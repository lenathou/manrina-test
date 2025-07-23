import { IGrower, IGrowerProductSuggestion } from '@/server/grower/IGrower';

export type IGrowerCreateParams = Omit<IGrower, 'id' | 'createdAt' | 'updatedAt'>;
export type IGrowerUpdateParams = Omit<IGrower, 'email' | 'password' | 'createdAt'>;
export type IGrowerProductSuggestionCreateParams = Omit<IGrowerProductSuggestion, 'id' | 'createdAt' | 'updatedAt'>;
export interface IGrowerRepository {
    findByEmail(email: string): Promise<IGrower | undefined>;
    verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
    createGrower(props: IGrowerCreateParams): Promise<IGrower>;
    updatePassword(growerId: string, newPassword: string): Promise<void>;
    deleteGrower(growerId: string): Promise<void>;
    listGrowers(): Promise<IGrower[]>;
    updateGrower(props: IGrowerUpdateParams): Promise<IGrower>;
    addGrowerProduct(params: { growerId: string; productId: string; variantId: string; stock: number }): Promise<any>;
    removeGrowerProduct(params: { growerId: string; variantId: string }): Promise<any>;
    listGrowerProducts(growerId: string): Promise<any[]>;
    updateGrowerProductStock(params: { growerId: string; variantId: string; stock: number }): Promise<any>;
    createGrowerProductSuggestion(params: IGrowerProductSuggestionCreateParams): Promise<any>;
    listGrowerProductSuggestions(growerId: string): Promise<any[]>;
    deleteGrowerProductSuggestion(id: string): Promise<any>;
}
