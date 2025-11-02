import { GrowerUseCases } from '@/server/grower/GrowerUseCases';

export class AdminGrowerManagementUseCases {
    constructor(private growerUseCases: GrowerUseCases) {}

    async updateGrowerApproval(id: string, approved: boolean) {
        try {
            const grower = await this.growerUseCases.updateGrowerApproval(id, approved);
            return {
                success: true,
                message: approved
                    ? 'Producteur approuvé avec succès'
                    : 'Approbation du producteur révoquée',
                data: grower,
            };
        } catch (error) {
            return {
                success: false,
                message: (error as Error).message,
            };
        }
    }
}