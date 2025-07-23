interface Props {
    isInactive?: string;
}

const defaultColors = {
    fill: '#F48953',
};

export default (props?: Props): string => {
    const colors = {
        ...defaultColors,
        fill: props?.isInactive ? '#FFF' : defaultColors.fill,
    };

    return `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.5 22c-6.4-.8-10.667 6-12 9.5 4.8 6.8 15 6 22 3 .333-4.333-3.6-11.7-10-12.5z" fill="${colors.fill}"/>
      <path d="M19 22c3.314 0 6-2.91 6-6.5S22.314 9 19 9s-6 2.91-6 6.5 2.686 6.5 6 6.5z" fill="${colors.fill}"/>
      <path d="M20 22c3.866 0 7-2.91 7-6.5S23.866 9 20 9s-7 2.91-7 6.5 3.134 6.5 7 6.5zM32 31c-1.451-2.665-5.08-9-12-9-7.48 0-10.549 6.335-12 9" stroke="#073E3D" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20 37c9.389 0 17-7.611 17-17S29.389 3 20 3 3 10.611 3 20s7.611 17 17 17z" stroke="#073E3D" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 17s.78 1 2.026 1C21.273 18 22 17 22 17M18 13v1M22 13v1" stroke="#073E3D" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
};
