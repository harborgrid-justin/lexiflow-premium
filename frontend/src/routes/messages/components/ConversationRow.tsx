import { UserAvatar } from '@/components/atoms/UserAvatar/UserAvatar';
import { useTheme } from "@/hooks/useTheme";
import { Conversation } from '@/hooks/useSecureMessenger';
import { cn } from '@/lib/cn';
import { Briefcase, ExternalLink } from 'lucide-react';
interface ConversationRowProps {
  conv: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onPopOut: (e: React.MouseEvent) => void;
  formatTime: (iso: string) => string;
}

export function ConversationRow({ conv, isActive, onSelect, onPopOut, formatTime }: ConversationRowProps) {
  const { theme } = useTheme();
  const lastMsg = conv.messages[conv.messages.length - 1];

  return (
    <div
      style={{ height: 88 }}
      onClick={onSelect}
      className={cn(
        "p-4 border-b border-l-4 cursor-pointer transition-all group flex flex-col justify-center",
        theme.border.default,
        isActive
          ? cn(theme.surface.default, "border-l-blue-600 shadow-sm")
          : cn("bg-transparent border-l-transparent", `hover:${theme.surface.highlight}`)
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center space-x-3 overflow-hidden">
          <UserAvatar name={conv.name} size="md" indicatorStatus={conv.status as 'online' | 'offline' | 'busy' | 'away'} />
          <div className="min-w-0">
            <h4 className={cn("text-sm font-bold truncate", conv.unread > 0 ? theme.text.primary : theme.text.secondary)}>{conv.name}</h4>
            <p className={cn("text-xs truncate flex items-center", theme.text.tertiary)}>
              {conv.isExternal && <Briefcase className="h-3 w-3 mr-1 text-amber-500" />}
              {conv.role}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] whitespace-nowrap ml-2", theme.text.tertiary)}>{formatTime(lastMsg?.timestamp || '')}</span>
          <button
            onClick={onPopOut}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-blue-600"
            title="Pop Out Chat"
          >
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center pl-12">
        <p className={cn(
          "text-sm truncate max-w-[180px]",
          conv.draft ? "text-rose-500 italic" : (conv.unread > 0 ? theme.text.primary : theme.text.secondary)
        )}>
          {conv.draft ? `Draft: ${conv.draft}` : lastMsg?.text}
        </p>
        {conv.unread > 0 && (
          <span className="h-5 w-5 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
            {conv.unread}
          </span>
        )}
      </div>
    </div>
  );
}
