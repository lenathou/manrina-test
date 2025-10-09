import { prisma } from '../database/prisma';

export interface IVariantDisplayPrice {
  variantId: string;
  displayPrice: number;
  priceSource: 'producer' | 'reference';
  lowestProducerPrice?: number;
  referencePrice: number;
}

export interface IProductDisplayPrice {
  productId: string;
  variants: IVariantDisplayPrice[];
}

export class ProductPriceService {
  /**
   * Récupère le prix d'affichage pour un variant donné
   * Priorité: prix producteur le plus bas > prix de référence
   */
  static async getVariantDisplayPrice(variantId: string): Promise<IVariantDisplayPrice> {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        growerVariantPrices: {
          where: {
            price: { gt: 0 } // Seulement les prix > 0
          },
          orderBy: {
            price: 'asc' // Trier par prix croissant pour avoir le plus bas en premier
          }
        }
      }
    });

    if (!variant) {
      throw new Error(`Variant with id ${variantId} not found`);
    }

    const referencePrice = Number(variant.price);
    const lowestProducerPrice = variant.growerVariantPrices.length > 0 
      ? Number(variant.growerVariantPrices[0].price) 
      : null;

    // Logique de priorité: prix producteur le plus bas si disponible, sinon prix de référence
    const displayPrice = lowestProducerPrice !== null ? lowestProducerPrice : referencePrice;
    const priceSource: 'producer' | 'reference' = lowestProducerPrice !== null ? 'producer' : 'reference';

    return {
      variantId,
      displayPrice,
      priceSource,
      lowestProducerPrice: lowestProducerPrice || undefined,
      referencePrice
    };
  }

  /**
   * Récupère les prix d'affichage pour tous les variants d'un produit
   */
  static async getProductDisplayPrices(productId: string): Promise<IProductDisplayPrice> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          include: {
            growerVariantPrices: {
              where: {
                price: { gt: 0 }
              },
              orderBy: {
                price: 'asc'
              }
            }
          }
        }
      }
    });

    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    const variants: IVariantDisplayPrice[] = product.variants.map(variant => {
      const referencePrice = Number(variant.price);
      const lowestProducerPrice = variant.growerVariantPrices.length > 0 
        ? Number(variant.growerVariantPrices[0].price) 
        : null;

      const displayPrice = lowestProducerPrice !== null ? lowestProducerPrice : referencePrice;
      const priceSource: 'producer' | 'reference' = lowestProducerPrice !== null ? 'producer' : 'reference';

      return {
        variantId: variant.id,
        displayPrice,
        priceSource,
        lowestProducerPrice: lowestProducerPrice || undefined,
        referencePrice
      };
    });

    return {
      productId,
      variants
    };
  }

  /**
   * Récupère les prix d'affichage pour plusieurs produits
   */
  static async getMultipleProductsDisplayPrices(productIds: string[]): Promise<IProductDisplayPrice[]> {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        variants: {
          include: {
            growerVariantPrices: {
              where: {
                price: { gt: 0 }
              },
              orderBy: {
                price: 'asc'
              }
            }
          }
        }
      }
    });

    return products.map(product => {
      const variants: IVariantDisplayPrice[] = product.variants.map(variant => {
        const referencePrice = Number(variant.price);
        const lowestProducerPrice = variant.growerVariantPrices.length > 0 
          ? Number(variant.growerVariantPrices[0].price) 
          : null;

        const displayPrice = lowestProducerPrice !== null ? lowestProducerPrice : referencePrice;
        const priceSource: 'producer' | 'reference' = lowestProducerPrice !== null ? 'producer' : 'reference';

        return {
          variantId: variant.id,
          displayPrice,
          priceSource,
          lowestProducerPrice: lowestProducerPrice || undefined,
          referencePrice
        };
      });

      return {
        productId: product.id,
        variants
      };
    });
  }

  /**
   * Récupère les prix d'affichage pour tous les produits visibles en boutique
   */
  static async getAllStoreProductsDisplayPrices(): Promise<IProductDisplayPrice[]> {
    const products = await prisma.product.findMany({
      where: { 
        showInStore: true,
        variants: {
          some: {
            stock: { gt: 0 }
          }
        }
      },
      include: {
        variants: {
          where: {
            stock: { gt: 0 }
          },
          include: {
            growerVariantPrices: {
              where: {
                price: { gt: 0 }
              },
              orderBy: {
                price: 'asc'
              }
            }
          }
        }
      }
    });

    return products.map(product => {
      const variants: IVariantDisplayPrice[] = product.variants.map(variant => {
        const referencePrice = Number(variant.price);
        const lowestProducerPrice = variant.growerVariantPrices.length > 0 
          ? Number(variant.growerVariantPrices[0].price) 
          : null;

        const displayPrice = lowestProducerPrice !== null ? lowestProducerPrice : referencePrice;
        const priceSource: 'producer' | 'reference' = lowestProducerPrice !== null ? 'producer' : 'reference';

        return {
          variantId: variant.id,
          displayPrice,
          priceSource,
          lowestProducerPrice: lowestProducerPrice || undefined,
          referencePrice
        };
      });

      return {
        productId: product.id,
        variants
      };
    });
  }
}