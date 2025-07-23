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
    <svg viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.1084 9.49999C16.1084 13.7929 12.6635 17.2606 8.42921 17.2606C4.19488 17.2606 0.75 13.7929 0.75 9.49999C0.75 5.20709 4.19488 1.73935 8.42921 1.73935C12.6635 1.73935 16.1084 5.20709 16.1084 9.49999Z" stroke="${colors.color}" stroke-width="1.5"/>
      <path d="M8.34644 4.98935V10.9893" stroke="${colors.color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="8.34644" cy="13.6563" rx="0.981938" ry="1" fill="${colors.color}"/>
    </svg>
  `;
};
