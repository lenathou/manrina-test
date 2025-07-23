import { DeliveryMethod } from '../types/DeliveryMethodsType';
import { ContactInfo } from './ContactInfo';

export type DeliveryManagerSubmit = (data: {
    contact: ContactInfo;
    deliveryMethod: DeliveryMethod;
    selectedCategory: string;
    dayChosen: string;
}) => void;
