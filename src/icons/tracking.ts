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
  <svg viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="5.177" y1="6.19043" x2="11.1694" y2="6.19043" stroke="${colors.color}" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M12.08 13.4727C11.6658 13.4727 11.33 13.8084 11.33 14.2227C11.33 14.6369 11.6658 14.9727 12.08 14.9727V13.4727ZM19.8208 13.4727L12.08 13.4727V14.9727L19.8208 14.9727V13.4727Z" fill="${colors.color}"/>
  <path d="M18.3188 11.6807L20.8608 14.2228L18.3188 16.7647" stroke="${colors.color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="5.177" y1="10.1904" x2="11.1694" y2="10.1904" stroke="${colors.color}" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M15.1338 9.86089V1H1.0596V7.84595V14.6919L1 18.9421L4.76845 15.1736L8.53689 18.9421L9.74683 17.7321" stroke="${colors.color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

  `;
};
