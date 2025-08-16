import { useState } from 'react';
import { ContactInfo } from '../payments/ContactInfo';
import { PostalCodeItem } from '../payments/PostalCodeSelector';
import { DeliveryMethod } from '../types/DeliveryMethodsType';

export type CheckoutStorage = {
    contact?: ContactInfo;
    category?: string;
    deliveryMethod?: DeliveryMethod;
    postalCode?: PostalCodeItem;
    dayChosen?: string;
    // items?: BasketStorage;
};

const CHECKOUT_STORAGE_KEY = '__checkout__';

export const useCheckoutStorage = () => {
    const [_checkoutStorage, updateCheckoutStorage] = useState<CheckoutStorage>({});
    // const [_checkoutStorage, updateCheckoutStorage] =
    //     useLocalStorage<CheckoutStorage>(CHECKOUT_STORAGE_KEY, {});
    //TODO: clean
    // const updateCheckoutStorage = (data: any) => {
    //     console.log("updated", data({}));
    //     _updateCheckoutStorage(data);
    // };
    const checkoutStorage = _checkoutStorage || {};

    const setContact = (contact: ContactInfo) => {
        updateCheckoutStorage((checkoutStorage) => ({
            ...checkoutStorage,
            contact,
        }));
    };

    const setCategory = (category: string) => {
        updateCheckoutStorage((checkoutStorage) => {
            return {
                ...checkoutStorage,
                category,
            };
        });
    };

    const setDeliveryMethod = (deliveryMethod: DeliveryMethod, dayChosen: string) => {
        updateCheckoutStorage((checkoutStorage) => {
            return {
                ...checkoutStorage,
                deliveryMethod,
                dayChosen,
            };
        });
    };

    const setPostalCode = (postalCode: PostalCodeItem) => {
        updateCheckoutStorage((checkoutStorage) => ({
            ...checkoutStorage,
            postalCode,
        }));
    };

    const setDayChosen = (dayChosen: string) => {
        updateCheckoutStorage((checkoutStorage) => ({
            ...checkoutStorage,
            dayChosen,
        }));
    };

    return {
        checkoutStorage,
        setContact,
        setCategory,
        setDeliveryMethod,
        setPostalCode,
        setDayChosen,
    };
};
