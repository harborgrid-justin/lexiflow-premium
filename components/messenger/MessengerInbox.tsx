
import React from 'react';
import { useSecureMessenger } from '../../hooks/useSecureMessenger';
import { MessengerChatList } from './MessengerChatList';
import { MessengerChatWindow } from './MessengerChatWindow';
import { SplitView } from '../layout/SplitView';

export const MessengerInbox: React.FC = () => {
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
