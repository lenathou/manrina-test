import type { NextApiRequest, NextApiResponse } from 'next';
import products from '../../../mock/products.json';
import { ProductType } from '../../../types/ProductType';

const initialProducts = products
    .filter((product) => product['Item id (Do not change)'])
    .sort((a, b) => (a['Item name'] as string).localeCompare(b['Item name']))
    .map((product) => {
        return {
            id: product['Item id (Do not change)'],
            productName: product['Item name'],
            price: product['Price'],
            image: product['Image 1'],
        } as ProductType;
    });

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { productId } = req.query;
        console.log(productId);
        const product = initialProducts.find((product) => product.id === productId);
        return res.status(200).json({ data: product });
    }
    // 405 means "Method Not Allowed"
    return res.status(405).end();
}
