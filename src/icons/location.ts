// Liste des props acceptés par cette image
interface Props {
    primary?: string;
}

// Couleur par défaut pour chaque props
const defaultColors = {
    primary: '#F48953',
};

export default (props?: Props): string => {
    const colors = { ...defaultColors, ...props };

    return `
    <svg viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.8426 5.76271C15.8426 8.04155 14.8132 10.713 13.5126 12.8434C12.8671 13.9009 12.1757 14.7901 11.5511 15.4042C11.2383 15.7118 10.9574 15.9354 10.7217 16.0777C10.4747 16.2267 10.3377 16.25 10.2963 16.25C10.2549 16.25 10.1179 16.2267 9.87094 16.0777C9.63523 15.9354 9.35429 15.7118 9.04147 15.4042C8.4169 14.7901 7.72549 13.9009 7.07996 12.8434C5.77941 10.713 4.75 8.04155 4.75 5.76271C4.75 3.0554 7.16926 0.75 10.2963 0.75C13.4233 0.75 15.8426 3.0554 15.8426 5.76271Z" stroke="${colors.primary}" stroke-width="1.5"/>
      <circle cx="10.2961" cy="6.29659" r="2.39815" stroke="${colors.primary}" stroke-width="1.5"/>
      <line x1="21.25" y1="16.75" x2="0.75" y2="16.75" stroke="${colors.primary}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;
};
