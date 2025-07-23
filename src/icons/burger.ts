// Liste des props acceptés par cette image
interface Props {}

// Couleur par défaut pour chaque props
const defaultColors = {};

export default (props?: Props): string => {
    return `
    <svg width="31" height="26" viewBox="0 0 31 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="1" y1="1" x2="30" y2="1" stroke="#073E3D" stroke-width="2" stroke-miterlimit="3.86874" stroke-linecap="round"/>
      <line x1="1" y1="13" x2="30" y2="13" stroke="#073E3D" stroke-width="2" stroke-miterlimit="3.86874" stroke-linecap="round"/>
      <line x1="1" y1="25" x2="30" y2="25" stroke="#073E3D" stroke-width="2" stroke-miterlimit="3.86874" stroke-linecap="round"/>
    </svg>
  `;
};
