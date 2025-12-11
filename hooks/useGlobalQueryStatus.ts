
import { useState, useEffect } from 'react';
import { queryClient } from '../services/queryClient';

export const useGlobalQueryStatus = () => {
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        const unsubscribe = queryClient.subscribeToGlobalUpdates((status) => {
            setIsFetching(status.isFetching > 0);
        });

        return () => unsubscribe();
    }, []);

    return { isFetching };
};
