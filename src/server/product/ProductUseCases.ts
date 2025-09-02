import deliveryMethods from '@/mock/deliveryMethods.json';
import products from '@/mock/products.json';
import { AirtableService, AirtableSumupProduct } from '@/service/airtable';
import { FileSystemService } from '@/service/FileSystemService';
import { DeliveryMethodsData } from '@/types/DeliveryMethodsType';
import { Basket } from '@/server/checkout/IBasket';
import { IProduct, IProductUpdateFields, IProductVariant } from '@/server/product/IProduct';
import { IProductHistoryRepository } from '@/server/product/ProductHistoryRepository';
import { ProductRepository } from '@/server/product/ProductRepository';
import { ProductEntity } from '@/server/product/ProductEntity';
import { IPanyenRepository } from '@/server/panyen/PanyenRepository';

export type BasketValidationResult = {
    isValid: boolean;
    unavailableItems: {
        productId: string;
        variantId: string;
        name: string;
        requestedQuantity: number;
        availableStock: number;
        reason: 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'PRODUCT_NOT_FOUND';
    }[];
};

export class ProductUseCases {
    constructor(
        private productRepository: ProductRepository,
        private productHistoryRepository: IProductHistoryRepository,
        private airtableService: AirtableService,
        private fileSystemService: FileSystemService,
        private panyenRepository: IPanyenRepository,
    ) {}

    public createProductFromTesting = async () => {
        return await this.createProductsFromObjectArray(products as AirtableSumupProduct[]);
    };

    public createProductsFromAirtable = async () => {
        const products = await this.airtableService.getCurrentSumupProducts();
        // console.log('products', products[0]);
        // throw new Error('Not implemented');
        const productsToCreate = products.map((product) => product.fields);
        // Commenté: téléchargement des images depuis Airtable vers le dossier public
        // await this.loadImagesFromAirtableToPublicFolder(productsToCreate);
        return await this.createProductsFromObjectArray(productsToCreate);
    };

    // Fonction commentée: téléchargement des images depuis Airtable vers le dossier public
    // Maintenant on utilise directement les URLs S3 depuis products.json
    // private loadImagesFromAirtableToPublicFolder = async (products: AirtableSumupProduct[] = []) => {
    //     const imagesFolder = path.join(process.cwd(), 'public', 'images');
    //     // ensure folder exists
    //     await executeInBatches(products, 20, async (product) => {
    //         const image = product.productImage?.[0]?.url;
    //         if (!image) {
    //             return;
    //         }
    //         const productId = product['Item id (Do not change)'];
    //         console.log('running image download for', product['Item name']);
    //         //if contains image already locally, skip
    //         if (this.fileSystemService.doesFileExist(path.join(imagesFolder, `${productId}.png`))) {
    //             return;
    //         }
    //         const imagePath = path.join(imagesFolder, `${productId}.png`);
    //         const imageBuffer = await fetch(image).then((res) => res.arrayBuffer());
    //         await this.fileSystemService.writeFile(imagePath, Buffer.from(imageBuffer));
    //     });
    // };

    private createProductsFromObjectArray = async (productsToCreate: AirtableSumupProduct[] = []) => {
        const productsGroupedByItemName = productsToCreate.reduce(
            (acc, product) => {
                const productId = product['Item id (Do not change)'];
                const productName = product['Item name'];
                // Utiliser directement l'URL S3 depuis products.json
                const imageUrl = product['Image 1'] || '';
                if (!acc[productName]) {
                    acc[productName] = {
                        id: productId,
                        category: product.Category,
                        name: product['Item name'],
                        imageUrl: imageUrl,
                        showInStore: product['Display item in Online Store? (Yes/No)'] === 'Yes',
                        description: product['Description (Online Store and Invoices only)'] || '',
                        variants: [],
                        globalStock: 0,
                        baseQuantity: 1,
                    };
                }
                if (product['Variant id (Do not change)']) {
                    acc[productName].variants.push({
                        id: product['Variant id (Do not change)'],
                        optionSet: product['Option set 1'] || '',
                        optionValue: product['Option 1'] || product['Variations'] || '',
                        productId: productId,
                        description: product['Description (Online Store and Invoices only)'] || '',
                        imageUrl: imageUrl,
                        price: +product.Price,
                        stock: Math.floor(+product.Quantity),
                    });
                }
                return acc;
            },
            {} as Record<string, IProduct>,
        );
        const products: IProduct[] = Object.values(productsGroupedByItemName);
        return await this.createProducts(products);
    };

    private createProducts = async (products: IProduct[]) => {
        const createdProducts = await this.productRepository.createProducts(products);

        // Log the product creation in history
        await this.productHistoryRepository.logProductUpdate('BULK_CREATE', {
            dataString: JSON.stringify(products),
        });

        return createdProducts;
    };

    public getAllProductsWithStock = () => {
        return this.productRepository.getAllProductsWithStock();
    };


    public getAllProducts = this.productRepository.getAllProducts;

    public getAllUnits = async () => {
        return await this.productRepository.getAllUnits();
    };

    public getDeliveryMethods = () => {
        return deliveryMethods as DeliveryMethodsData;
    };

    public updateVariant = async (variantId: string, updates: Partial<IProductVariant>) => {
        return this.productRepository.updateVariant(variantId, updates);
    };

    public createVariant = async (productId: string, variantData: Omit<IProductVariant, 'id'>) => {
        return this.productRepository.createVariant(productId, variantData);
    };

    public deleteVariant = async (variantId: string, productId: string) => {
        // Vérifier que le produit a plus d'un variant avant de supprimer
        const product = await this.productRepository.getAllProducts().then(products => 
            products.find(p => p.id === productId)
        );
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        if (product.variants.length <= 1) {
            throw new Error('Cannot delete variant: product must have at least one variant');
        }
        
        const result = await this.productRepository.deleteVariant(variantId);
        return result;
    };

    public updateProduct = async (productId: string, updates: IProductUpdateFields) => {
        return this.productRepository.updateProduct(productId, updates);
    };

    public createProduct = async (productData: IProduct) => {
        const createdProduct = await this.productRepository.createProduct(new ProductEntity(productData));
        
        // Log the product creation in history
        await this.productHistoryRepository.logProductUpdate('CREATE', {
            dataString: JSON.stringify(productData),
        });
        
        return createdProduct;
    };

    public deleteProduct = async (productId: string) => {
        await this.productHistoryRepository.logProductUpdate('DELETE', {
            productId,
        });
        return await this.productRepository.deleteProduct(productId);
    };

    public addVatRateToBasket = async (basket: Basket, defaultTaxId: string) => {
        // Get all products to find their VAT rates
        const products = await this.getAllProducts();

        // Create a new basket with updated items
        const updatedItems = basket.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            const variant = product?.variants.find((v) => v.id === item.productVariantId);

            return {
                ...item,
                vatRateId: variant?.vatRate?.taxId || defaultTaxId,
            };
        });

        return new Basket({
            ...basket,
            items: updatedItems,
        });
    };

    public validateBasketItems = async (
        items: { productId: string; variantId: string; quantity: number }[],
    ): Promise<BasketValidationResult> => {
        const products = await this.productRepository.getAllProducts();
        const panyenProducts = await this.panyenRepository.findAll();
        const unavailableItems: BasketValidationResult['unavailableItems'] = [];

        for (const item of items) {
            // Vérifier si c'est un panier (ID préfixé par "panyen_")
            if (item.productId.startsWith('panyen_')) {
                const panyenId = item.productId.replace('panyen_', '');
                const panyen = panyenProducts.find((p) => p.id === panyenId);
                
                if (!panyen) {
                    unavailableItems.push({
                        productId: item.productId,
                        variantId: item.variantId,
                        name: 'Panier introuvable',
                        requestedQuantity: item.quantity,
                        availableStock: 0,
                        reason: 'PRODUCT_NOT_FOUND',
                    });
                    continue;
                }

                // Vérifier si le panier est visible dans le magasin
                if (!panyen.showInStore) {
                    unavailableItems.push({
                        productId: item.productId,
                        variantId: item.variantId,
                        name: panyen.name,
                        requestedQuantity: item.quantity,
                        availableStock: 0,
                        reason: 'PRODUCT_NOT_FOUND',
                    });
                    continue;
                }

                // Les paniers ont un stock illimité, donc ils sont toujours disponibles
                continue;
            }

            // Logique existante pour les produits réguliers
            const product = products.find((p) => p.id === item.productId);
            if (!product) {
                unavailableItems.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    name: 'Unknown Product',
                    requestedQuantity: item.quantity,
                    availableStock: 0,
                    reason: 'PRODUCT_NOT_FOUND',
                });
                continue;
            }

            const variant = product.variants.find((v) => v.id === item.variantId);
            if (!variant) {
                unavailableItems.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    name: product.name,
                    requestedQuantity: item.quantity,
                    availableStock: 0,
                    reason: 'PRODUCT_NOT_FOUND',
                });
                continue;
            }

            if (variant.stock <= 0) {
                unavailableItems.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    name: `${product.name} ${variant.optionSet} ${variant.optionValue}`.trim(),
                    requestedQuantity: item.quantity,
                    availableStock: 0,
                    reason: 'OUT_OF_STOCK',
                });
            } else if (variant.stock < item.quantity) {
                unavailableItems.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    name: `${product.name} ${variant.optionSet} ${variant.optionValue}`.trim(),
                    requestedQuantity: item.quantity,
                    availableStock: variant.stock,
                    reason: 'INSUFFICIENT_STOCK',
                });
            }
        }

        return {
            isValid: unavailableItems.length === 0,
            unavailableItems,
        };
    };
}
