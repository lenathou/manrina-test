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
    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.4185 8.51064C16.4185 12.7907 12.9171 16.2713 8.58426 16.2713C4.25141 16.2713 0.75 12.7907 0.75 8.51064C0.75 4.23064 4.25141 0.75 8.58426 0.75C12.9171 0.75 16.4185 4.23064 16.4185 8.51064Z" stroke="${colors.color}" stroke-width="1.5"/>
    <line x1="5.90099" y1="5.41211" x2="11.7244" y2="11.2355" stroke="${colors.color}" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="0.75" y1="-0.75" x2="8.98554" y2="-0.75" transform="matrix(-0.707107 0.707107 0.707107 0.707107 12.0867 5.41211)" stroke="${colors.color}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;
};
