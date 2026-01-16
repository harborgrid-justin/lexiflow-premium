/**
 * Messages Hook
 * Production implementation using communications API
 */

import { useNotify } from "@/hooks/useNotify";
import { useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";
import { queryKeys } from "@/utils/queryKeys";

export function useMessages() {
  const notify = useNotify();

  const { data: messages = [], isLoading } = useQuery(
    queryKeys.messages.all(),
    async () => {
      try {
        return await DataService.communications.getMessages();
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        notify.error("Failed to load messages");
        return [];
      }
    },
  );

  return {
    messages,
    isLoading,
  };
}
