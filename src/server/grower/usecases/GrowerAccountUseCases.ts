import { GrowerUseCases } from '../GrowerUseCases';
import { AdminGrowerManagementUseCases } from '../../admin/usecases/AdminGrowerManagementUseCases';
import { IGrowerCreateParams, IGrowerUpdateParams } from '../IGrowerRepository';
import { IGrower } from '../IGrower';
import { PrismaClient } from '@prisma/client';

export class GrowerAccountUseCases {
    constructor(
        private growerUseCases: GrowerUseCases,
        private adminGrowerManagementUseCases: AdminGrowerManagementUseCases,
        private prisma: PrismaClient,
    ) {}

    public listGrowers = async () => {
        return await this.growerUseCases.listGrowers();
    };

    public createGrower = async (props: IGrowerCreateParams) => {
        return await this.growerUseCases.createGrower(props);
    };

    public updateGrower = async (props: IGrowerUpdateParams) => {
        return await this.growerUseCases.updateGrower(props);
    };

    public deleteGrower = async (id: string) => {
        return await this.growerUseCases.deleteGrower(id);
    };

    public updateGrowerApproval = (id: string, approved: boolean) => {
        return this.adminGrowerManagementUseCases.updateGrowerApproval(id, approved);
    };

    public createGrowerAccount = async (props: {
        name: string;
        email: string;
        password: string;
        siret?: string;
        profilePhoto?: string;
    }): Promise<{ success: boolean; message: string; grower?: IGrower }> => {
        try {
            // Vérifier si l'email existe déjà
            const existingGrowerByEmail = await this.prisma.grower.findUnique({
                where: { email: props.email },
            });

            if (existingGrowerByEmail) {
                return {
                    success: false,
                    message: 'Un producteur avec cet email existe déjà'
                };
            }

            // Vérifier si le SIRET existe déjà (s'il est fourni)
            if (props.siret) {
                const existingGrowerBySiret = await this.prisma.grower.findUnique({
                    where: { siret: props.siret },
                });

                if (existingGrowerBySiret) {
                    return {
                        success: false,
                        message: 'Un producteur avec ce SIRET existe déjà'
                    };
                }
            }

            // Créer le producteur avec un statut non approuvé par défaut
            const grower = await this.growerUseCases.createGrower({
                name: props.name,
                email: props.email,
                password: props.password,
                siret: props.siret || null,
                profilePhoto: props.profilePhoto || '',
                approved: false, // Par défaut, les nouveaux comptes ne sont pas approuvés
                commissionRate: 0.1, // Taux de commission par défaut de 10%
            });

            return {
                success: true,
                message: 'Compte producteur créé avec succès',
                grower
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la création du compte'
            };
        }
    };

    public updateGrowerPassword = async (id: string, password: string) => {
        return await this.growerUseCases.updatePassword(id, password);
    };

    public findGrowerByEmail = async (email: string) => {
        return await this.growerUseCases.findByEmail(email);
    };

    public findGrowerById = async (id: string) => {
        return await this.growerUseCases.findById(id);
    };
}