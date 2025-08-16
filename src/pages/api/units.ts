import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const units = await apiUseCases.getAllUnits();
      res.status(200).json(units);
    } catch (error) {
      console.error('Error fetching units:', error);
      res.status(500).json({ error: 'Failed to fetch units' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}