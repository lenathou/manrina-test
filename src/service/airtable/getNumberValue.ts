export const getNumberValue = (value: unknown) => {
    return value && typeof value === 'string' && !isNaN(Number(value)) ? Number(value) : value;
};
