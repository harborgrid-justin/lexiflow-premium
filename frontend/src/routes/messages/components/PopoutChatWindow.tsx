import { useNotify } from '@/hooks/useNotify';
import { Attachment, Conversation } from '@/hooks/useSecureMessenger';
import { DataService } from '@/services/data/data-service.service';
import { useState } from 'react';
import { MessengerChatWindow } from './MessengerChatWindow';

interface PopoutChatWindowProps {
  conversation: Conversation;
  formatTime: (iso: string) => string;
}

export function PopoutChatWindow({ conversation, formatTime }: PopoutChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isPrivilegedMode, setIsPrivilegedMode] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation>(conversation);
  const notify = useNotify();

  const handleSendMessage = async () => {
    if (!inputText.trim() && pendingAttachments.length === 0) return;

    const newMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      content: inputText,
      timestamp: new Date().toISOString(),
      status: 'sent' as const,
      attachments: pendingAttachments,
      isPrivileged: isPrivilegedMode,
    };

    // Optimistic update
    setActiveConversation(prev => ({
      ...prev,
      messages: [...prev.messages, { ...newMessage, text: newMessage.content }]
    }));

    try {
      // DataService.messenger is a Promise because of dynamic import
      const messengerService = await DataService.messenger;
      await messengerService.sendMessage({
        conversationId: conversation.id,
        body: inputText,
        attachments: pendingAttachments
      });

      setInputText('');
      setPendingAttachments([]);

      // Simulate delivery status update
      setTimeout(() => {
        setActiveConversation(prev => ({
          ...prev,
          messages: prev.messages.map(m =>
            m.id === newMessage.id ? { ...m, status: 'delivered' } : m
          )
        }));
      }, 1000);

    } catch (error) {
      console.error("Failed to send message:", error);
      notify.error("Failed to send message");
      // Revert optimistic update if needed
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) {
        const newAtt: Attachment = {
          name: file.name,
          type: file.type.includes('image') ? 'image' : 'doc',
          size: '1.2 MB', // In a real app, calculate this
        };
        setPendingAttachments(prev => [...prev, newAtt]);
      }
    }
  };

  return (
    <MessengerChatWindow
      activeConversation={activeConversation}
      activeConvId={activeConversation.id}
      setActiveConvId={() => { }} // No-op
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
  );
};
