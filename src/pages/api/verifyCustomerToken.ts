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
    const result = await apiUseCases.verifyCustomerToken({ req, res });
    
    if (!result) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    return res.status(200).json({ data: result });
  } catch (error) {
    console.error('Error verifying customer token:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}