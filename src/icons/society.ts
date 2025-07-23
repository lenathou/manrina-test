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
    <svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.37651 4.20064C4.75122 3.11244 6.17513 0.936035 8.87303 0.936035C11.5709 0.936035 12.966 3.11244 13.3263 4.20064" stroke="${colors.default}" stroke-width="1.5"/>
        <rect x="1" y="4.27197" width="16" height="9.66447" rx="1" stroke="${colors.default}" stroke-width="1.5"/>
        <line x1="7.65239" y1="8.35449" x2="10.0504" y2="8.35449" stroke="${colors.default}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;
};
