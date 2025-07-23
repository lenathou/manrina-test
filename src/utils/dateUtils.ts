export const convertUTCToLocaleString = (date: string | Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
