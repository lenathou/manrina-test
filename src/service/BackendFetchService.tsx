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

const fetchFromBackend = (messageToSend: MessageToSend) => {
    return fetch(apiRoute(messageToSend.functionToRun), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Inclure les cookies dans les requêtes
        body: JSON.stringify({ params: messageToSend.params }),
    })
        .then((res) => res.json())
        .then((answer) => {
            if (typeof answer === 'object' && answer !== null && 'error' in answer) {
                console.log('answer.error', answer.error);
                const error = answer.error as string;
                console.error('Error occured when sending', messageToSend, error);
                throw new Error(error);
            }
            return answer.data;
        });
};

export const backendFetchService = new Proxy(
    {},
    {
        get: function (target: unknown, prop: string) {
            return function (...args: unknown[]) {
                // console.log(`Calling ${prop} with arguments:`, args);
                const messageToSend: MessageToSend = {
                    functionToRun: prop,
                    params: args,
                };
                return fetchFromBackend(messageToSend);
            };
        },
    },
) as BackendFetchService;
