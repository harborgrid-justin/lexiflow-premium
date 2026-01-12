import { Archive } from 'lucide-react';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';

export function MessengerArchived() {
  const { theme } = useTheme();

  return (
    <div className={cn("w-full h-full flex flex-col items-center justify-center p-12", theme.text.tertiary)}>
      <div className={cn("p-4 rounded-full mb-4", theme.surface.highlight)}>
        <Archive className="h-12 w-12 opacity-50"/>
      </div>
      <h3 className={cn("text-lg font-medium", theme.text.secondary)}>Archived Conversations</h3>
      <p className="text-sm mt-2">No archived threads found in the last 90 days.</p>
    </div>
  );
}
