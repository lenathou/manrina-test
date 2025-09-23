import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid image ID' });
  }

  try {
    // Récupérer l'image depuis la base de données
    const image = await prisma.uploadedImage.findUnique({
      where: { id },
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Convertir le base64 en buffer
    const imageBuffer = Buffer.from(image.data, 'base64');

    // Définir les headers appropriés
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Content-Length', imageBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Cache 1 an

    // Envoyer l'image
    res.status(200).send(imageBuffer);

  } catch (error) {
    console.error('Error retrieving image:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}