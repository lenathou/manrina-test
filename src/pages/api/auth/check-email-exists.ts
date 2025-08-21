import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // Vérifier l'existence de l'email dans tous les types d'utilisateurs
        const customerExists = await apiUseCases.findCustomerByEmail(email);
        const growerExists = await apiUseCases.findGrowerByEmail(email);

        const accounts = [];

        if (customerExists) {
            accounts.push({
                type: 'customer',
                label: 'Client',
                email: customerExists.email,
                name: customerExists.name,
            });
        }

        if (growerExists) {
            accounts.push({
                type: 'grower',
                label: 'Producteur',
                email: growerExists.email,
                name: growerExists.name,
            });
        }

        return res.status(200).json({
            exists: accounts.length > 0,
            accounts: accounts,
            multiple: accounts.length > 1,
        });
    } catch (error) {
        console.error('Email check error:', error);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
}
