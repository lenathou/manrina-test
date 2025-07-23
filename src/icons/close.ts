// Liste des props acceptés par cette image
interface Props {
    primary?: string;
}

const defaultColors = {
    primary: '#F48953',
};

export default (props?: Props): string => {
    const colors = { ...defaultColors, ...props };

    return `
  <svg viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="2.41421" y1="1" x2="25" y2="23.5858" stroke="${colors.primary}" stroke-width="2" stroke-linecap="round"/>
    <line x1="1" y1="-1" x2="32.9411" y2="-1" transform="matrix(-0.707107 0.707107 0.707107 0.707107 25 1)" stroke="${colors.primary}" stroke-width="2" stroke-linecap="round"/>
  </svg>

  


  `;
};
