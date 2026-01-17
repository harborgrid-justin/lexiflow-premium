import { memo } from 'react';

import { Sidebar } from '@/components/organisms/Sidebar';
import { type AppView, type User, type UserRole } from '@/types';

export interface AppSidebarProps {
  isOpen: boolean;
  isCollapsed?: boolean;
  onToggle: () => void;
  onToggleCollapsed?: () => void;
  activeItem?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onNavigate?: (view: string) => void;
}

export const AppSidebar = memo<AppSidebarProps>(({
  isOpen,
  isCollapsed: _isCollapsed = false,
  onToggle,
  onToggleCollapsed: _onToggleCollapsed,
  activeItem,
  userName,
  userEmail,
  userRole,
  onNavigate
}) => {
  const currentUser: User = {
    id: 'current',
    name: userName || 'User',
    email: userEmail || '',
    role: (userRole as UserRole) || 'Guest',
    firstName: userName?.split(' ')[0] || 'User',
    lastName: userName?.split(' ')[1] || '',
    preferences: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as User;

  return (
    <Sidebar
      activeView={(activeItem as AppView) || 'dashboard'}
      setActiveView={(view) => {
        // If onNavigate is provided, use it. logic implies view is string.
        if (onNavigate) {
          onNavigate(view);
        }
      }}
      isOpen={isOpen}
      onClose={onToggle}
      currentUser={currentUser}
      onSwitchUser={() => console.log('Switch user requested')}
    />
  );
});

AppSidebar.displayName = 'AppSidebar';
