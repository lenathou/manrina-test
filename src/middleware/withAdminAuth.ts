import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server/index';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';

export function withAdminAuth(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            // Vérifier le token admin
            const adminData = apiUseCases.verifyAdminToken({ req, res });
            
            if (!adminData) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Ajouter les données admin à la requête
            (req as NextApiRequest & { admin: IAdminTokenPayload }).admin = adminData;
            
            // Continuer avec le handler
            return await handler(req, res);
        } catch (error) {
            console.error('Admin auth error:', error);
            return res.status(401).json({ error: 'Unauthorized' });
        }
    };
}