// Liste des props acceptés par cette image
interface Props {
    primary?: string;
}

// Couleur par défaut pour chaque props
const defaultColors = {
    primary: '#A0A6A7',
};

export default (props?: Props): string => {
    const colors = { ...defaultColors, ...props };

    return `
    <svg viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.75" y="0.75" width="16.5" height="14.5" rx="1.25" stroke="${colors.primary}" stroke-width="1.5"/>
      <line x1="0.857178" y1="4.25" x2="18" y2="4.25" stroke="${colors.primary}" stroke-width="1.5"/>
      <line x1="3.42859" y1="8.25" x2="5.14287" y2="8.25" stroke="${colors.primary}" stroke-width="1.5"/>
      <line x1="7.71423" y1="8.25" x2="9.42852" y2="8.25" stroke="${colors.primary}" stroke-width="1.5"/>
      <line x1="7.71423" y1="12.25" x2="9.42852" y2="12.25" stroke="${colors.primary}" stroke-width="1.5"/>
      <line x1="3.42859" y1="12.25" x2="5.14287" y2="12.25" stroke="${colors.primary}" stroke-width="1.5"/>
      <line x1="12" y1="12.25" x2="13.7143" y2="12.25" stroke="${colors.primary}" stroke-width="1.5"/>
      <line x1="12" y1="8.25" x2="13.7143" y2="8.25" stroke="${colors.primary}" stroke-width="1.5"/>
    </svg>
  `;
};
