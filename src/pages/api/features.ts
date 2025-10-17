import type { NextApiRequest, NextApiResponse } from 'next';

// Global in-memory feature flags (dev-friendly). In production, persist in DB.
type FeatureFlags = { deliveryEnabled: boolean };
const globalFeatures: FeatureFlags = { deliveryEnabled: false };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(globalFeatures);
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { deliveryEnabled } = body ?? {};
      if (typeof deliveryEnabled === 'boolean') {
        globalFeatures.deliveryEnabled = deliveryEnabled;
      }
      return res.status(200).json(globalFeatures);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method Not Allowed');
}