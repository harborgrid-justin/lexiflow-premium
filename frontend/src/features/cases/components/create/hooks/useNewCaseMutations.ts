/**
 * Custom hook for managing NewCase mutations (create, update, delete)
 */

import { useCallback } from 'react';
import { useMutation } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { queryClient } from '@/services/infrastructure/queryClient';
import { useNotify } from '@/hooks/useNotify';
import { queryKeys } from '@/utils/queryKeys';
import { PATHS } from '@/config/paths.config';
import { Matter, Case } from '@/types';

export interface UseNewCaseMutationsResult {
  createMatter: (data: Matter | Case) => Promise<void>;
  updateMatter: (itemId: string, data: Partial<Matter | Case>) => Promise<void>;
  deleteMatter: (itemId: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const useNewCaseMutations = (
  id: string | undefined,
  onSaved?: (id: string) => void,
  onBack?: () => void
): UseNewCaseMutationsResult => {
  const notify = useNotify();

  const navigate = useCallback((path: string) => {
    if (onBack) {
      onBack();
      console.log('useNavigate:', path);
    } else {
      window.location.hash = `#/${path}`;
    }
  }, [onBack]);

  const createMutation = useMutation(
    (data: Matter | Case) => DataService.cases.add(data as Matter),
    {
      onSuccess: (newItem) => {
        queryClient.invalidate(queryKeys.cases.matters.all());
        queryClient.invalidate(queryKeys.cases.all());
        notify.success('Matter created successfully');
        if (newItem && typeof newItem === 'object' && 'id' in newItem) {
          const itemId = newItem.id as string;
          if (onSaved) {
            onSaved(itemId);
          } else {
            navigate(`${PATHS.MATTERS}/${itemId}`);
          }
        } else {
          navigate(PATHS.MATTERS);
        }
      },
      onError: (error) => {
        notify.error(`Failed to create matter: ${error}`);
      }
    }
  );

  const updateMutation = useMutation(
    ({ itemId, data }: { itemId: string; data: Partial<Matter | Case> }) =>
      DataService.cases.update(itemId, data as Partial<Matter>),
    {
      onSuccess: () => {
        queryClient.invalidate(queryKeys.cases.matters.all());
        queryClient.invalidate(queryKeys.cases.all());
        if (id) {
          queryClient.invalidate(queryKeys.cases.matters.detail(id));
        }
        notify.success('Matter updated successfully');
        navigate(PATHS.MATTERS);
      },
      onError: (error) => {
        notify.error(`Failed to update matter: ${error}`);
      }
    }
  );

  const deleteMutation = useMutation(
    (itemId: string) => DataService.cases.delete(itemId),
    {
      onSuccess: () => {
        queryClient.invalidate(queryKeys.cases.matters.all());
        queryClient.invalidate(queryKeys.cases.all());
        notify.success('Matter deleted successfully');
        navigate(PATHS.MATTERS);
      },
      onError: (error) => {
        notify.error(`Failed to delete matter: ${error}`);
      }
    }
  );

  return {
    createMatter: useCallback(async (data: Matter | Case): Promise<void> => {
      await createMutation.mutateAsync(data as Matter);
    }, [createMutation]),
    updateMatter: useCallback(async (itemId: string, data: Partial<Matter | Case>): Promise<void> => {
      await updateMutation.mutateAsync({ itemId, data });
    }, [updateMutation]),
    deleteMatter: useCallback(async (itemId: string): Promise<void> => {
      await deleteMutation.mutateAsync(itemId);
    }, [deleteMutation]),
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
};
