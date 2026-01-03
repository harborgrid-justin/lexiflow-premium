/**
 * @module components/sidebar/SidebarFooter
 * @category Layout
 * @description Footer section of the sidebar with user menu and actions.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { ChevronDown, LogOut, Settings } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers';
import { useWindow } from '@/providers';

// Components
import { UserAvatar } from '@/components/ui/atoms/UserAvatar';
import { BackendStatusIndicator } from '@/components/organisms/BackendStatusIndicator/BackendStatusIndicator';

// Utils & Constants
import { PATHS } from '@/config/paths.config';
import * as styles from './SidebarFooter.styles';

// Types
import type { User as UserType } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface SidebarFooterProps {
  /** Current user information. */
  currentUser: UserType;
  /** Callback when switch user is triggered. */
  onSwitchUser: () => void;
  /** Callback for navigation. */
  onNavigate: (path: string) => void;
  /** Currently active view path. */
  activeView: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SidebarFooter - React 18 optimized with React.memo
 */
export const SidebarFooter = React.memo<SidebarFooterProps>(function SidebarFooter({ currentUser, onSwitchUser, onNavigate, activeView }) {
  const { theme } = useTheme();
  const { isOrbitalEnabled, toggleOrbitalMode } = useWindow();

  return (
    <div className={styles.getFooterContainer(theme)}>
      {/* Backend Status Indicator - Always shows real-time status */}
      <div className={styles.statusIndicatorContainer} title="Real-time backend monitoring (updates every 30s)">
        <BackendStatusIndicator variant="compact" showLabel={true} showPulse={true} />
      </div>

      <div className={styles.holographicModeContainer}>
          <span className={styles.getHolographicModeLabel(theme)}>Holographic Mode</span>
          <button
            onClick={toggleOrbitalMode}
            className={styles.getToggleButton(theme, isOrbitalEnabled)}
            title={isOrbitalEnabled ? "Windowed Interface" : "Flat Interface"}
          >
            <span className={styles.getToggleIndicator(isOrbitalEnabled)} />
          </button>
      </div>

      <button
        onClick={() => onNavigate(PATHS.PROFILE)}
        className={styles.getUserButton(theme, activeView === PATHS.PROFILE)}
      >
        <UserAvatar name={currentUser?.name || 'Guest'} size="sm" className={styles.userAvatarWrapper} indicatorStatus="online" />
        <div className={styles.userInfoContainer}>
          <p className={styles.getUserName(theme)}>{currentUser?.name || 'Guest'}</p>
          <p className={styles.getUserRole(theme)}>{currentUser?.role || 'User'}</p>
        </div>
        <ChevronDown className={styles.getChevronIcon(theme)} />
      </button>

      <div className={styles.actionButtonsGrid}>
         <button onClick={() => onNavigate(PATHS.ADMIN)} className={styles.getActionButton(theme)}>
            <Settings className={styles.actionButtonIcon}/> Settings
         </button>
         <button onClick={onSwitchUser} className={styles.getActionButton(theme)}>
            <LogOut className={styles.actionButtonIcon}/> Switch
         </button>
      </div>
    </div>
  );
});
