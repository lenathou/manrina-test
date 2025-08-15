interface Props {
    isInactive?: string;
}

const defaultColors = {
    fillApple: '#F48953',
    fillBottle: '#52AA87',
};

export default (props?: Props): string => {
    const colors = {
        ...defaultColors,
        fillApple: props?.isInactive ? '#FFF' : defaultColors.fillApple,
        fillBottle: props?.isInactive ? '#FFF' : defaultColors.fillBottle,
    };

    return `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.895 23.906A9.085 9.085 0 0122.547 22c.468-.238 1.014-.238 1.482-.08.546.16 1.248.318 1.794.318 1.092-.079 2.262-.555 2.886-.317 3.822 1.11 5.85 4.444 5.46 8.728-.312 3.968-3.354 7.221-7.254 7.777-2.808.396-5.382-.715-7.176-2.54" fill="${colors.fillApple}"/>
      <path d="M8.059 15.309C6.738 16.015 5 17.076 5 18.349v17.61C5 37.656 6.32 39 7.99 39h8.48c.557 0 1.113-.141 1.53-.424h-.765V17.642c0-1.131-.695-2.192-1.738-2.616-.278-.142-.556-.213-.764-.283l-1.182-.495c-1.46-.566-3.129-.071-4.45.566-.277.07-.625.282-1.042.495z" fill="${colors.fillBottle}"/>
      <path d="M15 5H9v3h6V5zM13.727 8s-.353 2.59.846 3.094C15.7 11.668 20 13.036 20 15.122V34.62C20 36.489 18.52 38 16.687 38H7.313C5.48 38 4 36.49 4 34.619V15.194c0-1.87 5.216-4.029 5.85-4.388.987-.864.423-2.806.423-2.806h3.454zM20.207 21.843c.858-.873 1.872-1.666 3.042-2.142.546-.239 1.17-.239 1.716-.08.546.159 1.404.397 2.106.318 1.248-.08 2.574-.635 3.354-.397 4.368 1.27 6.63 5.078 6.24 9.919-.39 4.523-3.9 8.331-8.346 8.887a9.579 9.579 0 01-8.19-2.936M27.07 19.462s1.717-3.332 3.667-4.681" stroke="#073E3D" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8.038 12.956s-.078 0-.078.078l.078-.078z" fill="${colors.fillApple}"/>
    </svg>
  `;
};
