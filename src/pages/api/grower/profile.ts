import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            // Vérifier l'authentification du producteur
            const growerTokenPayload = apiUseCases.verifyGrowerToken({ req, res });
            
            if (!growerTokenPayload) {
                return res.status(401).json({ error: 'Non authentifié' });
            }

            const grower = await apiUseCases.findGrowerById(growerTokenPayload.id);

            if (!grower) {
                return res.status(404).json({ error: 'Producteur non trouvé' });
            }

            // Récupérer toutes les affectations actives
            const assignments = await apiUseCases.getActiveAssignments();

            res.status(200).json({
                grower: {
                    id: grower.id,
                    name: grower.name,
                    email: grower.email,
                    bio: grower.bio,
                    assignmentId: grower.assignmentId,
                },
                assignments,
            });
        } catch (error) {
            console.error('Error fetching grower profile:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
        }
    } else if (req.method === 'PUT') {
        try {
            // Vérifier l'authentification du producteur
            const growerTokenPayload = apiUseCases.verifyGrowerToken({ req, res });
            
            if (!growerTokenPayload) {
                return res.status(401).json({ error: 'Non authentifié' });
            }
            
            const { bio, assignmentId } = req.body;

            // Vérifier que l'affectation existe si fournie
            if (assignmentId) {
                const assignment = await apiUseCases.getAssignmentById(assignmentId);
                
                if (!assignment) {
                    return res.status(400).json({ error: 'Affectation non trouvée' });
                }
                
                if (!assignment.isActive) {
                    return res.status(400).json({ error: 'Cette affectation n\'est plus active' });
                }
            }

            // Récupérer d'abord les données actuelles du producteur
            const currentGrower = await apiUseCases.findGrowerById(growerTokenPayload.id);
            
            if (!currentGrower) {
                return res.status(404).json({ error: 'Producteur non trouvé' });
            }

            const updatedGrower = await apiUseCases.updateGrower({
                id: growerTokenPayload.id,
                name: currentGrower.name,
                profilePhoto: currentGrower.profilePhoto,
                siret: currentGrower.siret,
                approved: currentGrower.approved,
                approvedAt: currentGrower.approvedAt,
                updatedAt: new Date(),
                phone: currentGrower.phone,
                commissionRate: currentGrower.commissionRate,
                bio: bio || null,
                assignmentId: assignmentId || null,
            });

            res.status(200).json({
                grower: {
                    id: updatedGrower.id,
                    name: updatedGrower.name,
                    email: updatedGrower.email,
                    bio: updatedGrower.bio,
                    assignmentId: updatedGrower.assignmentId,
                },
            });
        } catch (error) {
            console.error('Error updating grower profile:', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}