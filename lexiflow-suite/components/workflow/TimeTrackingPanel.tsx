
import React, { useState, useEffect } from 'react';
import { Play, Pause, StopCircle, Clock } from 'lucide-react';
import { Button } from '../common/Button.tsx';

export const TimeTrackingPanel: React.FC = () => {
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

  return (
    <div className="bg-slate-900 text-white rounded-lg p-4 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-slate-800 p-2 rounded-full animate-pulse">
          <Clock className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase">Active Task Timer</p>
          <p className="text-xl font-mono font-bold tracking-wider">{formatTime(seconds)}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {!isActive ? (
          <button 
            onClick={() => setIsActive(true)}
            className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
          >
            <Play className="h-5 w-5 fill-current" />
          </button>
        ) : (
          <button 
            onClick={() => setIsActive(false)}
            className="p-2 bg-amber-600 hover:bg-amber-700 rounded-full transition-colors"
          >
            <Pause className="h-5 w-5 fill-current" />
          </button>
        )}
        {seconds > 0 && !isActive && (
          <button 
            onClick={() => { setSeconds(0); setIsActive(false); alert("Time logged to billing."); }}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          >
            <StopCircle className="h-5 w-5 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
};
