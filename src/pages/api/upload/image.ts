import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      keepExtensions: true,
    });

    const [, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validation du type de fichier
    if (!isValidImageType(file.mimetype || '')) {
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.' });
    }

    // Lire le fichier et le convertir en base64
    const fileBuffer = fs.readFileSync(file.filepath);
    const base64Data = fileBuffer.toString('base64');
    const mimeType = file.mimetype || 'image/jpeg';
    
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