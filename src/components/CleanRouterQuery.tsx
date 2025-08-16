export const cleanRouterQuery = (routerQuery: Record<string, string | number>) => {
    return Object.fromEntries(
        Object.entries(routerQuery).filter(([key, value]) => {
            if (key === 'page') {
                return !!value && +value > 1;
            }
            return !!value;
        }),
    );
};
