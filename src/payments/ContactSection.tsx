import { Form, FormField } from '../components/Form/Form';
import { ContactInfo } from './ContactInfo';

export const ContactForm = ({ onSubmit }: { onSubmit: (data: ContactInfo) => void }) => {
    return (
        <Form<ContactInfo>
            formFields={contactFormFields}
            submitLabel="Continuer"
            onSubmit={onSubmit}
        />
    );
};

const contactFormFields: FormField[] = [
    { type: 'text', placeholder: 'Nom complet', name: 'name', required: true },
    {
        type: 'text',
        placeholder: 'E-mail',
        name: 'email',
        inputType: 'email-address',
        inputMode: 'email',
        required: true,
    },
    {
        type: 'text',
        placeholder: 'Numéro de téléphone',
        name: 'phone',
        required: true,
    },
];
