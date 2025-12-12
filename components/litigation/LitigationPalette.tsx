
import React from 'react';
import { 
    X, GripVertical, Gavel, Scale, FileText, AlertTriangle, Flag, Mic2, Search, Users, 
    MessageSquare, ScrollText, Milestone, ClipboardCheck, ArrowUpRightSquare 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface LitigationPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LitigationPalette: React.FC<LitigationPaletteProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();

  const handleDragStart = (e: React.DragEvent, type: string, litType: string) => {
    e.dataTransfer.setData('application/reactflow', type); // Base type for engine
    e.dataTransfer.setData('application/litigation-node', litType); // Specific metadata
    e.dataTransfer.effectAllowed = 'move';
  };

  const sections = [
      {
          title: 'Macro Phases (Boundaries)',
          items: [
              { label: 'Pleading Phase', type: 'Phase', icon: FileText, desc: 'Complaint to Answer' },
              { label: 'Discovery Phase', type: 'Phase', icon: Search, desc: 'Fact & Expert Discovery' },
              { label: 'Pre-Trial Phase', type: 'Phase', icon: Scale, desc: 'Dispositive Motions' },
              { label: 'Trial Phase', type: 'Phase', icon: Gavel, desc: 'Voir Dire to Verdict' },
          ]
      },
       {
          title: 'Case Milestones & Events',
          items: [
              { label: 'Complaint Filed', type: 'Start', icon: Milestone, desc: 'Initiation of Lawsuit' },
              { label: 'Answer Due', type: 'Event', icon: Milestone, desc: 'Deadline for Response' },
              { label: 'Discovery Cutoff', type: 'Event', icon: Milestone, desc: 'End of Discovery Period' },
              { label: 'Trial Date', type: 'Event', icon: Gavel, desc: 'Scheduled Trial Start' },
          ]
      },
      {
          title: 'Dispositive Motions',
          items: [
              { label: 'Rule 12(b)(6)', type: 'Decision', icon: Scale, desc: 'Motion to Dismiss' },
              { label: 'Rule 56', type: 'Decision', icon: FileText, desc: 'Summary Judgment' },
              { label: 'Rule 12(c)', type: 'Decision', icon: FileText, desc: 'Judgment on Pleadings' },
              { label: 'Rule 11', type: 'Decision', icon: AlertTriangle, desc: 'Sanctions Motion' },
          ]
      },
      {
          title: 'Discovery & Procedural Tools',
          items: [
              { label: 'Rule 26(f) Conference', type: 'Task', icon: ClipboardCheck, desc: 'Initial Discovery Plan' },
              { label: 'Deposition', type: 'Task', icon: Mic2, desc: 'Oral Testimony' },
              { label: 'Interrogatories', type: 'Task', icon: FileText, desc: 'Written Questions' },
              { label: 'Request for Admission', type: 'Task', icon: ClipboardCheck, desc: 'Fact Admissions' },
              { label: 'Subpoena', type: 'Task', icon: ScrollText, desc: 'Third-Party Discovery' },
          ]
      },
      {
          title: 'ADR & Settlement',
          items: [
              { label: 'Mediation', type: 'Event', icon: MessageSquare, desc: 'Third-party resolution' },
              { label: 'Settlement Conf', type: 'Event', icon: Users, desc: 'Judicial Conference' },
              { label: 'Offer of Judgment', type: 'Decision', icon: FileText, desc: 'Rule 68 Offer' },
          ]
      },
      {
          title: 'Trial & Post-Trial',
          items: [
              { label: 'Motion in Limine', type: 'Decision', icon: Gavel, desc: 'Exclude Evidence' },
              { label: 'Rule 50', type: 'Decision', icon: AlertTriangle, desc: 'Directed Verdict' },
              { label: 'Rule 59', type: 'Decision', icon: Flag, desc: 'Motion for New Trial' },
          ]
      },
      {
          title: 'Appellate Procedure',
          items: [
              { label: 'Notice of Appeal', type: 'End', icon: ArrowUpRightSquare, desc: 'Initiate Appeal' },
              { label: 'Appellant\'s Brief', type: 'Task', icon: FileText, desc: 'Opening Brief' },
              { label: 'Appellee\'s Brief', type: 'Task', icon: FileText, desc: 'Response Brief' },
              { label: 'Oral Argument', type: 'Event', icon: Mic2, desc: 'Appellate Hearing' },
          ]
      }
  ];

  return (
    <div className={cn(
      "absolute md:static inset-y-0 left-0 w-72 border-r z-10 transition-transform duration-300 shadow-xl md:shadow-none flex flex-col",
      theme.surface.default,
      theme.border.default,
      isOpen ? 'translate-x-0' : '-translate-x-full md:w-0 md:overflow-hidden'
    )}>
      <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default)}>
          <h4 className={cn("font-bold text-sm uppercase tracking-wider", theme.text.primary)}>Strategy Toolkit</h4>
          <button onClick={onClose} className="md:hidden"><X className={cn("h-4 w-4", theme.text.tertiary)}/></button>
      </div>

      <div className="p-4 h-full flex flex-col overflow-y-auto custom-scrollbar">
        <div className="space-y-6">
            {sections.map((section, idx) => (
                <div key={idx}>
                    <h5 className={cn("text-[10px] font-bold uppercase tracking-wide mb-3 pl-1", theme.text.tertiary)}>{section.title}</h5>
                    <div className="space-y-2">
                        {section.items.map(item => (
                            <div 
                                key={item.label}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item.type, item.label)}
                                className={cn(
                                    "flex items-center gap-3 p-3 border rounded-lg cursor-grab active:cursor-grabbing hover:shadow-md transition-all group",
                                    theme.surface.default,
                                    theme.border.default,
                                    `hover:${theme.primary.border}`
                                )}
                            >
                                <GripVertical className={cn("h-4 w-4 text-slate-300 group-hover:text-slate-400")} />
                                <div className={cn("p-1.5 rounded-md", 
                                    item.type === 'Phase' ? "bg-indigo-100 text-indigo-600" :
                                    item.type === 'Decision' ? "bg-purple-100 text-purple-600" :
                                    item.type === 'End' ? "bg-red-100 text-red-600" :
                                    "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                )}>
                                    <item.icon className="h-4 w-4"/>
                                </div>
                                <div>
                                    <span className={cn("text-xs font-bold block", theme.text.primary)}>{item.label}</span>
                                    <span className={cn("text-[9px] block", theme.text.tertiary)}>{item.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
