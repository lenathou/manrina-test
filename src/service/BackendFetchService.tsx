import { NextApiRequest, NextApiResponse } from 'next';
import type { ApiUseCases } from '../server/ApiUseCases';

export type ReqInfos = {
    req: NextApiRequest;
    res: NextApiResponse;
};
declare type RemoveLastParameterIfMatch<T, Match> = T extends (...args: infer P) => infer R
    ? P extends [...infer Rest, Match]
        ? (...args: Rest) => R
        : T
    : never;

declare type ExtractCallableMethods<T> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: RemoveLastParameterIfMatch<T[K], ReqInfos>;
};

export type BackendFetchService = ExtractCallableMethods<ApiUseCases>;

type MessageToSend = {
    functionToRun: string;
    params: unknown[];
};
const apiRoute = (action: string) => `/api/${action}`;

const fetchFromBackend = async (messageToSend: MessageToSend) => {
    try {
        const response = await fetch(apiRoute(messageToSend.functionToRun), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ params: messageToSend.params }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const answer = await response.json();

        if (typeof answer === 'object' && answer !== null && 'error' in answer) {
            console.error('BackendFetchService - API Error:', answer.error);
            throw new Error(answer.error as string);
        }

        return answer.data;
    } catch (error) {
        console.error('BackendFetchService - Fetch error:', error);
        throw error;
    }
};

export const backendFetchService = new Proxy(
    {},
    {
        get: function (target: unknown, prop: string) {
            return async function (...args: unknown[]) {
                const messageToSend: MessageToSend = {
                    functionToRun: prop,
                    params: args,
                };
                return await fetchFromBackend(messageToSend);
            };
        },
    },
) as BackendFetchService;
