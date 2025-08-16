import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { includeStock } = req.body;
    const result = await apiUseCases.getAllPanyen(includeStock || false);
    return res.status(200).json({ data: result });
  } catch (error) {
    console.error('Error fetching panyen:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}