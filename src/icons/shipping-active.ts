interface Props {
    isInactive?: string;
}

const defaultColors = {
    stroke: '#073E3D',
    frontFill: '#F48953',
    backFill: '#52AA87',
};

export default (props?: Props): string => {
    const colors = {
        ...defaultColors,
        frontFill: props?.isInactive ? '#FFF' : defaultColors.frontFill,
        backFill: props?.isInactive ? '#FFF' : defaultColors.backFill,
    };

    return `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 14a2 2 0 012-2h1a2 2 0 012 2v1.909a2 2 0 001.55 1.949l4.924 1.136a.231.231 0 00.053.006c.261 0 .473.212.473.473V24a2 2 0 01-2 2h-8a2 2 0 01-2-2V14z" fill="${colors.frontFill}"/>
      <rect x="1" y="8" width="22" height="19" rx="1" fill="${colors.backFill}"/>
      <rect x=".75" y="5.75" width="24.75" height="21" rx="1.25" stroke="${colors.stroke}" stroke-width="1.5"/>
      <path d="M25.75 11c0-.69.56-1.25 1.25-1.25h4.62c.35 0 .685.147.922.405l3.454 3.77 2.546 3.198a3.25 3.25 0 01.708 2.025V24.5c0 .69-.56 1.25-1.25 1.25H27c-.69 0-1.25-.56-1.25-1.25V11z" stroke="${colors.stroke}" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="5.625" cy="28.125" r="3.625" fill="#fff" stroke="${colors.stroke}" stroke-width="1.5"/>
      <circle cx="26.875" cy="28.125" r="3.625" fill="#fff" stroke="${colors.stroke}" stroke-width="1.5"/>
      <path d="M38.75 18.75H32a2 2 0 01-2-2V10" stroke="${colors.stroke}" stroke-width="1.5"/>
    </svg>
  `;
};
