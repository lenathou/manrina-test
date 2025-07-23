// Liste des props acceptés par cette image
interface Props {
    primary?: string;
}

// Couleur par défaut pour chaque props
const defaultColors = {
    primary: '#073E3D',
};

export default (props: Props): string => {
    const colors = { ...defaultColors, ...props };

    return `
    <svg id="Calque_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 32" style="enable-background:new 0 0 38 32;" xml:space="preserve">
      <style type="text/css">
        .st0{fill:none;stroke:#073E3D;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}
      </style>
      <path fill="none" stroke="${colors.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M31.4,29.5c-0.1,0.5-0.5,0.8-1,0.8H8.1c-0.4,0-0.8-0.3-1-0.8L1.8,13c-0.2-0.8,0.2-1.5,1-1.5h19.4h12.7c0.6,0,1,0.5,0.9,1.1L31.4,29.5z"/>
      <path fill="none" stroke="${colors.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M11,16.6l2.1,7.9"/>
      <path fill="none" stroke="${colors.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M28,16.5l-2.8,8.1"/>
      <path fill="none" stroke="${colors.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M19.2,24.8v-8.5"/>
      <path fill="none" stroke="${colors.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M8,11.4c0,0,2.1-9.7,11.2-9.7c8.1-0.2,9.6,6.7,10.8,9"/>
    </svg>
  `;
};
