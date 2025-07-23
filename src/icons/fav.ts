// Liste des props acceptés par cette image
interface Props {
    primary?: string;
    secondary?: string;
    strokeWidth?: string;
}

// Couleur par défaut pour chaque props
const defaultColors = {
    primary: '#F48953',
    secondary: '#073E3D',
    strokeWidth: '1.5',
};

export default (props?: Props): string => {
    const colors = { ...defaultColors, ...props };

    return `
    <svg viewBox="0 0 36 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34.96 13.07c-.39 1.693-1.172 3.32-2.475 4.689l-1.368 1.433L20.11 30.786a2.758 2.758 0 01-4.039 0L3.696 17.759c-1.303-1.303-2.085-2.931-2.475-4.69.39-1.693 1.172-3.322 2.475-4.69 1.823-1.889 4.168-2.8 6.513-2.8 2.345 0 4.69.977 6.514 2.8l1.367 1.433 1.368-1.433c3.583-3.777 9.445-3.777 13.027 0 1.303 1.368 2.084 2.997 2.475 4.69z" fill="${colors.primary}"/>
      <path d="M34.96 13.07c-.39 1.693-1.172 3.32-2.475 4.689l-1.368 1.433L20.11 30.786a2.758 2.758 0 01-4.039 0L3.696 17.759c-1.303-1.303-2.085-2.931-2.475-4.69-.652-3.126.13-6.513 2.475-8.989 1.823-1.888 4.168-2.8 6.513-2.8 2.345 0 4.69.912 6.514 2.8l1.367 1.433 1.368-1.433c3.583-3.777 9.445-3.777 13.027 0 2.345 2.476 3.127 5.863 2.475 8.99z" stroke="${colors.secondary}" stroke-width="${colors.strokeWidth}" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
};
