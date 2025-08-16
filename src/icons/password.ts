interface Props {
    isInactive?: string;
}

const defaultColors = {
    default: '#F48953',
};

export default (): string => {
    const colors = {
        ...defaultColors,
    };

    return `
    <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.85016 6.84892C3.31159 4.93118 5.06503 1.0957 8.38729 1.0957C11.7096 1.0957 13.4275 4.93118 13.8712 6.84892" stroke="${colors.default}" stroke-width="1.5"/>
        <rect x="1" y="6.43164" width="15" height="10.6642" rx="1" stroke="${colors.default}" stroke-width="1.5"/>
        <ellipse cx="8.5" cy="11.2374" rx="1.56189" ry="1.56211" fill="${colors.default}"/>
        <line x1="8.38" y1="14.0586" x2="8.38" y2="12.8787" stroke="${colors.default}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;
};
