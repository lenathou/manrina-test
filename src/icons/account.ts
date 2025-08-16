// Liste des props acceptés par cette image
interface Props {
    isActive?: boolean;
}

export default (props?: Props): string => {
    const colors = {
        background: props?.isActive ? '#F48953' : '#FFFFFF',
    };

    return `
    <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.2186 10.8304C17.2186 12.5486 16.3375 14.0465 15.0599 14.9276C14.6634 15.0598 14.2229 15.1038 13.7823 15.1038C10.9628 15.1038 8.76001 12.857 8.76001 10.1256C8.76001 8.40741 9.64112 6.90953 10.9187 6.02842C11.3152 5.89626 11.7558 5.8522 12.1963 5.8522C14.9718 5.80814 17.2186 8.05496 17.2186 10.8304Z" fill="${colors.background}"/>
      <path d="M22.1528 23.4743C19.95 25.1924 17.1745 26.2057 14.1347 26.2057C10.1257 26.2057 6.55721 24.3995 4.17822 21.5359C5.72016 19.3771 8.23131 16.9541 12.5928 16.9541C17.8354 16.9541 20.7871 21.1834 22.1528 23.4743Z" fill="${colors.background}"/>
      <path d="M18.7165 10.1259C18.7165 12.4167 17.1305 14.3992 15.0159 14.9719C14.6194 15.1041 14.1788 15.1482 13.7383 15.1482C10.9628 15.1041 8.76001 12.8573 8.76001 10.1259C8.76001 8.4077 9.64112 6.90982 10.9187 6.02872C11.7117 5.456 12.6809 5.14761 13.7383 5.14761C16.5137 5.10355 18.7165 7.35037 18.7165 10.1259Z" stroke="#073E3D" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M23.2101 21.8444C22.0647 19.8619 19.2011 15.1479 13.7382 15.1479C7.83484 15.1479 5.41179 19.8619 4.26636 21.8444" stroke="#073E3D" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M26.2058 13.7382C26.2058 17.7472 24.3114 21.2716 21.4038 23.5625C19.2891 25.2366 16.6458 26.2058 13.7382 26.2058C9.90534 26.2058 6.46903 24.4436 4.17816 21.7122C2.37189 19.5535 1.27051 16.778 1.27051 13.7382C1.27051 6.86553 6.86553 1.27051 13.7382 1.27051C20.6108 1.27051 26.2058 6.86553 26.2058 13.7382Z" stroke="#073E3D" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12.02 11.5796C12.02 11.5796 12.6808 12.3726 13.7382 12.3726C14.7955 12.3726 15.4123 11.5796 15.4123 11.5796" stroke="#073E3D" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12.1963 8.36328V9.24439" stroke="#073E3D" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15.28 8.36328V9.24439" stroke="#073E3D" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
};
