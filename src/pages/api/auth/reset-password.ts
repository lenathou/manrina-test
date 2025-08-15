import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { token, password, userType } = req.body;

    if (!token || !password || !userType) {
        return res.status(400).json({ message: 'Token, password, and userType are required' });
    }

    if (!['customer', 'grower'].includes(userType)) {
        return res.status(400).json({ message: 'Invalid userType. Must be "customer" or "grower"' });
    }

    try {
        let result: { success: boolean; message: string };
        
        if (userType === 'customer') {
            result = await apiUseCases.resetCustomerPassword(token, password);
        } else {
            result = await apiUseCases.resetGrowerPassword(token, password);
        }

        if (result.success) {
            return res.status(200).json({ message: result.message });
        } else {
            return res.status(400).json({ message: result.message });
        }
    } catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
}
