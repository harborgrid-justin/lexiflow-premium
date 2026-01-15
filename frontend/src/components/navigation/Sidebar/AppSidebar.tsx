import { Sidebar } from '@/components/organisms/Sidebar';
import { AppView, User, UserRole } from '@/types';
import { memo } from 'react';

export interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeItem?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onNavigate?: (view: string) => void;
}

export const AppSidebar = memo<AppSidebarProps>(({
  isOpen,
  onToggle,
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
          onNavigate(view as string);
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
