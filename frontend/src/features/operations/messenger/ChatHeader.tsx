/**
 * @module components/messenger/ChatHeader
 * @category Messenger
 * @description Chat header with contact info and actions.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AlertTriangle, ArrowLeft, Info, Lock, Phone, Video } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { Conversation } from '@/hooks/useSecureMessenger';
import { useTheme } from '@/features/theme';

// Components
import { Button } from '@/shared/ui/atoms/Button/Button';
import { UserAvatar } from '@/shared/ui/atoms/UserAvatar/UserAvatar';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface ChatHeaderProps {
  /** Current conversation. */
  conversation: Conversation;
  /** Callback to go back. */
  onBack: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
  const { theme } = useTheme();

  return (
    <div className={cn("h-16 px-4 md:px-6 border-b flex justify-between items-center shadow-sm z-10 relative shrink-0", theme.surface.default, theme.border.default)}>
      <div className="flex items-center gap-3 overflow-hidden">
        <button onClick={onBack} className={cn("md:hidden p-2 -ml-2 rounded-full", theme.text.secondary, `hover:${theme.surface.highlight}`)}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <UserAvatar name={conversation.name} size="md" />
        <div className="min-w-0">
          <h3 className={cn("font-bold flex items-center truncate text-sm md:text-base", theme.text.primary)}>
            {conversation.name}
            {conversation.isExternal && <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded border border-amber-200 uppercase tracking-wide font-bold hidden sm:inline-block">External</span>}
          </h3>
          <div className="flex items-center text-xs text-emerald-600 font-medium truncate">
            <Lock className="h-3 w-3 mr-1" /> <span className="hidden sm:inline">End-to-End</span> Encrypted
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 md:gap-2">
        <Button variant="ghost" size="sm" className="px-2" icon={Phone} />
        <Button variant="ghost" size="sm" className="px-2" icon={Video} />
        <Button variant="ghost" size="sm" className="px-2" icon={Info} />
      </div>

      {conversation.isExternal && (
        <div className={cn("absolute top-full left-0 right-0 border-b px-4 py-1 flex justify-center items-center text-[10px] font-medium z-0", theme.status.warning.bg, theme.status.warning.border, theme.status.warning.text)}>
          <AlertTriangle className="h-3 w-3 mr-2" />
          External Recipient. Do not share credentials.
        </div>
      )}
    </div>
  );
}
