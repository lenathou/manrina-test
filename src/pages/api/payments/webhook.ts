import { NextApiRequest, NextApiResponse } from 'next';
import { paymentUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            // Get the raw body as a buffer
            const chunks = [];
            for await (const chunk of req) {
                chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const rawBody = Buffer.concat(chunks);

            // Process the webhook
            await paymentUseCases.handleWebhook(rawBody, req.headers as Record<string, string>);
            return res.status(200).json({ received: true });
        } catch (err) {
            console.error('Error processing webhook:', err);
            return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
