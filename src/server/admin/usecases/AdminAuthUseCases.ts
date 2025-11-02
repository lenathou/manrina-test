import { AdminUseCases } from '@/server/admin/AdminUseCases';
import { IAdminLoginPayload } from '@/server/admin/IAdmin';
import { ReqInfos } from '@/service/BackendFetchService';

export class AdminAuthUseCases {
    constructor(private adminUseCases: AdminUseCases) {}

    async login(loginPayload: IAdminLoginPayload, { res }: ReqInfos) {
        try {
            const jwt = await this.adminUseCases.login(loginPayload);
            res.setHeader('Set-Cookie', `adminToken=${jwt.jwt}; HttpOnly; Path=/; Max-Age=36000;`); // 10 hours
            return { success: true };
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }

    logout({ res }: ReqInfos) {
        res.setHeader('Set-Cookie', 'adminToken=; HttpOnly; Path=/; Max-Age=0;');
        return { success: true };
    }

    verify({ req }: ReqInfos) {
        const token = req.cookies.adminToken;
        if (!token) return false;
        return this.adminUseCases.verifyToken(token);
    }

    async changePassword(currentPassword: string, newPassword: string, { req }: ReqInfos) {
        try {
            const token = req.cookies.adminToken;
            if (!token) {
                throw new Error("Token d'authentification manquant");
            }
            const adminData = this.adminUseCases.verifyToken(token);
            if (!adminData || typeof adminData === 'boolean') {
                throw new Error('Token invalide');
            }
            await this.adminUseCases.changePassword(adminData.id, currentPassword, newPassword);
            return { success: true, message: 'Mot de passe modifié avec succès' };
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }
}