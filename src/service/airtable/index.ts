import type { CSVStockObject } from 'Sumup';
import type { FieldSet, RecordData } from 'airtable';
import Airtable from 'airtable';
import { withKvCache } from '../../utils/withKvCache';
import { getNumberValue } from './getNumberValue';
import type { ManrinaActualisationElement, ManrinaProduct } from './types';

type ObjectWithImageField = CSVStockObject & { productImage: string };

export type AirtableSumupProduct = CSVStockObject & { productImage: { url: string }[] };

type AirTableRowWithCSVData = {
    createdTime: string;
    fields: AirtableSumupProduct;
    id: string;
};

export class AirtableService {
    base: Airtable.Base;
    constructor(apiKey: string = process.env.AIRTABLE_TOKEN as string) {
        this.base = new Airtable({ apiKey }).base('appDTAbisP2ns95zj');
    }

    getAllProductsGroupedByName = async () => {
        const products = await this.getAllProducts();
        const productByName = products.reduce(
            (acc, product) => {
                const productName = product.fields.Name;
                if (acc[productName]) {
                    acc[productName].push(product);
                    return acc;
                }
                acc[productName] = [product];
                return acc;
            },
            {} as Record<string, ManrinaProduct[]>,
        );
        return productByName;
    };

    private getAllElementsFromView = async <ElementType>({ base, view }: { base: string; view: string }) => {
        const elements: ElementType[] = [];
        return new Promise<ElementType[]>((resolve, reject) => {
            this.base(base)
                .select({ view })
                .eachPage(
                    function page(records, fetchNextPage) {
                        // This function (`page`) will get called for each page of records.
                        elements.push(
                            ...records.map((record) => {
                                return record._rawJson;
                            }),
                        );
                        fetchNextPage();
                    },
                    function done(err) {
                        if (err) {
                            console.log('Error happened with', { base, view });
                            console.error(err);
                            reject(new Error(JSON.stringify({ base, view, err })));
                            return;
                        }
                        resolve(elements);
                    },
                );
        });
    };

    getAllProducts = async () => {
        return this.getAllElementsFromView<ManrinaProduct>({ base: 'Produits', view: 'Tous' });
    };

    private SUMUP_PRODUCTS_TABLE_ID = 'tbluwWUSmMH6KY9fS';
    private RAW_VIEW_ID = 'viwFRSb2SNwRd2poO';
    getCurrentSumupProducts = async () => {
        return this.getAllElementsFromView<AirTableRowWithCSVData>({
            base: this.SUMUP_PRODUCTS_TABLE_ID,
            view: this.RAW_VIEW_ID,
        });
    };

    /**
     * Cached version of getCurrentSumupProducts that stores results locally
     * Cache expires after 1 hour by default, but can be customized
     */
    getCurrentSumupProductsCached = withKvCache(this.getCurrentSumupProducts.bind(this), {
        ttl: 3600, // 1 hour cache in seconds
        key: 'sumup_products'
    });

    addSumupProducts = async (products: CSVStockObject[]) => {
        console.log('products before', products);
        // add records by batch of 10
        const recordsBatches = [];
        const batchSize = 10;
        for (let i = 0; i < products.length; i += batchSize) {
            recordsBatches.push(
                products.slice(i, i + batchSize).map((product) => {
                    return {
                        fields: convertSpecificValuesToNumber({ ...product }, [
                            'Price',
                            'Quantity',
                            'Low stock threshold',
                            'Tax rate (%)',
                            'Regular price (before sale)',
                        ]) as Record<string, string>,
                    };
                }),
            );
        }
        for (const records of recordsBatches) {
            try {
                await this.base(this.SUMUP_PRODUCTS_TABLE_ID).create(records);
            } catch (e) {
                console.error(e, records);
                throw e;
            }
        }
    };

    VARIANT_ID_FIELD = 'Variant id (Do not change)' as const;

    getSumUpProductsWithVariantId = async () => {
        const allSumupProducts = await this.getCurrentSumupProducts();
        return allSumupProducts.filter((product) => {
            return product.fields[this.VARIANT_ID_FIELD];
        });
    };

    resetValues = async () => {
        const sumupProductsToReset = await this.getSumUpProductsWithVariantId();
        const sumupProductsWithQuantityZero = sumupProductsToReset.map((product) => {
            return {
                id: product.id,
                fields: {
                    Quantity: +product.fields['Valeur par défaut'] || 0,
                },
            };
        });

        const batchSize = 10;
        for (let i = 0; i < sumupProductsWithQuantityZero.length; i += batchSize) {
            await this.base(this.SUMUP_PRODUCTS_TABLE_ID).update(sumupProductsWithQuantityZero.slice(i, i + batchSize));
        }
    };

    generateActualisationValues = async (baseName: string) => {
        const ACTUALISATION_VIEW_NAME = 'Général Actualisation';
        const productsFromActualisation = await this.getAllElementsFromView<ManrinaActualisationElement>({
            base: baseName,
            view: ACTUALISATION_VIEW_NAME,
        });
        const products = await this.getAllProducts();
        const productsById = Object.fromEntries(products.map((product) => [product.id, product]));
        const sumUpProductsWithVariantId = await this.getSumUpProductsWithVariantId();
        const sumupProductsById = Object.fromEntries(
            sumUpProductsWithVariantId.map((product) => [product.id, product]),
        );
        const productsFromActualisationWithId = productsFromActualisation.map((actualisationProduct) => {
            const productId = actualisationProduct.fields['Produit Lien'][0];
            const produitLien = productId ? productsById[productId] : null;
            const sumupProductId = produitLien ? produitLien.fields['Produit SUMUP']?.[0] : null;
            const sumupProduct = sumupProductId ? sumupProductsById[sumupProductId] : null;
            return {
                actualisationProduct,
                airtableProduct: produitLien,
                sumupProduct,
            };
        });
        const productsWithSumupProduct = productsFromActualisationWithId.filter(
            (productData) => !!productData.sumupProduct,
        );
        // const produtsNotInKgs = productsWithSumupProduct.filter(
        //   productData => productData.actualisationProduct?.fields.Unité !== 'kg',
        // );
        const productsInKgs = productsWithSumupProduct.filter(
            (productData) => productData.actualisationProduct?.fields.Unité === 'kg',
        );
        const productsInKgsNames = productsInKgs.map((productData) => productData.actualisationProduct?.fields.Produit);
        const productsWithSumupProductGroupedBySumupProduct = productsWithSumupProduct.reduce(
            (acc, productData) => {
                const sumupProduct = productData.sumupProduct!;
                if (acc[sumupProduct.id]) {
                    acc[sumupProduct.id].push(productData);
                    return acc;
                }
                acc[sumupProduct.id] = [productData];
                return acc;
            },
            {} as Record<string, typeof productsWithSumupProduct>,
        );
        const productsSumupWithNameAndQuantity = Object.entries(productsWithSumupProductGroupedBySumupProduct).map(
            ([sumupProductId, products]) => {
                const sumupProduct = products[0].sumupProduct!;
                const sumupProductName = sumupProduct.fields['Item name'];
                const areAllProductSameUnit = products.every(
                    (productData) =>
                        productData.actualisationProduct?.fields.Unité ===
                        products[0].actualisationProduct?.fields.Unité,
                );
                const sumupProductQuantity = products.reduce((acc, productData) => {
                    return acc + productData.actualisationProduct!.fields['Quantité disponible'];
                }, 0);
                const highestQuantityAndPriceInitial = products.reduce(
                    (acc, productData) => {
                        const actualisationProduct = productData.actualisationProduct!;
                        const quantity = actualisationProduct.fields['Quantité disponible'];
                        const price = actualisationProduct.fields['Prix vente COM 30%'];
                        if (quantity > acc.quantity) {
                            return {
                                quantity,
                                price,
                            };
                        }
                        if (quantity === acc.quantity && price < acc.price) {
                            return {
                                quantity,
                                price,
                            };
                        }
                        return acc;
                    },
                    { quantity: 0, price: 0 },
                );
                const lowestPrice = Math.min(
                    ...products.map((productData) => productData.actualisationProduct!.fields['Prix vente COM 30%']),
                );
                const isHighestQuantityTheLowestPrice = highestQuantityAndPriceInitial.price === lowestPrice;
                const isQuantityKg = products[0].actualisationProduct?.fields.Unité === 'kg';
                let highestQuantityAndPriceToUse = highestQuantityAndPriceInitial;
                if (isQuantityKg && areAllProductSameUnit) {
                    const productQuantity = calculateProductQuantity(sumupProduct);
                    let realQuantityToUse = 0;
                    let pricePerProduct = highestQuantityAndPriceInitial.price;
                    if (productQuantity !== 0) {
                        realQuantityToUse = highestQuantityAndPriceInitial.quantity / productQuantity;
                        pricePerProduct = highestQuantityAndPriceInitial.price * productQuantity;
                    }
                    highestQuantityAndPriceToUse = {
                        quantity: realQuantityToUse,
                        price: pricePerProduct,
                        //@ts-expect-error // bad typing
                        amount: productQuantity,
                    };
                }

                return {
                    sumupProductId,
                    sumupProductName,
                    highestQuantityAndPriceInitial,
                    highestQuantityAndPrice: highestQuantityAndPriceToUse,
                    sumupProductQuantity,
                    elementsTotal: products.length,
                    isHighestQuantityTheLowestPrice,
                    areAllProductSameUnit,
                    isQuantityKg,
                };
            },
        );

        const productsWhereHighestQuantityIsNotTheLowestPrice = productsSumupWithNameAndQuantity.filter(
            (product) => !product.isHighestQuantityTheLowestPrice,
        );

        // update airtable with new quantity and prices
        const productsToUpdate = productsSumupWithNameAndQuantity.map((product) => {
            // we round it to the ten cents closer
            const roundedPriceToOneDecimals = Math.ceil(+product.highestQuantityAndPrice.price * 10) / 10;
            return {
                id: product.sumupProductId,
                fields: {
                    Quantity: Math.floor(product.highestQuantityAndPrice.quantity), // we round it to the lowest so we know there is stock
                    Price: roundedPriceToOneDecimals,
                },
            };
        });
        await this.updateDataByBatch(this.SUMUP_PRODUCTS_TABLE_ID, productsToUpdate);

        const productsInDifferentFormat = productsSumupWithNameAndQuantity.filter(
            (product) => !product.areAllProductSameUnit,
        );
        const productsInKg = productsSumupWithNameAndQuantity.filter((product) => product.isQuantityKg);
        return {
            productsWhereHighestQuantityIsNotTheLowestPrice,
            productsSumupWithNameAndQuantity,
            productsFromActualisationWithId,
            productsInKgsNames,
            productsInDifferentFormat,
            productsInKg,
        };
    };

    updateShowInOnlineStore = async () => {
        const sumupProducts = await this.getCurrentSumupProducts();
        const productsByItemName = sumupProducts.reduce(
            (acc, product) => {
                const itemName = product.fields['Item name'];
                if (acc[itemName]) {
                    acc[itemName].push(product);
                    return acc;
                }
                acc[itemName] = [product];
                return acc;
            },
            {} as Record<string, AirTableRowWithCSVData[]>,
        );
        // console.log('productsByItemName', productsByItemName);
        const productsToUpdate = Object.values(productsByItemName).map((products) => {
            const productsWithItemId = products.filter((product) => product.fields['Item id (Do not change)']);
            if (productsWithItemId.length !== 1) {
                throw new Error(
                    'Multiple item id found for product ' +
                        products[0].fields['Item name'] +
                        JSON.stringify({
                            ids: productsWithItemId
                                .map((product) => product.fields['Item id (Do not change)'])
                                .join('|'),
                        }),
                );
            }
            const productWithItemId = productsWithItemId[0];
            const hasValidQuantity = products.some((product) => +(product.fields.Quantity || 0) !== 0);
            const isVisibilityTheSame =
                (productWithItemId.fields['Display item in Online Store? (Yes/No)'] === 'Yes') === hasValidQuantity;
            // console.log(
            //   'isVisibilityDifferent',
            //   isVisibilityTheSame,
            //   productWithItemId.fields['Display item in Online Store? (Yes/No)'],
            //   hasValidQuantity,
            // );
            if (isVisibilityTheSame) {
                return null;
            }

            return {
                id: productWithItemId.id,
                fields: {
                    'Display item in Online Store? (Yes/No)': hasValidQuantity ? 'Yes' : 'No',
                },
            };
        });

        const validProductsToUpdate = productsToUpdate.filter((x) => !!x) as {
            id: string;
            fields: { 'Display item in Online Store? (Yes/No)': string };
        }[];
        await this.updateDataByBatch(this.SUMUP_PRODUCTS_TABLE_ID, validProductsToUpdate);
    };

    private updateDataByBatch = async (tableId: string, data: RecordData<FieldSet>[], batchSize = 10) => {
        for (let i = 0; i < data.length; i += batchSize) {
            await this.base(tableId).update(data.slice(i, i + batchSize));
        }
    };
}

const calculateProductQuantity = (product: AirTableRowWithCSVData) => {
    const variationsField = product.fields['Variations'];

    if (!variationsField) {
        return 1;
    }
    // values could be like 0,500kg or 50g or 1kg or 0.300kg
    // I want a way to convert them all to kg
    const valueWithoutComma = variationsField.replace(',', '.');
    const unit = valueWithoutComma.replace(/[^a-z]|\s/gi, '').toLowerCase();
    const weightAmount = +valueWithoutComma.replace(/[^\d.]/gi, '');

    let weightInKg = 0;
    if (unit === 'kg') {
        weightInKg = weightAmount;
    }
    if (unit === 'g') {
        weightInKg = weightAmount / 1000;
    }
    return Math.round(weightInKg * 100) / 100;
};

const convertSpecificValuesToNumber = (data: Record<string, unknown>, keysToConvert: string[] = []) => {
    return Object.fromEntries(
        Object.entries(data)
            .filter(([, value]) => value)
            .map(([key, value]) => {
                if (keysToConvert.includes(key)) {
                    return [key, getNumberValue(value)];
                }
                return [key, value];
            }),
    );
};
