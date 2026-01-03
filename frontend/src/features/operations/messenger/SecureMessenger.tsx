/**
 * @module components/messenger/SecureMessenger
 * @category Messenger
 * @description Secure messaging platform with encryption and contacts.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Archive, FileText, MessageSquare, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useSecureMessenger } from '@/hooks/domain';
import { useTheme } from '@/contexts/theme/ThemeContext';

// Components
import { PageHeader } from '@/components/organisms/PageHeader/PageHeader';
import { MessengerArchived } from './MessengerArchived';
import { MessengerContacts } from './MessengerContacts';
import { MessengerFiles } from './MessengerFiles';
import { MessengerInbox } from './MessengerInbox';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
type MessengerView = 'chats' | 'contacts' | 'files' | 'archived';

interface SecureMessengerProps {
  /** Initial tab to display. */
  initialTab?: MessengerView;
}

// ============================================================================
// COMPONENT
// ============================================================================

const PARENT_TABS = [
  {
    id: 'comms', label: 'Communications', icon: MessageSquare,
    subTabs: [
      { id: 'chats', label: 'Inbox', icon: MessageSquare },
      { id: 'archived', label: 'Archived', icon: Archive },
    ]
  },
  {
    id: 'directory', label: 'Directory', icon: Users,
    subTabs: [
      { id: 'contacts', label: 'Contacts', icon: Users },
    ]
  },
  {
    id: 'content', label: 'Content', icon: FileText,
    subTabs: [
      { id: 'files', label: 'Files', icon: FileText },
    ]
  }
];

export const SecureMessenger = ({ initialTab }: SecureMessengerProps) => {
  const { theme } = useTheme();
  const [, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useState<MessengerView>('chats');

  const setActiveTab = (tab: MessengerView) => {
    startTransition(() => {
      _setActiveTab(tab);
    });
  };

  // Re-use hook logic for contacts and files props
  const {
    searchTerm,
    setSearchTerm,
    contacts,
    allFiles
  } = useSecureMessenger();

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const activeParentTab = useMemo(() =>
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
    [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as MessengerView);
    }
  }, []);

  const renderContent = () => {
    if (activeTab === 'chats') return <MessengerInbox />;

    return (
      <div className={cn(
        "flex-1 rounded-lg shadow-sm border overflow-hidden flex flex-col min-h-0 mx-0 mb-0 h-full",
        theme.surface.default,
        theme.border.default,
        isPending && "opacity-60 transition-opacity"
      )}>
        {activeTab === 'contacts' && (
          <MessengerContacts
            contacts={contacts as any[]}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onMessageClick={() => setActiveTab('chats')}
          />
        )}

        {activeTab === 'files' && (
          <MessengerFiles
            files={allFiles}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}

        {activeTab === 'archived' && <MessengerArchived />}
      </div>
    );
  };

  return (
    <div className={cn("h-full flex flex-col overflow-hidden", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader
          title="Secure Messenger"
          subtitle="End-to-End Encrypted Communication Channel."
        />

        {/* Desktop Parent Navigation */}
        <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
          {PARENT_TABS.map(parent => (
            <button
              key={parent.id}
              onClick={() => handleParentTabChange(parent.id)}
              className={cn(
                "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                activeParentTab.id === parent.id
                  ? cn("border-current", theme.primary.text)
                  : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
              )}
            >
              <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? theme.primary.text : theme.text.tertiary)} />
              {parent.label}
            </button>
          ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        {activeParentTab.subTabs.length > 1 && (
          <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4", theme.surface.highlight, theme.border.default)}>
            {activeParentTab.subTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MessengerView)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                  activeTab === tab.id
                    ? cn(theme.surface.default, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border)
                    : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface.default}`)
                )}
              >
                <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? theme.primary.text : theme.text.tertiary)} />
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-6 pb-6">
        {renderContent()}
      </div>
    </div>
  );
};
export default SecureMessenger;
