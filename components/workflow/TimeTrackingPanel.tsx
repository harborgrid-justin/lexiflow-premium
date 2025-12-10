import React, { useState, useEffect } from 'react';
import { Play, Pause, StopCircle, Clock } from 'lucide-react';
import { Button } from '../common/Button';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { TimeEntry, UUID, CaseId, UserId } from '../../types';
import { useNotify } from '../../hooks/useNotify';

export const TimeTrackingPanel: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStop = async () => {
      if (seconds < 60) {
          setSeconds(0);
          setIsActive(false);
          notify.info("Time entry ignored (less than 1 minute).");
          return;
      }
      
      const durationMinutes = Math.ceil(seconds / 60);
      const entry: TimeEntry = {
          id: `t-${Date.now()}` as UUID,
          caseId: 'General' as CaseId,
          userId: 'current-user' as UserId,
          date: new Date().toISOString().split('T')[0],
          duration: durationMinutes,
          description: 'General Administrative Task (Auto-Logged)',
          rate: 450,
          total: (durationMinutes / 60) * 450,
          status: 'Unbilled'
      };

      await DataService.billing.addTimeEntry(entry);
      setSeconds(0);
      setIsActive(false);
      notify.success(`Logged ${durationMinutes} minutes to Billing.`);
  };

  return (
    <div className={cn("rounded-lg p-4 shadow-md flex items-center justify-between border", theme.surface, theme.border.default)}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-full", isActive ? "animate-pulse bg-green-100 text-green-600" : theme.primary.light)}>
          <Clock className={cn("h-5 w-5", isActive ? "text-green-600" : theme.primary.text)} />
        </div>
        <div>
          <p className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Active Task Timer</p>
          <p className={cn("text-xl font-mono font-bold tracking-wider", theme.text.primary)}>{formatTime(seconds)}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {!isActive ? (
          <button 
            onClick={() => setIsActive(true)}
            className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors text-white"
          >
            <Play className="h-5 w-5 fill-current" />
          </button>
        ) : (
          <button 
            onClick={() => setIsActive(false)}
            className="p-2 bg-amber-600 hover:bg-amber-700 rounded-full transition-colors text-white"
          >
            <Pause className="h-5 w-5 fill-current" />
          </button>
        )}
        {seconds > 0 && !isActive && (
          <button 
            onClick={handleStop}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors text-white"
          >
            <StopCircle className="h-5 w-5 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
};