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
    <svg version="1.1" id="Calque_1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 40 40" xml:space="preserve">
      <path d="M8.4 32.7c.1.2.2.4.3.5l.9 1.1c.4.4.9.7 1.5.7h15.6c.9 0 1.7-.6 1.9-1.5l3.6-13c.4-1.3-.6-2.5-1.9-2.5H5" fill="${colors.fill}"/>
      <path class="st1" d="M12.7 21.1l1.9 8.5M28.1 20.9l-2.5 8.7M20.1 29.3v-9M33 28.2l-1.8 4.9c-.6 1.6-2.1 2.6-3.8 2.6H12.5c-1.8 0-3.4-1.2-3.9-3L4.6 18c-.3-1.3.6-2.5 1.9-2.5H33.7c1.3 0 2.2 1.2 1.9 2.4L33 28.2zM12.7 21.1l1.9 8.5M28.1 20.9l-2.5 8.7M20.1 29.3v-9M10 15.5S11.9 5 20.1 5c8.4-.2 8.9 9.5 10.2 10.5" fill="none" stroke="#073e3d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" />
    </svg>
  `;
};
