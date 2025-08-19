import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configuration pour désactiver le parser de body par défaut de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

// Types pour la réponse
interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

// Fonction pour valider le type de fichier
const isValidImageType = (mimetype: string): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(mimetype);
};

// Fonction pour générer un nom de fichier unique
const generateFileName = (originalName: string): string => {
  const ext = path.extname(originalName);
  const uuid = uuidv4();
  return `${uuid}${ext}`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Méthode non autorisée'
    });
  }

  try {
    // Configuration de formidable
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      keepExtensions: true,
      multiples: false,
    });

    // Parser la requête
    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier fourni'
      });
    }

    // Valider le type de fichier
    if (!isValidImageType(file.mimetype || '')) {
      return res.status(400).json({
        success: false,
        error: 'Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.'
      });
    }

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'partners');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const fileName = generateFileName(file.originalFilename || 'image');
    const filePath = path.join(uploadsDir, fileName);

    // Copier le fichier vers le dossier de destination
    fs.copyFileSync(file.filepath, filePath);

    // Supprimer le fichier temporaire
    fs.unlinkSync(file.filepath);

    // Retourner l'URL de l'image
    const imageUrl = `/uploads/partners/${fileName}`;
    
    return res.status(200).json({
      success: true,
      imageUrl
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
}