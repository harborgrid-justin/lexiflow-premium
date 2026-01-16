/**
 * Compatibility layer for theme-level chart color helpers.
 *
 * Existing aliases expect the service under /src/theme/services, so we re-export
 * the centralized implementation from /src/lib/theme/services.
 */
export { ChartColorService } from "@/lib/theme/services/chartColorService";
