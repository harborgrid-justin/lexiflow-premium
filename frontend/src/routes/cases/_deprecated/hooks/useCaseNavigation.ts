import { useCallback, useMemo } from 'react';
import { isValidUUID, getRouteMatterId, navigateTo } from '../utils/navigationUtils';
import { PATHS } from '@/config/paths.config';

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
