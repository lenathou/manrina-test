// Liste des props acceptés par cette image
interface Props {
    primaryColor?: string;
}

// Couleur par défaut pour chaque props
const defaultColors = {
    primary: '#FFFFFF',
};

export default (props?: Props): string => {
    const colors = { ...defaultColors, ...props };

    return `
    <svg viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M8 16.3781C12.4183 16.3781 16 12.7964 16 8.37814C16 3.95986 12.4183 0.378136 8 0.378136C3.58172 0.378136 0 3.95986 0 8.37814C0 12.7964 3.58172 16.3781 8 16.3781ZM3.29289 7.08524L7.29289 11.0852L8 11.7923L8.70711 11.0852L12.7071 7.08524L11.2929 5.67103L8 8.96392L4.70711 5.67103L3.29289 7.08524Z" fill="${colors.primary}"/>
    </svg>
  `;
};
