/**
 * @module components/messenger/MessengerChatWindow
 * @category Messenger
 * @description Chat window with AI assistance and real-time simulation.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { GeminiService } from '@/services/features/research/geminiService';

// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useNotify } from '@/hooks/useNotify';
import { useWindow } from '@/providers';
import { useInterval } from '@/hooks/useInterval';
import { Conversation, Attachment } from '@/hooks/useSecureMessenger';

// Components
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { FileAttachment } from '@/components/ui/molecules/FileAttachment/FileAttachment';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
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

export const MessengerChatWindow = ({
  activeConversation, setActiveConvId,
  inputText, setInputText, pendingAttachments, setPendingAttachments,
  isPrivilegedMode, setIsPrivilegedMode, handleSendMessage, handleFileSelect, formatTime
}: MessengerChatWindowProps) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const { openWindow } = useWindow();
  const [isThinking, setIsThinking] = useState(false);

  // Real-time Simulation State
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect discipline: Synchronize with DOM scrolling (Principle #6)
  // Strict Mode ready: scrollIntoView is idempotent (Principle #7)
  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      // No cleanup needed - DOM operation is idempotent
  }, [activeConversation?.messages]);

  // Simulate incoming messages/typing with proper cleanup (Principle #6)
  useInterval(() => {
      if (!activeConversation) return;

      // Randomly start typing if not already
      if (!isTyping && Math.random() > 0.92) {
          setIsTyping(true);
          // Concurrent-safe: Store timeout ID for cleanup if needed
          setTimeout(() => setIsTyping(false), 2000 + Math.random() * 3000);
      }
  }, 1000);

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
      } catch {
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
          <div className={cn("h-full flex flex-col", theme.surface.default)}>
             <div className="p-4">
                <p>Preview: {att.name}</p>
             </div>
          </div>
      );
  };

  if (!activeConversation) {
    return (
      <div className={cn("flex-1 flex flex-col items-center justify-center p-8 h-full", theme.surface.highlight, theme.text.tertiary)}>
        <div className={cn("h-24 w-24 rounded-full flex items-center justify-center mb-6", theme.surface.default)}>
          <Lock className="h-12 w-12 opacity-50"/>
        </div>
        <h3 className={cn("text-xl font-bold", theme.text.secondary)}>Secure Messenger</h3>
        <p className="text-center max-w-sm mt-2 opacity-75">
          Select a conversation to start communicating securely with clients, partners, and external counsel.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col h-full", theme.surface.highlight)}>
      <ChatHeader conversation={activeConversation} onBack={() => setActiveConvId(null)} />

      <div className="flex-1 overflow-hidden relative">
         <MessageList
            conversation={activeConversation}
            currentUserId="me"
            formatTime={formatTime}
         />
         {isTyping && (
             <div className="absolute bottom-4 left-4 text-xs text-slate-500 animate-pulse bg-white/80 px-2 py-1 rounded-full shadow-sm">
                 {activeConversation.name} is typing...
             </div>
         )}
         <div ref={messagesEndRef} />
      </div>

      {pendingAttachments.length > 0 && (
        <div className={cn("px-4 pt-2 border-t flex gap-2 overflow-x-auto shrink-0", theme.surface.default, theme.border.default)}>
          {pendingAttachments.map((att) => (
            <div key={`pending-att-${att.name}-${i}`} className="relative group cursor-pointer" onClick={() => handlePreviewAttachment(att)}>
              <FileAttachment name={att.name} size={typeof att.size === 'number' ? String(att.size) : att.size} type={att.type} className="w-48 shadow-sm"/>
              <button
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); setPendingAttachments(prev => prev.filter((_, idx) => idx !== i)); }}
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

