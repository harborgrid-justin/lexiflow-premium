/**
 * @module components/messenger/MessengerInbox
 * @category Messenger
 * @description Messenger inbox with split view for conversations.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useSecureMessenger } from '@/hooks/useSecureMessenger';

// Components
import { SplitView } from '@/shared/ui/organisms/SplitView';
import { MessengerChatList } from './MessengerChatList';
import { MessengerChatWindow } from './MessengerChatWindow';

// ============================================================================
// COMPONENT
// ============================================================================

export const MessengerInbox = () => {
  const {
    activeConvId,
    setActiveConvId,
    searchTerm,
    setSearchTerm,
    inputText,
    setInputText,
    pendingAttachments,
    setPendingAttachments,
    isPrivilegedMode,
    setIsPrivilegedMode,
    activeConversation,
    filteredConversations,
    handleSelectConversation,
    handleSendMessage,
    handleFileSelect,
    formatTime
  } = useSecureMessenger();

  return (
    <SplitView
      showSidebarOnMobile={!activeConvId}
      className="h-full border-t border-slate-200"
      sidebar={
        <MessengerChatList
          conversations={filteredConversations}
          activeConvId={activeConvId}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSelectConversation={handleSelectConversation}
          formatTime={formatTime}
        />
      }
      content={
        <MessengerChatWindow
          activeConversation={activeConversation}
          activeConvId={activeConvId}
          setActiveConvId={setActiveConvId}
          inputText={inputText}
          setInputText={setInputText}
          pendingAttachments={pendingAttachments}
          setPendingAttachments={setPendingAttachments}
          isPrivilegedMode={isPrivilegedMode}
          setIsPrivilegedMode={setIsPrivilegedMode}
          handleSendMessage={handleSendMessage}
          handleFileSelect={handleFileSelect}
          formatTime={formatTime}
        />
      }
    />
  );
};
