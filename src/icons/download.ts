// Liste des props acceptés par cette image
interface Props {
    color?: string;
}

// Couleur par défaut pour chaque props
const defaultColors = {
    color: '#F48953',
};

export default (props?: Props): string => {
    const colors = { ...defaultColors, ...props };

    return `
  <svg viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 1V12.5M1 13V16.5H14V13" stroke="${colors.color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4.5 9L8 12.5L11.5 9" stroke="${colors.color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  
  `;
};
