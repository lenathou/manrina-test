interface Props {
    isInactive?: string;
}

const defaultColors = {
    default: 'rgb(160,166,167)',
};

export default (): string => {
    const colors = {
        ...defaultColors,
    };

    return `
    <svg width="100%" height="100%" viewBox="0 0 22 23" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;">
        <g transform="matrix(1,0,0,1,2.09233,2.09233)">
            <path d="M2.85,6.753C3.312,4.835 5.065,1 8.387,1C11.71,1 13.428,4.835 13.871,6.753" style="fill:none;fill-rule:nonzero;stroke:${colors.default};stroke-width:1.5px;"/>
            <path d="M16,7.336C16,6.784 15.552,6.336 15,6.336L2,6.336C1.448,6.336 1,6.784 1,7.336L1,16C1,16.552 1.448,17 2,17L15,17C15.552,17 16,16.552 16,16L16,7.336Z" style="fill:none;stroke:rgb(160,166,167);stroke-width:1.5px;"/>
            <ellipse cx="8.5" cy="11.142" rx="1.562" ry="1.562" style="fill:${colors.default};"/>
            <path d="M8.38,13.963L8.38,12.783" style="fill:none;fill-rule:nonzero;stroke:${colors.default};stroke-width:1.5px;stroke-linecap:round;"/>
        </g>
    </svg>
  `;
};
