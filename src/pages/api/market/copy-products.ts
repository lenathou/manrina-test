import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { CopySourceType, CopyTargetType } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case 'POST':
                return await copyProduct(req, res);
            case 'GET':
                return await getCopyHistory(req, res);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Copy products API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// POST /api/market/copy-products - Copier un produit entre marché et livraison
async function copyProduct(req: NextApiRequest, res: NextApiResponse) {
    const {
        sourceType,
        targetType,
        sourceProductId,
        targetSessionId, // Pour copier vers le marché
        copiedBy,
        notes,
    } = req.body;

    if (!sourceType || !targetType || !sourceProductId || !copiedBy) {
        return res.status(400).json({
            error: 'Source type, target type, source product ID, and copied by are required',
        });
    }

    // Validation des types
    if (!Object.values(CopySourceType).includes(sourceType) || !Object.values(CopyTargetType).includes(targetType)) {
        return res.status(400).json({ error: 'Invalid source or target type' });
    }

    let sourceProduct: any;
    let newProduct: any;

    // Récupérer le produit source
    if (sourceType === CopySourceType.MARKET) {
        sourceProduct = await prisma.marketProduct.findUnique({
            where: { id: sourceProductId },
            include: {
                grower: true,
                marketSession: true,
            },
        });
    } else {
        sourceProduct = await prisma.product.findUnique({
            where: { id: sourceProductId },
            include: {
                growers: {
                    include: {
                        grower: true,
                    },
                },
                variants: true,
            },
        });
    }

    if (!sourceProduct) {
        return res.status(404).json({ error: 'Source product not found' });
    }

    // Copier vers le système cible
    if (targetType === CopyTargetType.MARKET) {
        // Copier vers le marché
        if (!targetSessionId) {
            return res.status(400).json({ error: 'Target session ID is required for market copy' });
        }

        // Vérifier que la session existe
        const session = await prisma.marketSession.findUnique({
            where: { id: targetSessionId },
        });

        if (!session) {
            return res.status(404).json({ error: 'Target market session not found' });
        }

        // Adapter les données selon le type de source
        const productData =
            sourceType === CopySourceType.MARKET
                ? {
                      name: sourceProduct.name,
                      description: sourceProduct.description,
                      imageUrl: sourceProduct.imageUrl,
                      price: Number((sourceProduct as any).price || 0),
                      stock: (sourceProduct as any).stock || 0,
                      unit: (sourceProduct as any).unit,
                      category: sourceProduct.category,
                      marketSessionId: targetSessionId,
                      growerId: (sourceProduct as any).growerId,
                      isActive: true,
                  }
                : {
                      name: sourceProduct.name,
                      description: sourceProduct.description,
                      imageUrl: sourceProduct.imageUrl,
                      price: Number(sourceProduct.variants?.[0]?.price || 0),
                      stock: 0,
                      unit: sourceProduct.variants?.[0]?.unit,
                      category: sourceProduct.category,
                      marketSessionId: targetSessionId,
                      growerId: sourceProduct.growers?.[0]?.growerId,
                      isActive: true,
                  };

        newProduct = await prisma.marketProduct.create({
            data: productData,
            include: {
                grower: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                marketSession: {
                    select: {
                        id: true,
                        name: true,
                        date: true,
                    },
                },
            },
        });
    } else {
        // Copier vers le système de livraison
        newProduct = await prisma.product.create({
            data: {
                name: sourceProduct.name,
                description: sourceProduct.description,
                imageUrl: sourceProduct.imageUrl,
                category: sourceProduct.category,
            },
            include: {
                growers: {
                    include: {
                        grower: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }

    // Enregistrer l'historique de copie
    const copyHistory = await prisma.productCopyHistory.create({
        data: {
            sourceType,
            targetType,
            sourceProductId,
            targetProductId: newProduct.id,
            marketProductId: targetType === CopyTargetType.MARKET ? newProduct.id : null,
            productId: targetType === CopyTargetType.DELIVERY ? newProduct.id : null,
            copiedBy,
            notes,
        },
    });

    return res.status(201).json({
        newProduct,
        copyHistory,
        message: `Product successfully copied from ${sourceType.toLowerCase()} to ${targetType.toLowerCase()}`,
    });
}

// GET /api/market/copy-products - Récupérer l'historique des copies
async function getCopyHistory(req: NextApiRequest, res: NextApiResponse) {
    const { productId, sourceType, targetType, limit } = req.query;

    const where: any = {};

    if (productId && typeof productId === 'string') {
        where.OR = [{ sourceProductId: productId }, { targetProductId: productId }];
    }

    if (sourceType && typeof sourceType === 'string') {
        where.sourceType = sourceType as CopySourceType;
    }

    if (targetType && typeof targetType === 'string') {
        where.targetType = targetType as CopyTargetType;
    }

    const history = await prisma.productCopyHistory.findMany({
        where,
        include: {
            marketProduct: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    marketSession: {
                        select: {
                            name: true,
                            date: true,
                        },
                    },
                },
            },
            product: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                },
            },
        },
        orderBy: {
            copiedAt: 'desc',
        },
        take: limit ? parseInt(limit as string) : undefined,
    });

    return res.status(200).json(history);
}
