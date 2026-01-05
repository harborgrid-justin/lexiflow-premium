
import React, { useTransition, useMemo } from 'react';
import { 
  MessageSquare, Users, FileText, Archive
} from 'lucide-react';
import { PageHeader } from './common/PageHeader.tsx';
import { TabNavigation } from './common/TabNavigation.tsx';
import { useSecureMessenger } from '../hooks/useSecureMessenger.ts';
import { MessengerChatList } from './messenger/MessengerChatList.tsx';
import { MessengerChatWindow } from './messenger/MessengerChatWindow.tsx';
import { MessengerContacts } from './messenger/MessengerContacts.tsx';
import { MessengerFiles } from './messenger/MessengerFiles.tsx';
import { SplitView } from './layout/SplitView.tsx';

export const SecureMessenger: React.FC = () => {
  const {
    view,
    setView,
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
    formatTime,
    contacts,
    allFiles,
    startChat
  } = useSecureMessenger();

  const [isPending, startTransition] = useTransition();

  const handleViewChange = (newView: string) => {
      startTransition(() => {
          setView(newView as any);
      });
  };

  const tabs = useMemo(() => [
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'contacts', label: 'Directory', icon: Users },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'archived', label: 'Archive', icon: Archive },
  ], []);

  const renderViewContent = () => {
    if (view === 'chats') {
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
                    onNewChat={() => handleViewChange('contacts')}
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
    }

    return (
        <div className={`flex-1 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full mx-0 mb-0 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
          {view === 'contacts' && (
            <MessengerContacts 
              contacts={contacts}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onMessageClick={(id) => startChat(id)}
            />
          )}

          {view === 'files' && (
            <MessengerFiles 
              files={allFiles}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

          {view === 'archived' && (
            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-slate-400">
              <div className="p-4 bg-slate-50 rounded-full mb-4">
                <Archive className="h-12 w-12 opacity-50"/>
              </div>
              <h3 className="text-lg font-medium text-slate-600">Archived Conversations</h3>
              <p className="text-sm mt-2">No archived threads found in the last 90 days.</p>
            </div>
          )}
        </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in relative">
      <div className="absolute top-2 right-6 z-50">
        <span className="bg-slate-900 text-blue-400 font-mono text-[10px] font-black px-2 py-1 rounded border border-slate-700 shadow-xl opacity-0 hover:opacity-100 transition-opacity">
          MSG-01
        </span>
      </div>

      <div className="px-6 pt-6 pb-2 shrink-0">
        <PageHeader 
            title="Secure Messenger" 
            subtitle="End-to-End Encrypted Communication Channel." 
        />
        <TabNavigation 
            tabs={tabs} 
            activeTab={view} 
            onTabChange={handleViewChange}
            className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm"
        />
      </div>
      
      <div className="flex-1 flex flex-col px-6 pt-4 pb-6 min-h-0">
        {renderViewContent()}
      </div>
    </div>
  );
};
