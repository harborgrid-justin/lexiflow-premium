
import React, { useTransition } from 'react';
import { TimelineEvent } from '../../types.ts';
import { 
  FileText, CheckCircle, DollarSign, Flag, 
  Gavel, Calendar, Clock, ArrowUpRight 
} from 'lucide-react';
import { TimelineItem } from '../common/TimelineItem.tsx';

interface CaseTimelineProps {
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}

export const CaseTimeline: React.FC<CaseTimelineProps> = ({ events, onEventClick }) => {
  const [isPending, startTransition] = useTransition();

  const handleEventClick = (event: TimelineEvent) => {
      if (onEventClick) {
          startTransition(() => {
              onEventClick(event);
          });
      }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText size={16} />;
      case 'task': return <CheckCircle size={16} />;
      case 'billing': return <DollarSign size={16} />;
      case 'milestone': return <Flag size={16} />;
      case 'motion': return <Gavel size={16} />;
      case 'hearing': return <Calendar size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-500';
      case 'task': return 'bg-emerald-500';
      case 'billing': return 'bg-amber-500';
      case 'milestone': return 'bg-indigo-600';
      case 'motion': return 'bg-slate-700';
      case 'hearing': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <section className={`flex flex-col transition-opacity duration-300 ${isPending ? 'opacity-60' : 'opacity-100'}`} aria-label="Case Timeline">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
        <div>
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-[0.2em]">Matter Chronology</h3>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Historical audit trail</p>
        </div>
        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all hover:text-blue-600" aria-label="Expand Timeline">
            <ArrowUpRight size={14}/>
        </button>
      </div>
      
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-300">
            <Calendar className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-xs font-medium italic">No events recorded.</p>
        </div>
      ) : (
        <ol className="relative pl-1 list-none m-0 p-0">
          {events.map((event, idx) => (
            <li key={event.id}>
              <TimelineItem 
                date={event.date}
                title={event.title}
                description={event.description}
                icon={getIcon(event.type)}
                colorClass={getColor(event.type)}
                onClick={onEventClick ? () => handleEventClick(event) : undefined}
                isLast={idx === events.length - 1}
              />
            </li>
          ))}
        </ol>
      )}

      <button className="w-full py-3 mt-4 text-[11px] font-semibold uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-dashed border-slate-200 hover:border-blue-200">
          Load Historical Archive
      </button>
    </section>
  );
};
