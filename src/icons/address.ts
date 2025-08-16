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
    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.25 5.42373C13.25 7.55484 12.2742 10.0598 11.037 12.0614C10.4234 13.0542 9.76662 13.8882 9.17436 14.4634C8.87772 14.7515 8.61227 14.9599 8.39063 15.092C8.15802 15.2307 8.03264 15.25 8 15.25C7.96736 15.25 7.84198 15.2307 7.60937 15.092C7.38773 14.9599 7.12228 14.7515 6.82564 14.4634C6.23338 13.8882 5.57664 13.0542 4.96297 12.0614C3.72577 10.0598 2.75 7.55484 2.75 5.42373C2.75 2.91195 5.02746 0.75 8 0.75C10.9725 0.75 13.25 2.91195 13.25 5.42373Z" stroke="${colors.default}" stroke-width="1.5"/>
        <circle cx="8" cy="6" r="1.25" stroke="${colors.default}" stroke-width="1.5"/>
        <line x1="15.25" y1="15.4302" x2="0.75" y2="15.4302" stroke="${colors.default}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;
};
