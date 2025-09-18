/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prisma, PrismaClient } from '@prisma/client';
import {
    IProduct,
    IProductUpdateFields,
    IProductVariant,
    IProductVariantUpdateFields,
    IUnit,
    VatRate,
} from './IProduct';
import { ProductEntity } from './ProductEntity';
import { ProductRepository } from './ProductRepository';

export class ProductRepositoryPrismaImplementation implements ProductRepository {
    constructor(private prisma: PrismaClient) {}

    public createProducts = async (products: IProduct[]): Promise<ProductEntity[]> => {
        return Promise.all(products.map((product) => this.createProduct(new ProductEntity(product))));
    };

    public createProduct = async (productDto: ProductEntity) => {
        const result = await this.prisma.product.upsert({
            where: {
                id: productDto.id,
            },
            create: {
                id: productDto.id,
                category: productDto.category,
                name: productDto.name,
                description: productDto.description,
                imageUrl: productDto.imageUrl,
                showInStore: productDto.showInStore,
                globalStock: productDto.globalStock,
                baseUnitId: productDto.baseUnitId,
                baseQuantity: productDto.baseQuantity,
                variants: {
                    createMany: {
                        data: productDto.variants.map((variant) => ({
                            id: variant.id,
                            optionSet: variant.optionSet,
                            optionValue: variant.optionValue,
                            description: variant.description,
                            imageUrl: variant.imageUrl,
                            price: variant.price,
                            stock: variant.stock,
                        })),
                    },
                },
            },
            update: {
                category: productDto.category,
                name: productDto.name,
                description: productDto.description,
                imageUrl: productDto.imageUrl,
                showInStore: productDto.showInStore,
                globalStock: productDto.globalStock,
                baseUnitId: productDto.baseUnitId,
                baseQuantity: productDto.baseQuantity,
                variants: {
                    upsert: productDto.variants.map((variant) => ({
                        where: { id: variant.id },
                        create: {
                            id: variant.id,
                            optionSet: variant.optionSet,
                            optionValue: variant.optionValue,
                            description: variant.description,
                            imageUrl: variant.imageUrl,
                            price: variant.price,
                            stock: variant.stock,
                        },
                        update: {
                            optionSet: variant.optionSet,
                            optionValue: variant.optionValue,
                            description: variant.description,
                            imageUrl: variant.imageUrl,
                            price: variant.price,
                            stock: variant.stock,
                        },
                    })),
                },
            },
            include: {
                variants: true,
            },
        });
        return new ProductEntity({
            ...result,
            variants: result.variants.map((variant) => ({
                ...variant,
                price: Number(variant.price),
                stock: Number(variant.stock),
                quantity: variant.quantity ? Number(variant.quantity) : null,
            })),
        } as IProduct);
    };

    public getAllProducts = async () => {
        const products = await this.prisma.product.findMany({
            include: {
                variants: true,
                baseUnit: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return products.map(
            (product) =>
                new ProductEntity({
                    ...product,
                    variants: product.variants.map((variant) => ({
                        ...variant,
                        price: Number(variant.price),
                        stock: Number(variant.stock),
                        quantity: variant.quantity ? Number(variant.quantity) : null,
                    })),
                } as IProduct),
        );
    };

    public getAllProductsWithStock = async () => {
        const products = await this.prisma.product.findMany({
            where: {
                showInStore: true,
                variants: {
                    some: {
                        stock: { gt: 0 },
                    },
                },
            },
            include: {
                variants: {
                    where: {
                        stock: { gt: 0 },
                    },
                },
                baseUnit: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return products.map(
            (product) =>
                new ProductEntity({
                    ...product,
                    variants: product.variants.map((variant) => ({
                        ...variant,
                        price: Number(variant.price),
                        stock: Number(variant.stock),
                        quantity: variant.quantity ? Number(variant.quantity) : null,
                    })),
                } as IProduct),
        );
    };

    public updateVariant = async (variantId: string, updates: IProductVariantUpdateFields) => {
        const { vatRate, unitId, unit, ...restUpdates } = updates;

        const prismaUpdateData: Prisma.ProductVariantUpdateInput = {
            ...restUpdates,
            ...(unitId !== undefined && { unitId: unitId || undefined }),
            ...(vatRate !== undefined && { vatRate: vatRate ? JSON.parse(JSON.stringify(vatRate)) : undefined }),
        };

        const result = await this.prisma.productVariant.update({
            where: { id: variantId },
            data: prismaUpdateData,
        });
        return {
            ...result,
            price: Number(result.price),
            stock: Number(result.stock),
            quantity: result.quantity ? Number(result.quantity) : null,
        } as IProductVariant;
    };

    public createVariant = async (productId: string, variantData: Omit<IProductVariant, 'id'>) => {
        const result = await this.prisma.productVariant.create({
            data: {
                productId: productId,
                optionSet: variantData.optionSet || 'variant',
                optionValue: variantData.optionValue || '',
                description: variantData.description || null,
                imageUrl: variantData.imageUrl || null,
                price: variantData.price,
                stock: variantData.stock || 0,
                unitId: variantData.unitId || null,
                quantity: variantData.quantity || null,
                vatRate: variantData.vatRate ? JSON.parse(JSON.stringify(variantData.vatRate)) : null,
            },
        });
        return {
            ...result,
            price: Number(result.price),
            stock: Number(result.stock),
            quantity: result.quantity ? Number(result.quantity) : null,
        } as IProductVariant;
    };

    public deleteVariant = async (variantId: string): Promise<void> => {
        await this.prisma.productVariant.delete({
            where: { id: variantId },
        });
    };

    public updateProduct = async (productId: string, updates: IProductUpdateFields) => {
        // Transformer les données pour Prisma
        const { baseUnit, ...prismaUpdates } = updates;
        const prismaData = {
            ...prismaUpdates,
            // Si baseUnit est fourni, utiliser son ID pour la relation
            ...(baseUnit !== undefined && {
                baseUnitId: baseUnit?.id || null,
            }),
        };

        const result = await this.prisma.product.update({
            where: { id: productId },
            data: prismaData,
            include: {
                variants: {
                    include: {
                        unit: true,
                    },
                },
                baseUnit: true,
            },
        });

        // Convertir le résultat en IProduct
        return {
            ...result,
            variants: result.variants.map(
                (v) =>
                    ({
                        ...v,
                        price: Number(v.price),
                        stock: Number(v.stock),
                        quantity: v.quantity ? Number(v.quantity) : null,
                        vatRate: v.vatRate as VatRate | null,
                        showDescriptionOnPrintDelivery: v.showDescriptionOnPrintDelivery ?? undefined,
                        unit: v.unit
                            ? {
                                  id: v.unit.id,
                                  name: v.unit.name,
                                  symbol: v.unit.symbol,
                                  category: v.unit.category,
                                  baseUnit: v.unit.baseUnit,
                                  conversionFactor: v.unit.conversionFactor ? Number(v.unit.conversionFactor) : null,
                                  isActive: v.unit.isActive,
                              }
                            : null,
                    }) as IProductVariant,
            ),
            baseUnit: result.baseUnit
                ? {
                      id: result.baseUnit.id,
                      name: result.baseUnit.name,
                      symbol: result.baseUnit.symbol,
                      category: result.baseUnit.category,
                      baseUnit: result.baseUnit.baseUnit,
                      conversionFactor: result.baseUnit.conversionFactor,
                      isActive: result.baseUnit.isActive,
                  }
                : null,
        } as IProduct;
    };

    public deleteProduct = async (productId: string): Promise<void> => {
        // Supprimer d'abord toutes les variantes du produit
        await this.prisma.productVariant.deleteMany({
            where: { productId: productId },
        });

        // Ensuite supprimer le produit
        await this.prisma.product.delete({
            where: { id: productId },
        });
    };

    public getAllUnits = async (): Promise<IUnit[]> => {
        const units = await this.prisma.unit.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return units.map((unit) => ({
            id: unit.id,
            name: unit.name,
            symbol: unit.symbol,
            category: unit.category,
            baseUnit: unit.baseUnit,
            conversionFactor: unit.conversionFactor,
            isActive: unit.isActive,
        }));
    };
}
