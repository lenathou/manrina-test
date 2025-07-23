// Liste des props acceptés par cette image
interface Props {
    primary?: string;
}

const defaultColors = {
    primary: '#073E3D',
};

export default (props?: Props): string => {
    const colors = { ...defaultColors, ...props };

    return `
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M35 17.9626C35 26.7055 28.4097 33.8791 19.8722 34.8505C19.2731 34.9253 18.5991 35 18 35C15.978 35 14.1057 34.6264 12.3084 34.0286C5.71807 31.7121 1 25.3604 1 18.0374C1 10.789 5.56827 4.58681 12.0088 2.12088C13.881 1.44835 15.9031 1 18 1C21.6696 1 25.0396 2.12088 27.8106 4.13846C32.1542 7.12747 35 12.2088 35 17.9626Z" stroke="${colors.primary}" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 22.6703C17.9251 21.9978 18 21.3253 18.2246 20.6528C18.4493 20.055 18.674 19.4572 19.1982 19.0088C19.5726 18.7099 20.022 18.411 20.3964 18.1121C21.5198 17.2901 22.1189 16.1692 22.1189 14.8242C22.1189 12.5824 20.2467 10.7143 18 10.7143C15.7533 10.7143 13.881 12.5824 13.881 14.8242" stroke="${colors.primary}" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18.1497 27.5276C18.7701 27.5276 19.2731 27.0257 19.2731 26.4067C19.2731 25.7876 18.7701 25.2858 18.1497 25.2858C17.5293 25.2858 17.0264 25.7876 17.0264 26.4067C17.0264 27.0257 17.5293 27.5276 18.1497 27.5276Z" fill="${colors.primary}"/>
    </svg>
  `;
};
