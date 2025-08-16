import { NextApiRequest, NextApiResponse } from 'next';

interface AttendanceRequest {
  email: string;
  marketDate?: string;
}

interface AttendanceResponse {
  success: boolean;
  message: string;
}

// Validation simple de l'email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AttendanceResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { email, marketDate }: AttendanceRequest = req.body;

    // Validation des données
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'L\'adresse email est requise'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'L\'adresse email n\'est pas valide'
      });
    }

    // Dans une vraie implémentation, on sauvegarderait cette information en base de données
    // et on pourrait envoyer un email de confirmation
    
    console.log(`Nouvelle intention de venue au marché:`, {
      email,
      marketDate: marketDate || 'Prochain samedi',
      timestamp: new Date().toISOString()
    });

    // Simulation d'une sauvegarde réussie
    res.status(200).json({
      success: true,
      message: 'Merci ! Nous avons bien noté votre intention de venir au marché.'
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'intention de venue:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue. Veuillez réessayer plus tard.'
    });
  }
}