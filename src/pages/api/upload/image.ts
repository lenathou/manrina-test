import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Désactiver le parser de body par défaut de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadResponse {
  imageUrl?: string;
  error?: string;
}

const isValidImageType = (mimetype: string): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(mimetype);
};

// Validation supplémentaire de l'extension de fichier
const isValidImageExtension = (filename: string): boolean => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
};

// Validation de la taille du fichier
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: MAX_FILE_SIZE,
      keepExtensions: true,
      // Restreindre le dossier de destination temporaire
      uploadDir: process.env.UPLOAD_TEMP_DIR || '/tmp',
      // Limiter le nombre de fichiers
      maxFiles: 1,
    });

    const [, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validation du type MIME
    if (!isValidImageType(file.mimetype || '')) {
      // Nettoyer le fichier temporaire
      if (file.filepath) {
        fs.unlinkSync(file.filepath);
      }
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.' });
    }

    // Validation de l'extension de fichier
    if (!isValidImageExtension(file.originalFilename || '')) {
      // Nettoyer le fichier temporaire
      if (file.filepath) {
        fs.unlinkSync(file.filepath);
      }
      return res.status(400).json({ error: 'Invalid file extension.' });
    }

    // Validation de la taille
    if (file.size && file.size > MAX_FILE_SIZE) {
      // Nettoyer le fichier temporaire
      if (file.filepath) {
        fs.unlinkSync(file.filepath);
      }
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }

    // Lire le fichier et le convertir en base64
    const fileBuffer = fs.readFileSync(file.filepath);
    const base64Data = fileBuffer.toString('base64');
    const mimeType = file.mimetype || 'image/jpeg';
    
    // Nettoyer le fichier temporaire après lecture
    fs.unlinkSync(file.filepath);
    
    // Créer l'entrée dans la base de données
    const imageRecord = await prisma.uploadedImage.create({
      data: {
        filename: file.originalFilename || 'uploaded-image',
        mimeType: mimeType,
        data: base64Data,
        size: file.size || 0,
      },
    });

    // Retourner l'URL pour récupérer l'image
    const imageUrl = `/api/images/${imageRecord.id}`;

    return res.status(200).json({ imageUrl });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  } finally {
    await prisma.$disconnect();
  }
}