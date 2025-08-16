import { cn } from '@/lib/utils';
import { Control, useController } from 'react-hook-form';
import { InputModeOptions, KeyboardTypeOptions } from 'react-native';

export type TextFormField = {
    type: 'text' | 'password';
    placeholder: string;
    name: string;
    required?: boolean;
    inputType?: KeyboardTypeOptions;
    inputMode?: InputModeOptions;
};
export const Input = ({
    placeholder,
    name,
    control,
    required,
    type,
    onSubmitEditing,
    inputType,
    inputMode,
}: TextFormField & {
    control: Control;
    onSubmitEditing?: () => void;
}) => {
    const { field, fieldState } = useController({
        control,
        defaultValue: '',
        name,
        rules: {
            required: required ? 'Ce champ est requis' : false,
            pattern:
                inputMode === 'email'
                    ? {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Format d'email invalide",
                      }
                    : undefined,
        },
    });
    const hasError = !!fieldState.error;
    return (
        <>
            {hasError && <span className="text-red-500">{fieldState.error?.message}</span>}
            <input
                placeholder={placeholder}
                className={cn(
                    'bg-white border-[1px] border-[#ccc] rounded p-2 mb-4 w-full',
                    hasError && 'border-red-500',
                )}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                onSubmit={onSubmitEditing}
                type={type}
                inputMode={inputMode}
            />
        </>
    );
};
