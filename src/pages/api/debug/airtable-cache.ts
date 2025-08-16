import type { NextApiRequest, NextApiResponse } from 'next';
import { AirtableService } from '../../../service/airtable';
import { defaultCache } from '../../../utils/cache';

type AirtableCacheResponse = {
    status: 'success' | 'degraded' | 'error';
    cache: {
        hit: boolean;
        data?: any;
        error?: string;
        cacheType: string;
    };
    direct: {
        success: boolean;
        data?: any;
        error?: string;
    };
    performance: {
        cacheTime?: number;
        directTime?: number;
        improvement?: string;
    };
    environment: {
        vercel: string | undefined;
        cacheImplementation: string;
    };
    timestamp: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<AirtableCacheResponse | { error: string }>
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const airtableService = new AirtableService();
        
        // Test 1: Try cached version
        let cacheHit = false;
        let cacheData: any;
        let cacheError: string | undefined;
        let cacheTime: number | undefined;
        
        const cacheStartTime = Date.now();
        try {
            cacheData = await airtableService.getCurrentSumupProductsCached();
            cacheTime = Date.now() - cacheStartTime;
            cacheHit = true;
        } catch (error) {
            cacheError = error instanceof Error ? error.message : 'Cache call failed';
            cacheHit = false;
        }

        // Test 2: Direct call (bypass cache)
        let directSuccess = false;
        let directData: any;
        let directError: string | undefined;
        let directTime: number | undefined;
        
        const directStartTime = Date.now();
        try {
            directData = await airtableService.getCurrentSumupProducts();
            directTime = Date.now() - directStartTime;
            directSuccess = true;
        } catch (error) {
            directError = error instanceof Error ? error.message : 'Direct call failed';
            directSuccess = false;
        }

        // Calculate performance improvement
        let improvement: string | undefined;
        if (cacheTime && directTime) {
            const speedup = Math.round((directTime / cacheTime) * 100) / 100;
            improvement = `${speedup}x faster with cache`;
        } else if (directTime) {
            improvement = `Direct call: ${directTime}ms`;
        }

        // Determine overall status
        let status: 'success' | 'degraded' | 'error';
        if (cacheHit && directSuccess) {
            status = 'success';
        } else if (directSuccess) {
            status = 'degraded'; // Working but no cache benefit
        } else {
            status = 'error';
        }

        const response: AirtableCacheResponse = {
            status,
            cache: {
                hit: cacheHit,
                data: cacheHit ? { count: Array.isArray(cacheData) ? cacheData.length : 0 } : undefined,
                error: cacheError,
                cacheType: defaultCache.constructor.name,
            },
            direct: {
                success: directSuccess,
                data: directSuccess ? { count: Array.isArray(directData) ? directData.length : 0 } : undefined,
                error: directError,
            },
            performance: {
                cacheTime,
                directTime,
                improvement,
            },
            environment: {
                vercel: process.env.VERCEL,
                cacheImplementation: defaultCache.constructor.name,
            },
            timestamp: new Date().toISOString(),
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Airtable cache test failed:', error);
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        });
    }
}