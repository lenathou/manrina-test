import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'ID invalide' });
    }

    if (req.method === 'GET') {
        try {
            const assignment = await apiUseCases.getAssignmentById(id);

            if (!assignment) {
                return res.status(404).json({ error: 'Affectation non trouvée' });
            }

            res.status(200).json(assignment);
        } catch (error) {
            console.error('Error fetching assignment:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération de l\'affectation' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { name, description, color, isActive } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Le nom est requis' });
            }

            const assignment = await apiUseCases.updateAssignment(id, {
                name,
                description,
                color,
                isActive,
            });

            res.status(200).json(assignment);
        } catch (error: unknown) {
            console.error('Error updating assignment:', error);
            if (error instanceof Error) {
                if (error.message.includes('non trouvée')) {
                    return res.status(404).json({ error: error.message });
                }
                if (error.message.includes('existe déjà')) {
                    return res.status(400).json({ error: error.message });
                }
            }
            res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'affectation' });
        }
    } else if (req.method === 'DELETE') {
        try {
            await apiUseCases.deleteAssignment(id);

            res.status(204).end();
        } catch (error: unknown) {
            console.error('Error deleting assignment:', error);
            if (error instanceof Error && error.message.includes('non trouvée')) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Erreur lors de la suppression de l\'affectation' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}