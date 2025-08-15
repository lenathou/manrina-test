const IconComponent = ({ iconString }: { iconString: string }) => {
    return (
        <div
            dangerouslySetInnerHTML={{
                __html: iconString,
            }}
            style={{
                width: 120,
                height: 120,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        ></div>
    );
};

const AllIcons = (props: { allIconsSvg: [string, string][] }) => {
    return (
        <div>
            <div>Liste des icones</div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, 150px)',

                    gap: 20,
                    backgroundColor: '#ddd',
                    padding: 20,
                    justifyItems: 'center',
                    alignItems: 'center',
                }}
            >
                {Object.values(props.allIconsSvg).map(([iconName, icon]) => {
                    return (
                        <div
                            key={iconName}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <IconComponent iconString={icon} />
                            <div>{iconName}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AllIcons;

export const getServerSideProps = async () => {
    const fs = await import('fs');
    const filesInIconFolder = fs.readdirSync('src/icons');

    const allIconsSvg = await Promise.all(
        filesInIconFolder
            .filter((x) => !x.includes('index') && x.includes('.ts'))
            .map(async (iconName) => {
                const icon = await import(`../../icons/${iconName}`);
                const iconNameWithoutSuffix = iconName.split('.')[0];
                return [iconNameWithoutSuffix, icon.default({})];
            }),
    );
    const allSvgStuff = await Promise.all(
        filesInIconFolder
            .filter((iconName) => iconName.includes('.svg'))
            .map(async (iconName) => {
                const icon = fs.readFileSync(`src/icons/${iconName}`, 'utf-8');
                const iconNameWithoutSuffix = iconName.split('.')[0];
                return [iconNameWithoutSuffix, icon];
            }),
    );
    const imgStuff = await Promise.all(
        filesInIconFolder
            .filter((iconName) => iconName.includes('.png'))
            .map(async (iconName) => {
                const iconDataString = fs.readFileSync(`src/icons/${iconName}`, 'base64');
                const iconNameWithoutSuffix = iconName.split('.')[0];
                return [
                    iconNameWithoutSuffix,
                    `<img width="80px" height="80px" style="object-fit:contain" src="data:image/png;base64,${iconDataString}" />`,
                ];
            }),
    );
    const allData = [...allIconsSvg, ...allSvgStuff, ...imgStuff];
    allData.sort((a, b) => a[0].localeCompare(b[0]));
    return {
        props: { allIconsSvg: allData },
    };
};
