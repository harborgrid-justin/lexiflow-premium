/**
 * Backend Integration Hooks Barrel Export
 *
 * Aligns the legacy '@/hooks/backend' import with the current hook locations.
 *
 * Existing imports should continue to work while the internal files move into
 * `hooks/data` and `hooks/ui` for clearer separation.
 */

export { useBackendDiscovery } from "./data/useBackendDiscovery";
export { useBackendHealth } from "./data/useBackendHealth";

export { queryClient, useMutation, useQuery } from "./useQueryHooks";

export { useDataServiceCleanup } from "./data/useDataServiceCleanup";

export { useEntityAutocomplete } from "./ui/useEntityAutocomplete";
export { useNotifications } from "./ui/useNotifications";
