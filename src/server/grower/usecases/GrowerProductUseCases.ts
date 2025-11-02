import { GrowerUseCases } from '../GrowerUseCases';
import {
    IGrowerProduct,
    IGrowerProductWithRelations,
    IGrowerProductSuggestionCreateParams,
    IMarketProductSuggestionCreateParams,
} from '../IGrowerRepository';
import { IGrowerProductSuggestion, IMarketProductSuggestion } from '../IGrower';

export class GrowerProductUseCases {
    constructor(private growerUseCases: GrowerUseCases) {}

    public addGrowerProduct = async (
        growerId: string,
        productId: string,
        stock: number,
        forceReplace?: boolean,
    ): Promise<IGrowerProduct> => {
        return await this.growerUseCases.addGrowerProduct({ growerId, productId, stock, forceReplace });
    };

    public removeGrowerProduct = async (params: { growerId: string; productId: string }): Promise<void> => {
        return await this.growerUseCases.removeGrowerProduct(params);
    };

    public listGrowerProducts = async (growerId: string): Promise<IGrowerProductWithRelations[]> => {
        return await this.growerUseCases.listGrowerProducts(growerId);
    };

    public updateGrowerProductPrice = async (params: {
        growerId: string;
        variantId: string;
        price: number;
    }): Promise<IGrowerProduct> => {
        return await this.growerUseCases.updateGrowerProductPrice(params);
    };

    public createGrowerProductSuggestion = async (
        params: IGrowerProductSuggestionCreateParams,
    ): Promise<IGrowerProductSuggestion> => {
        return await this.growerUseCases.createGrowerProductSuggestion(params);
    };

    public listGrowerProductSuggestions = async (growerId: string): Promise<IGrowerProductSuggestion[]> => {
        return await this.growerUseCases.listGrowerProductSuggestions(growerId);
    };

    public deleteGrowerProductSuggestion = async (id: string): Promise<void> => {
        return await this.growerUseCases.deleteGrowerProductSuggestion(id);
    };

    public createMarketProductSuggestion = async (
        params: IMarketProductSuggestionCreateParams,
    ): Promise<IMarketProductSuggestion> => {
        return await this.growerUseCases.createMarketProductSuggestion(params);
    };

    public listMarketProductSuggestions = async (growerId: string): Promise<IMarketProductSuggestion[]> => {
        return await this.growerUseCases.listMarketProductSuggestions(growerId);
    };

    public getAllMarketProductSuggestions = async (): Promise<IMarketProductSuggestion[]> => {
        return await this.growerUseCases.getAllMarketProductSuggestions();
    };

    public updateMarketProductSuggestionStatus = async (
        id: string,
        status: 'APPROVED' | 'REJECTED',
        adminComment?: string,
    ): Promise<IMarketProductSuggestion> => {
        return await this.growerUseCases.updateMarketProductSuggestionStatus(id, status, adminComment);
    };
}