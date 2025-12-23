/**
 * MobileTimelineOverlay.tsx
 * 
 * Mobile-only slide-in overlay displaying case timeline,
 * animated from right with backdrop blur.
 * 
 * @module components/case-detail/MobileTimelineOverlay
 * @category Case Management - Mobile UI
 */

// External Dependencies
import React from 'react';
import { X } from 'lucide-react';

// Internal Dependencies - Components
import { CaseTimeline } from './CaseTimeline';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../../context/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '../../../utils/cn';

// Types & Interfaces
import { TimelineEvent } from '../../../types';

interface MobileTimelineOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    events: TimelineEvent[];
    onEventClick: (event: TimelineEvent) => void;
}

export const MobileTimelineOverlay: React.FC<MobileTimelineOverlayProps> = ({ isOpen, onClose, events, onEventClick }) => {
    const { theme } = useTheme();
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={onClose}>
            <div className={cn("absolute right-0 top-0 bottom-0 w-80 shadow-2xl p-4 animate-in slide-in-from-right h-full flex flex-col", theme.surface.default)} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className={cn("font-bold", theme.text.primary)}>Case Timeline</h3>
                    <button onClick={onClose} title="Close timeline" className={cn("p-2 rounded-full transition-colors", theme.text.secondary, `hover:${theme.surface.highlight}`)}><X className="h-5 w-5"/></button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <CaseTimeline events={events} onEventClick={onEventClick} />
                </div>
            </div>
        </div>
    );
};
