import { IGrower, IGrowerLoginPayload, IGrowerLoginResponse, IGrowerTokenPayload, IGrowerProductSuggestion, IMarketProductSuggestion } from '@/server/grower/IGrower';
import {
    IGrowerCreateParams,
    IGrowerProduct,
    IGrowerProductWithRelations,
    IGrowerProductSuggestionCreateParams,
    IMarketProductSuggestionCreateParams,
    IMarketProductSuggestionUpdateParams,
    IGrowerRepository,
    IGrowerUpdateParams,
} from '@/server/grower/IGrowerRepository';
import { 
    IGrowerStockUpdateCreateParams, 
    IGrowerStockUpdateApprovalParams,
    GrowerStockValidationStatus 
} from '@/server/grower/IGrowerStockValidation';
import { IGrowerStockUpdateWithRelations } from '@/hooks/useGrowerStockValidation';
import { JwtService } from '@/server/services/JwtService';
import { EmailService } from '@/server/services/EmailService';
import crypto from 'crypto';

export class GrowerUseCases {
    constructor(
        private growerRepository: IGrowerRepository,
        private jwtService: JwtService,
        private emailService: EmailService,
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

        // Vérifier si le producteur est approuvé
        if (!grower.approved) {
            throw new Error('Votre compte est en attente d\'approbation. Vous recevrez un email une fois votre compte approuvé par un administrateur.');
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

    public async changePassword(growerId: string, currentPassword: string, newPassword: string) {
        // Récupérer le producteur avec son mot de passe
        const grower = await this.growerRepository.findByIdWithPassword(growerId);
        if (!grower) {
            throw new Error('Producteur non trouvé');
        }

        // Vérifier l'ancien mot de passe
        const isCurrentPasswordValid = await this.growerRepository.verifyPassword(currentPassword, grower.password);
        if (!isCurrentPasswordValid) {
            throw new Error('Mot de passe actuel incorrect');
        }

        // Mettre à jour le mot de passe
        return await this.growerRepository.updatePassword(growerId, newPassword);
    }

    public async deleteGrower(id: string) {
        return this.growerRepository.deleteGrower(id);
    }

    public async findByEmail(email: string) {
        return this.growerRepository.findByEmail(email);
    }

    public async findBySiret(siret: string) {
        return this.growerRepository.findBySiret(siret);
    }

    public async addGrowerProduct(params: { growerId: string; productId: string; variantId: string; stock: number }): Promise<IGrowerProduct> {
        return this.growerRepository.addGrowerProduct(params);
    }

    public async removeGrowerProduct(params: { growerId: string; variantId: string }): Promise<void> {
        return this.growerRepository.removeGrowerProduct(params);
    }

    public async listGrowerProducts(growerId: string): Promise<IGrowerProductWithRelations[]> {
        return this.growerRepository.listGrowerProducts(growerId);
    }

    public async updateGrowerProductStock(params: { growerId: string; variantId: string; stock: number }): Promise<IGrowerProduct> {
        return this.growerRepository.updateGrowerProductStock(params);
    }

    public async updateGrowerProductPrice(params: { growerId: string; variantId: string; price: number }): Promise<IGrowerProduct> {
        return this.growerRepository.updateGrowerProductPrice(params);
    }

    public async createGrowerProductSuggestion(params: IGrowerProductSuggestionCreateParams): Promise<IGrowerProductSuggestion> {
        return this.growerRepository.createGrowerProductSuggestion(params);
    }

    public async listGrowerProductSuggestions(growerId: string): Promise<IGrowerProductSuggestion[]> {
        return this.growerRepository.listGrowerProductSuggestions(growerId);
    }

    public async deleteGrowerProductSuggestion(id: string): Promise<void> {
        return this.growerRepository.deleteGrowerProductSuggestion(id);
    }

    // Market product suggestions methods
    public async createMarketProductSuggestion(params: IMarketProductSuggestionCreateParams): Promise<IMarketProductSuggestion> {
        return this.growerRepository.createMarketProductSuggestion(params);
    }

    public async listMarketProductSuggestions(growerId: string): Promise<IMarketProductSuggestion[]> {
        return this.growerRepository.listMarketProductSuggestions(growerId);
    }

    public async getAllMarketProductSuggestions(): Promise<IMarketProductSuggestion[]> {
        return this.growerRepository.getAllMarketProductSuggestions();
    }

    public async updateMarketProductSuggestionStatus(id: string, status: 'APPROVED' | 'REJECTED', adminComment?: string): Promise<IMarketProductSuggestion> {
        const params: IMarketProductSuggestionUpdateParams = {
            id,
            status,
            adminComment
        };
        return this.growerRepository.updateMarketProductSuggestionStatus(params);
    }

    public async deleteMarketProductSuggestion(id: string): Promise<void> {
        return this.growerRepository.deleteMarketProductSuggestion(id);
    }

    // Stock validation methods
    public async createStockUpdateRequest(params: {
        growerId: string;
        variantId: string;
        newStock: number;
        reason: string;
    }) {
        const createParams: IGrowerStockUpdateCreateParams = {
            growerId: params.growerId,
            variantId: params.variantId,
            newStock: params.newStock,
            reason: params.reason,
            status: GrowerStockValidationStatus.PENDING,
            requestDate: new Date().toISOString(),
        };
        return this.growerRepository.createStockUpdateRequest(createParams);
    }

    public async cancelStockUpdateRequest(requestId: string) {
        return this.growerRepository.deleteStockUpdateRequest(requestId);
    }

    public async getPendingStockRequests(growerId: string) {
        return this.growerRepository.getStockUpdateRequestsByGrower(growerId);
    }

    public async getAllPendingStockRequests(): Promise<IGrowerStockUpdateWithRelations[]> {
        return this.growerRepository.getAllPendingStockRequests();
    }

    public async approveStockUpdateRequest(requestId: string, adminComment?: string) {
        const approvalParams: IGrowerStockUpdateApprovalParams = {
            requestId,
            status: GrowerStockValidationStatus.APPROVED,
            adminComment,
            processedDate: new Date().toISOString(),
        };
        
        // Get the request details to update the actual stock
        const request = await this.growerRepository.getStockUpdateRequestById(requestId);
        if (request) {
            // Update the actual stock
            await this.growerRepository.updateGrowerProductStock({
                growerId: request.growerId,
                variantId: request.variantId,
                stock: request.newStock,
            });
        }
        
        return this.growerRepository.updateStockUpdateRequestStatus(approvalParams);
    }

    public async rejectStockUpdateRequest(requestId: string, adminComment?: string) {
        const approvalParams: IGrowerStockUpdateApprovalParams = {
            requestId,
            status: GrowerStockValidationStatus.REJECTED,
            adminComment,
            processedDate: new Date().toISOString(),
        };
        return this.growerRepository.updateStockUpdateRequestStatus(approvalParams);
    }

    // Méthodes pour la réinitialisation de mot de passe
    public async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
        try {
            const grower = await this.growerRepository.findByEmail(email);
            if (!grower) {
                // Pour la sécurité, on ne révèle pas si l'email existe
                return { 
                    success: true, 
                    message: 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.' 
                };
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            const expires = new Date(Date.now() + 3600000); // 1 heure

            const tokenSet = await this.growerRepository.setPasswordResetToken(email, hashedToken, expires);
            
            if (tokenSet) {
                await this.emailService.sendPasswordResetEmail(email, resetToken, 'grower');
            }
            
            return { 
                success: true, 
                message: 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.' 
            };
        } catch (error) {
            console.error('Erreur lors de la demande de réinitialisation de mot de passe:', error);
            return { 
                success: false, 
                message: 'Une erreur interne s\'est produite.' 
            };
        }
    }

    public async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
        try {
            if (!token || !newPassword) {
                return { 
                    success: false, 
                    message: 'Le token et le mot de passe sont requis.' 
                };
            }

            if (newPassword.length < 8) {
                return { 
                    success: false, 
                    message: 'Le mot de passe doit contenir au moins 8 caractères.' 
                };
            }

            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            const grower = await this.growerRepository.findByPasswordResetToken(hashedToken);
            
            if (!grower) {
                return { 
                    success: false, 
                    message: 'Token invalide ou expiré.' 
                };
            }

            await this.growerRepository.resetPassword(grower.id, newPassword);
            
            return { 
                success: true, 
                message: 'Mot de passe réinitialisé avec succès.' 
            };
        } catch (error) {
            console.error('Erreur lors de la réinitialisation de mot de passe:', error);
            return { 
                success: false, 
                message: 'Une erreur interne s\'est produite.' 
            };
        }
    }

    public async updateGrowerApproval(id: string, approved: boolean): Promise<IGrower> {
        // Récupérer d'abord tous les producteurs pour trouver celui avec l'ID
        const growers = await this.growerRepository.listGrowers();
        const grower = growers.find(g => g.id === id);
        if (!grower) {
            throw new Error('Producteur non trouvé');
        }

        const updatedGrower = await this.growerRepository.updateGrowerApproval({
            id,
            approved,
            approvedAt: approved ? new Date() : null,
            updatedAt: new Date()
        });

        // Optionnel: Envoyer un email de notification au producteur
        if (approved && this.emailService) {
            try {
                await this.emailService.sendEmail(
                    grower.email,
                    'Votre compte producteur a été approuvé',
                    `
                        <h2>Félicitations !</h2>
                        <p>Bonjour ${grower.name},</p>
                        <p>Votre compte producteur Manrina a été approuvé et est maintenant actif.</p>
                        <p>Vous pouvez désormais vous connecter et commencer à vendre vos produits.</p>
                        <p>Merci de faire partie de la communauté Manrina !</p>
                        <p>L'équipe Manrina</p>
                    `
                );
            } catch (emailError) {
                console.error('Erreur lors de l\'envoi de l\'email d\'approbation:', emailError);
                // Ne pas faire échouer l'opération si l'email ne peut pas être envoyé
            }
        }

        return updatedGrower;
    }
}
