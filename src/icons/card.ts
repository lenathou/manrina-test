// Liste des props acceptés par cette image
interface Props {
    primary?: string;
}

// Couleur par défaut pour chaque props
const defaultColors = {
    primary: '#F48953',
};

export default (props?: Props): string => {
    const colors = { ...defaultColors, ...props };

    return `
    <svg viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.75" y="0.75" width="19.5" height="14.5" rx="1.25" stroke="${colors.primary}" stroke-width="1.5"/>
      <line x1="1" y1="5.25" x2="21" y2="5.25" stroke="${colors.primary}" stroke-width="1.5"/>
      <line x1="10.75" y1="8.25" x2="17.25" y2="8.25" stroke="${colors.primary}" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="13.75" y1="11.25" x2="17.25" y2="11.25" stroke="${colors.primary}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;
};
