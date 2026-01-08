import { Attachment, Conversation } from '@/hooks/useSecureMessenger';
import React from 'react';
import { MessengerChatWindow } from './MessengerChatWindow';

interface PoppedOutChatWrapperProps {
  conversation: Conversation;
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  onAttachFile: (files: File[]) => void;
  formatTime: (iso: string) => string;
}

export const PoppedOutChatWrapper: React.FC<PoppedOutChatWrapperProps> = ({
  conversation, onSendMessage, formatTime
}) => {
  const [text, setText] = React.useState("");
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [isPrivileged, setIsPrivileged] = React.useState(false);

  const handleSend = () => {
    onSendMessage(text, attachments);
    setText("");
    setAttachments([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert to attachment format locally for preview
      const file = e.target.files[0];
      if (!file) return;

      const newAtt: Attachment = {
        name: file.name,
        type: file.type.includes("image") ? "image" : "doc",
        size: "1.2 MB" // Simplified for now
      };
      setAttachments(prev => [...prev, newAtt]);

      // Optionally notify parent if needed, but popped out is isolated usually
      // onAttachFile([file]);
    }
  };

  return (
    <MessengerChatWindow
      activeConversation={conversation}
      activeConvId={conversation.id}
      setActiveConvId={() => { }}
      inputText={text}
      setInputText={setText}
      pendingAttachments={attachments}
      setPendingAttachments={setAttachments}
      isPrivilegedMode={isPrivileged}
      setIsPrivilegedMode={setIsPrivileged}
      handleSendMessage={handleSend}
      handleFileSelect={handleFileSelect}
      formatTime={formatTime}
    />
  );
};
