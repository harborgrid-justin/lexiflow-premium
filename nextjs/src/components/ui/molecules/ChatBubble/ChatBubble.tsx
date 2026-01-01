/**
 * @module components/common/ChatBubble
 * @category Common
 * @description Chat message bubble with status indicators.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Check, CheckCheck, Shield } from 'lucide-react';
import React, { memo } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Components
import { UserAvatar } from '@/components/ui/atoms/UserAvatar';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface ChatBubbleProps {
  text: string;
  sender: string;
  isMe: boolean;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  isPrivileged?: boolean;
  children?: React.ReactNode;
}

export const ChatBubble = memo(function ChatBubble({ text, sender, isMe, timestamp, status, isPrivileged, children }: ChatBubbleProps) {
  const { theme } = useTheme();

  return (
    <div className={cn("flex w-full group/msg animate-fade-in-up", isMe ? 'justify-end' : 'justify-start')}>
      {!isMe && <UserAvatar name={sender} size="xs" className="mt-1 mr-2 self-start" />}

      <div className={cn("flex flex-col max-w-[85%] md:max-w-[70%]", isMe ? "items-end" : "items-start")}>
        {isPrivileged && (
          <div className={cn("text-[10px] font-bold mb-1 flex items-center px-2 py-0.5 rounded-full border shadow-sm", theme.status.warning.text, theme.status.warning.bg, theme.status.warning.border)}>
            <Shield className="h-3 w-3 mr-1" /> PRIVILEGED
          </div>
        )}

        <div className={cn(
          "p-3 rounded-2xl text-sm shadow-sm relative",
          isMe
            ? cn(theme.primary.DEFAULT, theme.text.inverse, "rounded-tr-none")
            : cn(theme.surface.default, theme.text.primary, theme.border.default, "border rounded-tl-none")
        )}>
          <div className="whitespace-pre-wrap leading-relaxed">{text}</div>

          {children && <div className="mt-3 space-y-2 w-full">{children}</div>}

          <div className={cn(
            "text-[10px] mt-1.5 flex items-center justify-end",
            isMe ? "text-white/80" : theme.text.tertiary
          )}>
            {timestamp}
            {isMe && status && (
              <span className="ml-1" title={status}>
                {status === 'read' ? <CheckCheck className="h-3 w-3" /> : status === 'delivered' ? <CheckCheck className="h-3 w-3 opacity-70" /> : <Check className="h-3 w-3" />}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
ChatBubble.displayName = 'ChatBubble';
