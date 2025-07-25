import { Control, useForm } from 'react-hook-form';
import { Input, TextFormField } from './Input';
import { Button } from '@/components/ui/Button';

export type FormField = TextFormField;
const ComponentByType = {
    text: Input,
    password: Input,
};

export const Form = <DataToSubmit extends Record<string, any>>({
    formFields,
    submitLabel,
    onSubmit,
    isDisabled,
}: {
    formFields: FormField[];
    submitLabel: string;
    isDisabled?: boolean;
    onSubmit: (data: DataToSubmit) => void;
}) => {
    const { control, handleSubmit, formState } = useForm<DataToSubmit>({ mode: 'onBlur' });
    const isFormValid = formState.isDirty && formState.isValid;
    return (
        <div>
            {formFields.map((field) => {
                const Component = ComponentByType[field.type];
                if (!Component) {
                    return null;
                }
                return (
                    <Component
                        key={field.name}
                        {...field}
                        control={control as Control}
                        onSubmitEditing={handleSubmit(onSubmit)}
                    />
                );
            })}
            <Button
                className="font-secondary text-xl w-full"
                onClick={handleSubmit(onSubmit)}
                disabled={isDisabled || !isFormValid}
            >
                {submitLabel}
            </Button>
        </div>
    );
};
