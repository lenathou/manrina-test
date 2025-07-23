import { useState } from 'react';
import { View } from 'react-native';
import { Form, FormField } from '../components/Form/Form';
import { SelectDeliveryDate } from './DeliveryMethodItem';
import { DeliveryDayWithTime } from './PostalCodeSelector';

export const AdressForm = ({
    onSubmit,
    deliveryDays,
}: {
    onSubmit: (
        data: {
            address: string;
            adressComplement: string;
            city: string;
            postalCode: string;
            deliveryTime: string;
            comment: string;
        },
        dayChosen: string,
    ) => void;
    deliveryDays: DeliveryDayWithTime[];
}) => {
    const [deliveryDate, setDeliveryDate] = useState<string>('');

    return (
        <>
            <SelectDeliveryDate
                selectedDay={deliveryDate}
                deliveryDays={deliveryDays}
                onSelect={setDeliveryDate}
            />
            <View style={{ height: 16 }}></View>
            {deliveryDate ? (
                <Form<{
                    address: string;
                    adressComplement: string;
                    city: string;
                    postalCode: string;
                    deliveryTime: string;
                    comment: string;
                }>
                    formFields={adressFormFields}
                    submitLabel="Valider adresse"
                    onSubmit={(data) => {
                        onSubmit(data, deliveryDate);
                    }}
                />
            ) : null}
        </>
    );
};

const adressFormFields: FormField[] = [
    { type: 'text', placeholder: 'Adresse', name: 'address', required: true },
    {
        type: 'text',
        placeholder: 'Appartement, suite, etc.',
        name: 'adressComplement',
    },
    { type: 'text', placeholder: 'Ville', name: 'city', required: true },
    { type: 'text', placeholder: 'Code postal', name: 'postalCode', required: true },
];
