// Liste des props acceptés par cette image
interface Props {
    primary?: string;
}

// Couleur par défaut pour chaque props
const defaultColors = {
    primary: '#073E3D',
};

export default (props?: Props): string => {
    const colors = { ...defaultColors, ...props };

    return `
    <svg viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14.777" cy="8.213" transform="rotate(45 14.777 8.213)" stroke="${colors.primary}" stroke-width="2" stroke-linecap="round" r="5.808"/>
      <path stroke="${colors.primary}" stroke-width="2" stroke-linecap="round" d="M11.126 13.255l-3.628 3.628"/>
    </svg>
  `;
};
