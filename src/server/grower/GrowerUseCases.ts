import { IGrower, IGrowerLoginPayload, IGrowerLoginResponse, IGrowerTokenPayload } from '@/server/grower/IGrower';
import {
    IGrowerCreateParams,
    IGrowerProductSuggestionCreateParams,
    IGrowerRepository,
    IGrowerUpdateParams,
} from '@/server/grower/IGrowerRepository';
import { JwtService } from '@/server/services/JwtService';

export class GrowerUseCases {
    constructor(
        private growerRepository: IGrowerRepository,
        private jwtService: JwtService,
    ) {}

    public async login(payload: IGrowerLoginPayload): Promise<IGrowerLoginResponse> {
        const grower = await this.growerRepository.findByEmail(payload.email);

        if (!grower) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await this.growerRepository.verifyPassword(payload.password, grower.password);

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(grower);
        return {
            success: true,
            jwt: token,
        };
    }

    public verifyToken(token: string): IGrowerTokenPayload | null {
        const payload = this.jwtService.verifyToken(token) as IGrowerTokenPayload | null;
        if (
            payload &&
            typeof payload.id === 'string' &&
            typeof payload.email === 'string' &&
            typeof payload.name === 'string'
        ) {
            return payload;
        }
        return null;
    }

    private generateToken(grower: IGrower): string {
        const payload: Omit<IGrowerTokenPayload, 'iat' | 'exp'> = {
            id: grower.id,
            email: grower.email,
            name: grower.name,
            profilePhoto: grower.profilePhoto,
        };

        return this.jwtService.generateToken(payload);
    }

    public async updateGrower(props: IGrowerUpdateParams) {
        return this.growerRepository.updateGrower(props);
    }

    public async listGrowers() {
        return this.growerRepository.listGrowers();
    }

    public async createGrower(props: IGrowerCreateParams) {
        return this.growerRepository.createGrower(props);
    }

    public async updatePassword(id: string, password: string) {
        return this.growerRepository.updatePassword(id, password);
    }

    public async deleteGrower(id: string) {
        return this.growerRepository.deleteGrower(id);
    }

    public async findByEmail(email: string) {
        return this.growerRepository.findByEmail(email);
    }

    public async addGrowerProduct(params: { growerId: string; productId: string; variantId: string; stock: number }) {
        return this.growerRepository.addGrowerProduct(params);
    }

    public async removeGrowerProduct(params: { growerId: string; variantId: string }) {
        return this.growerRepository.removeGrowerProduct(params);
    }

    public async listGrowerProducts(growerId: string) {
        return this.growerRepository.listGrowerProducts(growerId);
    }

    public async updateGrowerProductStock(params: { growerId: string; variantId: string; stock: number }) {
        return this.growerRepository.updateGrowerProductStock(params);
    }

    public async createGrowerProductSuggestion(params: IGrowerProductSuggestionCreateParams) {
        return this.growerRepository.createGrowerProductSuggestion(params);
    }

    public async listGrowerProductSuggestions(growerId: string) {
        return this.growerRepository.listGrowerProductSuggestions(growerId);
    }

    public async deleteGrowerProductSuggestion(id: string) {
        return this.growerRepository.deleteGrowerProductSuggestion(id);
    }
}
