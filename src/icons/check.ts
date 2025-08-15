// Liste des props acceptés par cette image
interface Props {
    primaryColor?: string;
}

// Couleur par défaut pour chaque props
const defaultColors = {
    primaryColor: '#F48953',
};

export default (props?: Props): string => {
    const colors = { ...defaultColors, ...props };

    return `
    <svg viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 9.09091L7.625 15L20 2" stroke="${colors.primaryColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
};
