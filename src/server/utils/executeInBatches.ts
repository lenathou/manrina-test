export async function executeInBatches<T, Response>(
    items: T[],
    batchSize: number,
    functionToExecute: (item: T) => Promise<Response>,
) {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        console.log(`run batchs ${i}->${i + batchSize} of ${items.length}`);
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map((item) => functionToExecute(item)));
        results.push(...batchResults);
    }
    return results;
}
