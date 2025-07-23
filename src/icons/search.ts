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
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9.77651" cy="6.2134" r="4.80776" stroke="#073E3D" stroke-width="2" stroke-linecap="round"/>
      <path d="M6.29395 9.69385L1.82133 14.1665" stroke="#073E3D" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
};
