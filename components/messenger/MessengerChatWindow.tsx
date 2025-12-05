
import React, { useState } from 'react';
import { Conversation, Attachment } from '../../hooks/useSecureMessenger';
import { Lock, Shield } from 'lucide-react';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { FileAttachment } from '../common/FileAttachment';
import { GeminiService } from '../../services/geminiService';
import { useNotify } from '../../hooks/useNotify';
import { useWindow } from '../../context/WindowContext';
import { DocumentPreviewPanel } from '../document/DocumentPreviewPanel';

interface MessengerChatWindowProps {
  activeConversation: Conversation | undefined;
  activeConvId: string | null;
  setActiveConvId: (id: string | null) => void;
  inputText: string;
  setInputText: (text: string) => void;
  pendingAttachments: Attachment[];
  setPendingAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  isPrivilegedMode: boolean;
  setIsPrivilegedMode: (mode: boolean) => void;
  handleSendMessage: () => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formatTime: (iso: string) => string;
}

export const MessengerChatWindow: React.FC<MessengerChatWindowProps> = ({
  activeConversation, activeConvId, setActiveConvId,
  inputText, setInputText, pendingAttachments, setPendingAttachments,
  isPrivilegedMode, setIsPrivilegedMode, handleSendMessage, handleFileSelect, formatTime
}) => {
  const notify = useNotify();
  const { openWindow, closeWindow } = useWindow();
  const [isThinking, setIsThinking] = useState(false);

  const handleSmartReply = async () => {
      if (!activeConversation || activeConversation.messages.length === 0) {
          notify.info("No messages to reply to.");
          return;
      }
      
      const lastMsg = activeConversation.messages[activeConversation.messages.length - 1];
      if (lastMsg.senderId === 'me') {
           notify.info("Waiting for their reply.");
           return;
      }

      setIsThinking(true);
      try {
          const suggestion = await GeminiService.generateReply(lastMsg.text, activeConversation.role);
          setInputText(suggestion);
      } catch (e) {
          notify.error("Failed to generate reply.");
      } finally {
          setIsThinking(false);
      }
  };
  
  const handlePreviewAttachment = (att: Attachment) => {
      const winId = `preview-${att.name}`;
      openWindow(
          winId,
          `Preview: ${att.name}`,
          <div className="bg-white h-full flex flex-col">
             <DocumentPreviewPanel 
                document={{ 
                    id: 'temp', 
                    title: att.name, 
                    type: att.type === 'image' ? 'JPG' : 'PDF', 
                    content: 'Preview Content', 
                    uploadDate: '', 
                    lastModified: '', 
                    tags: [], 
                    versions: [], 
                    caseId: 'N/A' 
                }} 
                onViewHistory={() => {}} 
                isOrbital={true} 
             />
          </div>
      );
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 h-full bg-slate-50/30">
        <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Lock className="h-12 w-12 text-slate-300"/>
        </div>
        <h3 className="text-xl font-bold text-slate-700">Secure Messenger</h3>
        <p className="text-center max-w-sm mt-2 text-slate-500">
          Select a conversation to start communicating securely with clients, partners, and external counsel.
        </p>
        <div className="mt-8 flex gap-4 text-xs">
          <div className="flex items-center"><Shield className="h-4 w-4 mr-2 text-green-500"/> SOC2 Compliant</div>
          <div className="flex items-center"><Lock className="h-4 w-4 mr-2 text-green-500"/> E2E Encrypted</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/30">
      <ChatHeader 
        conversation={activeConversation} 
        onBack={() => setActiveConvId(null)} 
      />
      
      <div className="flex-1 overflow-hidden relative">
         {/* Pass handlePreviewAttachment down if MessageList accepts it, or implement via context. 
             For this iteration, we assume MessageList handles basic rendering and we'd wire it up there. 
             Since MessageList is memoized, we'll assume it has a way to trigger previews or we'd refactor it. 
         */}
         <MessageList 
            conversation={activeConversation} 
            currentUserId="me" 
            formatTime={formatTime} 
         />
      </div>

      {/* Pending Attachments Preview in Input Area */}
      {pendingAttachments.length > 0 && (
        <div className="px-4 pt-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto shrink-0">
          {pendingAttachments.map((att, i) => (
            <div key={i} className="relative group cursor-pointer" onClick={() => handlePreviewAttachment(att)}>
              <FileAttachment 
                name={att.name} 
                size={att.size} 
                type={att.type} 
                className="w-48 shadow-sm"
              />
              <button 
                onClick={(e) => { e.stopPropagation(); setPendingAttachments(prev => prev.filter((_, idx) => idx !== i)); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <ChatInput 
        inputText={inputText}
        setInputText={setInputText}
        pendingAttachments={pendingAttachments}
        setPendingAttachments={setPendingAttachments}
        isPrivilegedMode={isPrivilegedMode}
        setIsPrivilegedMode={setIsPrivilegedMode}
        onSend={handleSendMessage}
        onFileSelect={handleFileSelect}
        draft={activeConversation.draft}
        recipientName={activeConversation.name}
        onAiAssist={handleSmartReply}
        isAiThinking={isThinking}
      />
    </div>
  );
};
