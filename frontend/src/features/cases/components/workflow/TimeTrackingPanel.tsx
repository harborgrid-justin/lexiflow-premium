import { Play, Pause, StopCircle, Clock } from 'lucide-react';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { useTimeTracker } from '@/hooks/useTimeTracker';

// ============================================================================
// TYPES
// ============================================================================
interface TimerDisplayProps {
  isActive: boolean;
  formattedTime: string;
  theme: ReturnType<typeof useTheme>['theme'];
}

interface TimerControlsProps {
  isActive: boolean;
  seconds: number;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

// ============================================================================
// PRESENTATION COMPONENTS
// ============================================================================

/**
 * TimerDisplay - Shows the current timer status and time
 */
const TimerDisplay = ({ isActive, formattedTime, theme }: TimerDisplayProps) => (
  <div className="flex items-center gap-3">
    <div className={cn("p-2 rounded-full", isActive ? "animate-pulse bg-green-100 text-green-600" : theme.primary.light)}>
      <Clock className={cn("h-5 w-5", isActive ? "text-green-600" : theme.primary.text)} />
    </div>
    <div>
      <p className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Active Task Timer</p>
      <p className={cn("text-xl font-mono font-bold tracking-wider", theme.text.primary)}>{formattedTime}</p>
    </div>
  </div>
);

/**
 * TimerControls - Play, pause, and stop buttons
 */
const TimerControls = ({ isActive, seconds, onStart, onPause, onStop }: TimerControlsProps) => (
  <div className="flex gap-2">
    {!isActive ? (
      <button 
        onClick={onStart}
        className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors text-white"
        aria-label="Start timer"
      >
        <Play className="h-5 w-5 fill-current" />
      </button>
    ) : (
      <button 
        onClick={onPause}
        className="p-2 bg-amber-600 hover:bg-amber-700 rounded-full transition-colors text-white"
        aria-label="Pause timer"
      >
        <Pause className="h-5 w-5 fill-current" />
      </button>
    )}
    {seconds > 0 && !isActive && (
      <button 
        onClick={onStop}
        className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors text-white"
        aria-label="Stop and save"
      >
        <StopCircle className="h-5 w-5 fill-current" />
      </button>
    )}
  </div>
);

// ============================================================================
// CONTAINER COMPONENT
// ============================================================================

/**
 * TimeTrackingPanel - Container component for time tracking
 * 
 * Uses useTimeTracker hook for all business logic and state management
 * Composed of TimerDisplay and TimerControls presentation components
 */
export const TimeTrackingPanel = () => {
  const { theme } = useTheme();
  const { isActive, seconds, formattedTime, start, pause, stop } = useTimeTracker();

  return (
    <div className={cn("rounded-lg p-4 shadow-md flex items-center justify-between border", theme.surface.default, theme.border.default)}>
      <TimerDisplay isActive={isActive} formattedTime={formattedTime} theme={theme} />
      <TimerControls 
        isActive={isActive} 
        seconds={seconds} 
        onStart={start} 
        onPause={pause} 
        onStop={stop} 
      />
    </div>
  );
};
