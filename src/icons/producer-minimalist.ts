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
  <svg width="37" height="38" viewBox="0 0 37 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M27.2892 11.2908C27.4462 11.8785 27.5247 12.4661 27.5247 13.1272C27.5247 16.9468 24.6996 20.2523 20.9327 21.1338C20.2265 21.3541 19.4417 21.4276 18.657 21.4276C13.713 21.4276 9.78925 17.6814 9.78925 13.1272C9.78925 12.4661 9.86772 11.8785 10.0247 11.2908" stroke="${colors.primary}" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M36.0001 37C35.3723 32.6662 32.7041 21.2807 18.657 21.4276C18.5785 21.4276 18.5785 21.4276 18.5001 21.4276C18.4216 21.4276 18.4216 21.4276 18.3431 21.4276C4.29602 21.2807 1.54939 32.5927 1.00006 37" stroke="${colors.primary}" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12.2222 22.7498V30.4625" stroke="${colors.primary}" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M25.3276 22.7498V30.4625" stroke="${colors.primary}" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8.61234 37V30.8298H28.3096V37" stroke="${colors.primary}" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M29.2512 11.2909H7.74894C6.72876 11.2909 5.944 10.5563 5.944 9.60141C5.944 8.6465 6.72876 7.91196 7.74894 7.91196H29.2512C30.2714 7.91196 31.0561 8.6465 31.0561 9.60141C31.0561 10.4829 30.2714 11.2909 29.2512 11.2909Z" stroke="${colors.primary}" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M27.4463 7.83848C27.4463 7.83848 26.3476 1.08064 23.6795 1.00718C21.0113 0.933727 19.5203 1.44791 18.5001 1.44791C17.4799 1.44791 15.9889 0.933727 13.3207 1.00718C10.6525 1.08064 9.55389 7.83848 9.55389 7.83848" stroke="${colors.primary}" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

  `;
};
