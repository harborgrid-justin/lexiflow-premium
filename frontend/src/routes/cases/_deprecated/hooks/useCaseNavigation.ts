import { useCallback, useMemo } from 'react';

import { PATHS } from '@/config/paths.config';

import { isValidUUID, getRouteMatterId, navigateTo } from '../utils/navigationUtils';

export function useCaseNavigation() {
  const matterId = useMemo(() => getRouteMatterId(window.location.hash), []);
  
  const navigate = useCallback((path: string) => {
    navigateTo(path);
  }, []);

  const backToMatters = useCallback(() => {
    navigate(PATHS.MATTERS);
  }, [navigate]);

  const isValidMatter = useMemo(() => {
    return !!(matterId && isValidUUID(matterId));
  }, [matterId]);

  return {
    matterId,
    navigate,
    backToMatters,
    isValidMatter
  };
}
