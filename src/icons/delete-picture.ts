// Liste des props acceptés par cette image
interface Props {
    primary?: string;
}

const defaultColors = {
    primary: '#A0A6A7',
    background: '#FFFFFF',
};

export default (props?: Props): string => {
    const colors = { ...defaultColors, ...props };

    return `
  <svg viewBox="11 11 21 21" fill="${colors.background}" xmlns="http://www.w3.org/2000/svg">
    <path d="M31.1853 21.3916C31.1922 26.4406 27.0671 30.5425 21.9534 30.5355C16.8397 30.5285 12.7033 26.4153 12.6964 21.3663C12.6895 16.3174 16.8146 12.2154 21.9283 12.2224C27.042 12.2294 31.1783 16.3427 31.1853 21.3916Z" stroke="${colors.primary}" stroke-width="2"/>
    <line x1="18.4737" y1="18.036" x2="25.2842" y2="24.8465" stroke="${colors.primary}" stroke-width="2" stroke-linecap="round"/>
    <line x1="1" y1="-1" x2="10.6184" y2="-1" transform="matrix(-0.706138 0.706138 0.708074 0.708074 26.7397 17.9741)" stroke="${colors.primary}" stroke-width="2" stroke-linecap="round"/>
  </svg>

  `;
};
