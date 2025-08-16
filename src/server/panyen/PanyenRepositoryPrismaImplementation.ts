import { PrismaClient, PanyenProduct, PanyenComponent, Product, ProductVariant, Unit } from '@prisma/client';
import { IPanyenRepository } from './PanyenRepository';
import { IPanyenProduct, IPanyenCreateInput, IPanyenUpdateInput } from './IPanyen';
import { VatRate } from '../product/IProduct';

// Types pour les données avec relations
type PanyenProductWithRelations = PanyenProduct & {
  components: (PanyenComponent & {
    product: Product & {
      variants: ProductVariant[];
      baseUnit: Unit | null;
    };
    productVariant: ProductVariant;
  })[];
};

type PanyenComponentWithRelations = PanyenComponent & {
  product: Product & {
    variants: ProductVariant[];
    baseUnit: Unit | null;
  };
  productVariant: ProductVariant;
};

type ProductVariantFromRelation = ProductVariant;

export class PanyenRepositoryPrismaImplementation implements IPanyenRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<IPanyenProduct[]> {
    const panyenProducts = await this.prisma.panyenProduct.findMany({
      include: {
        components: {
          include: {
            product: {
              include: {
                variants: true,
                baseUnit: true
              }
            },
            productVariant: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return panyenProducts.map(this.mapToIPanyenProduct);
  }

  async findById(id: string): Promise<IPanyenProduct | null> {
    const panyenProduct = await this.prisma.panyenProduct.findUnique({
      where: { id },
      include: {
        components: {
          include: {
            product: {
              include: {
                variants: true,
                baseUnit: true
              }
            },
            productVariant: true
          }
        }
      }
    });

    return panyenProduct ? this.mapToIPanyenProduct(panyenProduct) : null;
  }

  async create(data: IPanyenCreateInput): Promise<IPanyenProduct> {
    const panyenProduct = await this.prisma.panyenProduct.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        price: data.price,
        showInStore: data.showInStore ?? true,
        components: {
          create: data.components.map(component => ({
            productId: component.productId,
            productVariantId: component.productVariantId,
            quantity: component.quantity
          }))
        }
      },
      include: {
        components: {
          include: {
            product: {
              include: {
                variants: true,
                baseUnit: true
              }
            },
            productVariant: true
          }
        }
      }
    });

    return this.mapToIPanyenProduct(panyenProduct);
  }

  async update(id: string, data: IPanyenUpdateInput): Promise<IPanyenProduct> {
    // Si on met à jour les composants, on supprime les anciens et on crée les nouveaux
    if (data.components) {
      await this.prisma.panyenComponent.deleteMany({
        where: { panyenProductId: id }
      });
    }

    const panyenProduct = await this.prisma.panyenProduct.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl && { imageUrl: data.imageUrl }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.showInStore !== undefined && { showInStore: data.showInStore }),
        ...(data.components && {
          components: {
            create: data.components.map(component => ({
              productId: component.productId,
              productVariantId: component.productVariantId,
              quantity: component.quantity
            }))
          }
        })
      },
      include: {
        components: {
          include: {
            product: {
              include: {
                variants: true,
                baseUnit: true
              }
            },
            productVariant: true
          }
        }
      }
    });

    return this.mapToIPanyenProduct(panyenProduct);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.panyenProduct.delete({
      where: { id }
    });
  }

  async calculateStock(id: string): Promise<number> {
    const panyenProduct = await this.prisma.panyenProduct.findUnique({
      where: { id },
      include: {
        components: {
          include: {
            productVariant: true
          }
        }
      }
    });

    if (!panyenProduct || panyenProduct.components.length === 0) {
      return 0;
    }

    // Le stock du panyen est limité par le composant qui a le moins de stock
    // par rapport à la quantité requise
    return Math.min(
      ...panyenProduct.components.map(component => 
        Math.floor(component.productVariant.stock / component.quantity)
      )
    );
  }

  private mapToIPanyenProduct(panyenProduct: PanyenProductWithRelations): IPanyenProduct {
    return {
      id: panyenProduct.id,
      name: panyenProduct.name,
      description: panyenProduct.description ?? undefined,
      imageUrl: panyenProduct.imageUrl,
      price: panyenProduct.price,
      showInStore: panyenProduct.showInStore,
      createdAt: panyenProduct.createdAt,
      updatedAt: panyenProduct.updatedAt,
      components: panyenProduct.components.map((component: PanyenComponentWithRelations) => ({
        id: component.id,
        panyenProductId: component.panyenProductId,
        productId: component.productId,
        productVariantId: component.productVariantId,
        quantity: component.quantity,
        createdAt: component.createdAt,
        updatedAt: component.updatedAt,
        product: {
          id: component.product.id,
          name: component.product.name,
          description: component.product.description,
          imageUrl: component.product.imageUrl,
          showInStore: component.product.showInStore,
          category: component.product.category,
          globalStock: component.product.globalStock || 0,
          baseQuantity: component.product.baseQuantity || 0,
          baseUnitId: component.product.baseUnitId,
          baseUnit: component.product.baseUnit ? {
            id: component.product.baseUnit.id,
            name: component.product.baseUnit.name,
            symbol: component.product.baseUnit.symbol,
            category: component.product.baseUnit.category,
            baseUnit: component.product.baseUnit.baseUnit,
            conversionFactor: component.product.baseUnit.conversionFactor,
            isActive: component.product.baseUnit.isActive
          } : null,
          variants: component.product.variants.map((variant: ProductVariantFromRelation) => ({
            id: variant.id,
            optionSet: variant.optionSet,
            optionValue: variant.optionValue,
            productId: component.productId,
            description: variant.description,
            imageUrl: variant.imageUrl,
            price: variant.price,
            stock: variant.stock,
            vatRate: variant.vatRate as VatRate | null | undefined,
            unitId: variant.unitId,
            quantity: variant.quantity,
            createdAt: variant.createdAt,
            updatedAt: variant.updatedAt,
            showDescriptionOnPrintDelivery: variant.showDescriptionOnPrintDelivery ?? undefined
          }))
        },
        productVariant: {
          id: component.productVariant.id,
          optionSet: component.productVariant.optionSet,
          optionValue: component.productVariant.optionValue,
          productId: component.productId,
          description: component.productVariant.description,
          imageUrl: component.productVariant.imageUrl,
          price: component.productVariant.price,
          stock: component.productVariant.stock,
          vatRate: component.productVariant.vatRate as VatRate | null | undefined,
          unitId: component.productVariant.unitId,
          quantity: component.productVariant.quantity,
          showDescriptionOnPrintDelivery: component.productVariant.showDescriptionOnPrintDelivery ?? undefined
        }
      }))
    };
  }
}