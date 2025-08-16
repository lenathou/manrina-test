import { NextApiRequest, NextApiResponse } from 'next';
import { SiretValidationService } from '@/server/services/siretValidationService';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { siret } = req.body;

        if (!siret) {
            return res.status(400).json({
                success: false,
                message: 'Le numéro SIRET est requis'
            });
        }

        const siretValidationService = new SiretValidationService();
        const result = await siretValidationService.validateSiret(siret);

        return res.status(200).json(result);

    } catch (error) {
        console.error('Erreur lors de la validation SIRET:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
}