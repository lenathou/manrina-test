import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { cleanRouterQuery } from '../components/CleanRouterQuery';

/**
 * Hook to centralize the logic for search & pagination in the URL.
 */
export const useUrlSearch = () => {
    const router = useRouter();

    // Return an empty string instead of undefined
    const search = useMemo(() => {
        return (router.query.search as string) || '';
    }, [router.query.search]);

    // Function to update the search and reset page
    const setSearch = (searchString: string) => {
        router.replace(
            {
                pathname: router.pathname,
                query: cleanRouterQuery({
                    ...router.query,
                    search: searchString,
                    page: 1, // reset page on search change
                }),
            },
            undefined,
            { shallow: true },
        );
    };

    // Function to update the page number in the URL
    const updatePage = (pageNumber: number) => {
        router.push(
            {
                pathname: router.pathname,
                query: cleanRouterQuery({
                    ...router.query,
                    page: pageNumber,
                }),
            },
            undefined,
            { shallow: true },
        );
    };

    return { search, setSearch, updatePage };
};
