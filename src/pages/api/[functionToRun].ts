import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';
import { ApiUseCases } from '@/server/ApiUseCases';

const shouldLogApiCalls = process.env.LOG_API_CALLS === 'true';

const genericActionHandler = async (request: NextApiRequest, res: NextApiResponse) => {
    if (request.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const functionToRun = request.query.functionToRun as string;
        const body = request.body as { params: unknown[] };
        if (functionToRun in apiUseCases) {
            if (shouldLogApiCalls) {
                console.log(`API call: ${functionToRun} with params: ${JSON.stringify(body.params)}`);
            }
            const result = await apiUseCases[
                functionToRun as keyof ApiUseCases
                // @ts-expect-error - params should be with the good format
            ](...(body.params || []), { req: request, res: res });
            return res.status(200).json({ data: result });
        }
        throw new Error(`Route ${functionToRun} does not exist`);
    } catch (e) {
        console.log(e);
        res.status(400).json({ error: (e as Error).message });
    }
};

export default genericActionHandler;
