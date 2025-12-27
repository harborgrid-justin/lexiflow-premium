/**
 * @module hooks/useGlobalQueryStatus
 * @category Hooks - Data Management
 * @description Global query fetching status hook subscribing to QueryClient updates. Tracks if
 * any queries are currently fetching for global loading indicator display.
 * 
 * NO THEME USAGE: Utility hook for query status tracking
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { useState, useEffect } from 'react';

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Services & Data
import { queryClient } from '@/services';

// ========================================
// HOOK
// ========================================
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

