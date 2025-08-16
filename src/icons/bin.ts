// Liste des props acceptés par cette image
interface Props {
    primaryColor?: string;
}

// Couleur par défaut pour chaque props
const defaultColors = {
    primaryColor: '#fff',
};

export default (props?: Props): string => {
    const colors = { ...defaultColors, ...props };

    return `
    <svg viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.335 24.833H4.583L3.097 6.712H18.82l-1.486 18.121zM6.605 10.248l.825 10.688M10.98 10.248v10.688M15.354 10.248l-.825 10.688M7 6s.857-3 4.171-3C14.486 3 15 6 15 6" stroke="${colors.primaryColor}" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path stroke="${colors.primaryColor}" stroke-width="1.5" stroke-linecap="round" d="M.75 6.25h20.5"/>
    </svg>
  `;
};
