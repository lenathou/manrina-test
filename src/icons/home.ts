// Liste des props acceptés par cette image
interface Props {
    isActive?: boolean;
}

export default (props?: Props): string => {
    const colors = {
        background: props?.isActive ? '#F48953' : '#FFFFFF',
    };

    return `
    <svg width="38" height="31" viewBox="0 0 38 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28.5 12.1177V28.4999H9.33889C8.0025 28.4999 6.90909 27.4468 6.90909 26.1303V12.4389L17.7217 5.52734C18.5114 5.06657 19.4226 5.06657 20.2123 5.52734L27.3458 9.87965C28.0748 10.3404 28.5 11.1961 28.5 12.1177Z" fill="${colors.background}"/>
      <path d="M1.4837 11.6457L17.5429 1.87246C18.349 1.36803 19.341 1.36803 20.0851 1.87246L36.5163 12.024" stroke="#073E3D" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M31.1219 8.68225V26.211C31.1219 27.5982 30.0058 28.7331 28.6417 28.7331H8.98626C7.62216 28.7331 6.50607 27.5982 6.50607 26.211V8.68225" stroke="#073E3D" stroke-width="1.5" stroke-miterlimit="10" stroke-linejoin="round"/>
      <path d="M19.155 18.7076H18.783C16.9849 18.7076 15.5587 20.1579 15.5587 21.9864V28.607H22.3793V21.9864C22.3793 20.1579 20.9531 18.7076 19.155 18.7076Z" fill="white" stroke="#073E3D" stroke-width="1.5" stroke-miterlimit="10"/>
    </svg>
  `;
};
