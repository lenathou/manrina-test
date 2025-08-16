import type { NextApiRequest, NextApiResponse } from 'next';
import { defaultCache } from '../../../utils/cache';

type CacheStatusResponse = {
    environment: {
        vercel: string | undefined;
        platform: string;
        cwd: string;
        tmpDir: string;
        nodeEnv: string | undefined;
    };
    cache: {
        type: string;
        isWorking: boolean;
        testData?: any;
        error?: string;
    };
    filesystem: {
        cwdWritable: boolean;
        tmpWritable: boolean;
    };
    timestamp: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<CacheStatusResponse | { error: string }>
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Test cache functionality
        const testKey = 'cache_test_' + Date.now();
        const testData = { message: 'Cache test successful', timestamp: new Date().toISOString() };
        
        let cacheWorking = false;
        let cacheError: string | undefined;
        let retrievedData: any;

        try {
            // Test cache set/get
            defaultCache.set(testKey, testData, 5000); // 5 second expiry
            retrievedData = defaultCache.get(testKey);
            cacheWorking = retrievedData !== null && retrievedData.message === testData.message;
            
            // Clean up test data
            defaultCache.delete(testKey);
        } catch (error) {
            cacheError = error instanceof Error ? error.message : 'Unknown cache error';
            cacheWorking = false;
        }

        // Test filesystem permissions
        const fs = await import('fs');
        const path = await import('path');
        
        let cwdWritable = false;
        let tmpWritable = false;

        try {
            const testFile = path.join(process.cwd(), 'test_write.tmp');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            cwdWritable = true;
        } catch {
            cwdWritable = false;
        }

        try {
            const testFile = path.join('/tmp', 'test_write.tmp');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            tmpWritable = true;
        } catch {
            tmpWritable = false;
        }

        const response: CacheStatusResponse = {
            environment: {
                vercel: process.env.VERCEL,
                platform: process.platform,
                cwd: process.cwd(),
                tmpDir: '/tmp',
                nodeEnv: process.env.NODE_ENV,
            },
            cache: {
                type: defaultCache.constructor.name,
                isWorking: cacheWorking,
                testData: cacheWorking ? retrievedData : undefined,
                error: cacheError,
            },
            filesystem: {
                cwdWritable,
                tmpWritable,
            },
            timestamp: new Date().toISOString(),
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Cache status check failed:', error);
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        });
    }
}