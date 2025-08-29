import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';
import { IAssignmentFilters } from '@/server/assignment/IAssignment';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const { isActive, search } = req.query;
            
            const filters: IAssignmentFilters = {};
            
            if (isActive !== undefined) {
                filters.isActive = isActive === 'true';
            }
            
            if (search) {
                filters.search = search as string;
            }
            
            const assignments = await apiUseCases.getAllAssignments(filters);
            
            res.status(200).json(assignments);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des affectations' });
        }
    } else if (req.method === 'POST') {
        try {
            const { name, description, color, isActive } = req.body;
            
            if (!name) {
                return res.status(400).json({ error: 'Le nom est requis' });
            }
            
            const assignment = await apiUseCases.createAssignment({
                name,
                description,
                color,
                isActive: isActive ?? true,
            });
            
            res.status(201).json(assignment);
        } catch (error) {
            console.error('Error creating assignment:', error);
            if (error instanceof Error && error.message.includes('existe déjà')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Erreur lors de la création de l\'affectation' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}