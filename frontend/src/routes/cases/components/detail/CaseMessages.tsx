/**
 * CaseMessages.tsx
 *
 * Case-specific messaging interface with privilege indicators, attachments,
 * and session-persisted draft messages.
 *
 * @module components/case-detail/CaseMessages
 * @category Case Management - Communications
 */

// External Dependencies
import { Send, Paperclip, Lock, Shield, FileText, Loader2 } from 'lucide-react';

// Internal Dependencies - Components
import { Button } from '@/components/atoms/Button';
import { UserAvatar } from '@/components/atoms/UserAvatar/UserAvatar';

// Internal Dependencies - Hooks & Context
import { useTheme } from "@/hooks/useTheme";
import { useQuery } from '@/hooks/useQueryHooks';
import { useSessionStorage } from '@/hooks/useSessionStorage';

// Internal Dependencies - Services & Utils
import { DataService } from '@/services/data/data-service.service';
// ✅ Migrated to backend API (2025-12-21)
import { cn } from '@/lib/cn';

// Types & Interfaces
import { Case, Conversation, Message, User } from '@/types';

interface CaseMessagesProps {
  caseData: Case;
}

export const CaseMessages: React.FC<CaseMessagesProps> = ({ caseData }) => {
  const { theme } = useTheme();

  const conversationId = `conv-case-${caseData.id}`;

  // Persist draft in session storage
  const [inputText, setInputText] = useSessionStorage<string>(`draft-msg-${conversationId}`, '');

  // Enterprise Data Fetching
  const { data: conversation, isLoading: isLoadingConversation } = useQuery<Conversation | undefined>(
    ['conversations', conversationId],
    () => DataService.messenger.getConversationById(conversationId)
  );

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>(
    ['users', 'all'],
    DataService.users.getAll
  );

  const messages = conversation?.messages || [];
  const isLoading = isLoadingConversation || isLoadingUsers;

  const handleSend = () => {
    if (!inputText.trim()) return;
    // In a real app, this would be a mutation
    // setMessages([...messages, newMsg]);
    setInputText('');
  };

  if (isLoading) {
      return <div className="flex items-center justify-center h-full"><Loader2 className={cn("animate-spin", theme.text.link)}/></div>
  }

  if (!conversation) {
      return <div className="text-center p-8 text-slate-500">No communication thread found for this case.</div>
  }

  return (
    <div className={cn("flex flex-col h-[500px] md:h-[600px] max-h-[80vh] rounded-lg shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
      {/* Thread Header */}
      <div className={cn("p-4 border-b flex justify-between items-center shrink-0", theme.border.default, theme.surface.highlight)}>
        <div>
          <h3 className={cn("font-bold flex items-center gap-2", theme.text.primary)}>
            <Lock className={cn("h-4 w-4", theme.text.link)}/> Case Communication Thread
          </h3>
          <p className={cn("text-xs", theme.text.secondary)}>Participants: Firm Staff, Client ({caseData.client})</p>
        </div>
        <div className={cn("text-xs px-3 py-1 rounded-full flex items-center font-semibold border", theme.status.warning.bg, theme.status.warning.text, theme.status.warning.border)}>
           <Shield className="h-3 w-3 mr-1"/> Attorney-Client Privileged
        </div>
      </div>

      {/* Messages Area */}
      <div className={cn("flex-1 overflow-y-auto p-6 space-y-6", theme.surface.highlight)}>
        {messages.map((msg: Message) => {
          const isMe = msg.senderId === 'me';
          const user = users.find(u => u.id === msg.senderId);
          const senderName = user ? user.name : isMe ? 'Me' : 'Unknown';
          const senderRole = user ? user.role : isMe ? 'Attorney' : 'Unknown';
          return (
            <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
              <UserAvatar name={senderName} className="mt-1 shrink-0"/>
              <div className={`max-w-[75%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col min-w-0`}>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                   <span className={cn("text-xs font-bold", theme.text.primary)}>{senderName}</span>
                   <span className={cn("text-xs", theme.text.tertiary)}>{senderRole} • {new Date(msg.timestamp).toLocaleString()}</span>
                </div>
                <div className={cn(
                    "p-4 rounded-2xl text-sm shadow-sm relative break-words whitespace-pre-wrap w-full",
                    isMe
                        ? cn(theme.primary.DEFAULT, theme.text.inverse, "rounded-tr-none")
                        : cn(theme.surface.default, theme.text.primary, theme.border.default, "border rounded-tl-none")
                )}>
                   {msg.text}
                   {msg.attachments && (
                     <div className="mt-3 space-y-1">
                       {msg.attachments.map((att: unknown) => {
                         const attName = typeof att === 'object' && att !== null && 'name' in att ? String(att.name) : 'Unknown file';
                         return (
                           <div key={attName} className="flex items-center p-2 bg-black/10 rounded text-xs font-medium">
                              <FileText className="h-3 w-3 mr-2"/> {attName}
                           </div>
                         );
                       })}
                     </div>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className={cn("p-4 border-t shrink-0", theme.surface.default, theme.border.default)}>
         <div className="flex items-center gap-3">
            <button
              className={cn("p-2 rounded-full transition-colors", theme.text.tertiary, `hover:${theme.surface.highlight}`, `hover:${theme.primary.text}`)}
              aria-label="Attach file"
              title="Attach file"
            >
                <Paperclip className="h-5 w-5"/>
            </button>
            <div className="flex-1 relative">
                <input
                  className={cn("w-full border-none rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none", theme.surface.highlight, theme.text.primary)}
                  placeholder="Type a secure message..."
                  value={inputText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
            </div>
            <Button variant="primary" className="rounded-full px-4" onClick={handleSend}>
                <Send className="h-4 w-4 mr-2"/> Send
            </Button>
         </div>
         <p className={cn("text-center text-[10px] mt-2", theme.text.tertiary)}>
            Messages are end-to-end encrypted. Do not share credentials.
         </p>
      </div>
    </div>
  );
};


