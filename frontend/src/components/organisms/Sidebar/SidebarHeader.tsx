/**
 * @module components/sidebar/SidebarHeader
 * @category Layout
 * @description Header section of the sidebar displaying tenant branding.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Scale, X } from 'lucide-react';
// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/useQueryHooks'; // CORRECT
import { DataService } from '@/services/data/dataService';

// Hooks & Context
import { useTheme } from '@/theme';

// Utils & Constants
import * as styles from './SidebarHeader.styles';

// Types
import type { TenantConfig } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface SidebarHeaderProps {
  /** Callback when close button is clicked. */
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SidebarHeader - React 18 optimized with React.memo
 */
export const SidebarHeader = React.memo<SidebarHeaderProps>(function SidebarHeader({ onClose }) {
  const { theme } = useTheme();

  const { data: tenantConfig } = useQuery<TenantConfig>(
    ['admin', 'tenant'],
    () => DataService.admin.getTenantConfig(),
    { initialData: { name: 'LexiFlow', tier: 'Enterprise Suite', version: '2.5', region: 'US-East-1' } }
  );

  return (
    <div className={styles.getHeaderContainer(theme)}>
      <div className={styles.brandingContainer}>
        <div className={styles.getLogoContainer(theme)}>
          <Scale className={styles.logoIcon} />
        </div>
        <div className={styles.textContainer}>
          <h1 className={styles.getTenantName(theme)}>{tenantConfig?.name}</h1>
          <p className={styles.getTenantTier(theme)}>{tenantConfig?.tier}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Close sidebar"
        className={styles.getCloseButton(theme)}
      >
        <X className={styles.closeIcon} />
      </button>
    </div>
  );
});
