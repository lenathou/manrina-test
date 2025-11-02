import { GrowerUseCases } from '@/server/grower/GrowerUseCases';
import { IGrowerLoginPayload } from '@/server/grower/IGrower';
import { ReqInfos } from '@/service/BackendFetchService';

export class GrowerAuthUseCases {
    constructor(private growerUseCases: GrowerUseCases) {}

    public growerLogin = async (loginPayload: IGrowerLoginPayload, { res }: ReqInfos) => {
        try {
            const jwt = await this.growerUseCases.login(loginPayload);
            res.setHeader('Set-Cookie', `growerToken=${jwt.jwt}; HttpOnly; Path=/; Max-Age=36000;`); // 10 hours
            return { success: true };
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    };

    public growerLogout = ({ res }: ReqInfos) => {
        res.setHeader('Set-Cookie', 'growerToken=; HttpOnly; Path=/; Max-Age=0;');
        return { success: true };
    };

    public verifyGrowerToken = ({ req }: ReqInfos) => {
        const token = req.cookies.growerToken;
        if (!token) return false;
        return this.growerUseCases.verifyToken(token);
    };

    public changeGrowerPassword = async (currentPassword: string, newPassword: string, { req }: ReqInfos) => {
        try {
            const token = req.cookies.growerToken;
            if (!token) {
                throw new Error("Token d'authentification manquant");
            }
            const growerData = this.growerUseCases.verifyToken(token);
            if (!growerData || typeof growerData === 'boolean') {
                throw new Error('Token invalide');
            }
            return await this.growerUseCases.changePassword(growerData.id, currentPassword, newPassword);
        } catch (error) {
            throw new Error(`Erreur lors du changement de mot de passe: ${error}`);
        }
    };

    public requestGrowerPasswordReset = async (email: string) => {
        return await this.growerUseCases.requestPasswordReset(email);
    };

    public resetGrowerPassword = async (token: string, newPassword: string) => {
        return await this.growerUseCases.resetPassword(token, newPassword);
    };
}