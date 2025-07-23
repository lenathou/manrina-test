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
    <svg viewBox="0 0 23 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9259 29.9C15.2481 29.9 23 18.8259 23 10.1356C23 4.53786 18.0419 0 11.9259 0C5.80984 0 0.851807 4.53786 0.851807 10.1356C0.851807 18.8259 8.60366 29.9 11.9259 29.9ZM11.9259 15.8201C14.547 15.8201 16.6719 13.6952 16.6719 11.0741C16.6719 8.45291 14.547 6.32804 11.9259 6.32804C9.30472 6.32804 7.17985 8.45291 7.17985 11.0741C7.17985 13.6952 9.30472 15.8201 11.9259 15.8201Z" fill=${colors.primary}/>
    </svg>
  `;
};
