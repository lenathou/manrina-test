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
    <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0)">
        <path d="M7.91995 8.23113C9.81803 8.23113 11.3567 6.76836 11.3567 4.96395C11.3567 3.15954 9.81803 1.69678 7.91995 1.69678C6.02186 1.69678 4.48315 3.15954 4.48315 4.96395C4.48315 6.76836 6.02186 8.23113 7.91995 8.23113Z" stroke="${colors.default}" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M1.25238 13.7935H14.7476" stroke="${colors.default}" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13.1884 12.2477C13.3675 12.6638 13.4907 13.0986 13.556 13.5417L2.45758 13.5417C2.52292 13.0986 2.6461 12.6638 2.82516 12.2477C3.10446 11.5987 3.51465 11.0071 4.03377 10.5075C4.55295 10.0078 5.17085 9.60992 5.85289 9.338C6.53496 9.06607 7.26694 8.92578 8.0068 8.92578C8.74665 8.92578 9.47863 9.06607 10.1607 9.338C10.8427 9.60992 11.4606 10.0078 11.9798 10.5075C12.4989 11.0071 12.9091 11.5987 13.1884 12.2477Z" stroke="${colors.default}" stroke-width="1.5"/>
        </g>
        <defs>
        <clipPath id="clip0">
        <rect width="16" height="14" fill="white" transform="translate(0 0.70752)"/>
        </clipPath>
        </defs>
    </svg>
  `;
};
