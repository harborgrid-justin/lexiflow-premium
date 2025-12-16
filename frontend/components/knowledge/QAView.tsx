/**
 * @module components/knowledge/QAView
 * @category Knowledge
 * @description Q&A forum with verified answers.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { MessageCircle, ThumbsUp } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { queryKeys } from '../../utils/queryKeys';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { Button } from '../common/Button';

// Utils & Constants
import { cn } from '../../utils/cn';

// Types
import { QAItem } from '../../types';

// ============================================================================
// COMPONENT
// ============================================================================

export const QAView: React.FC = () => {
  const { theme } = useTheme();
  
  // Enterprise Data Access
  const { data: qaItems = [] } = useQuery<QAItem[]>(
      [STORES.QA, 'all'],
      DataService.knowledge.getQA
  );

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <div className={cn("p-6 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
        <h3 className={cn("font-bold text-lg mb-2", theme.text.primary)}>Ask the Firm</h3>
        <p className={cn("text-sm mb-4", theme.text.secondary)}>Post a question to the firm-wide knowledge base. Experts will be notified.</p>
        <div className="flex gap-2">
            <input 
                className={cn("flex-1 px-4 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500", theme.surface.highlight, theme.border.default, theme.text.primary)}
                placeholder="Type your question..."
            />
            <Button variant="primary">Ask Question</Button>
        </div>
      </div>

      <div className="space-y-4">
        {qaItems.map(item => (
            <div key={item.id} className={cn("p-6 rounded-lg border shadow-sm transition-all", theme.surface.default, theme.border.default)}>
                <div className="flex justify-between items-start mb-4">
                    <h4 className={cn("font-bold text-lg flex items-start gap-3", theme.text.primary)}>
                        <MessageCircle className={cn("h-6 w-6 mt-0.5", theme.primary.text)}/>
                        {item.question}
                    </h4>
                </div>
                
                <div className="flex items-center gap-2 text-xs mb-6 pl-9">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", theme.surface.highlight, theme.text.secondary)}>JD</div>
                    <span className={theme.text.secondary}>{item.asker} • {item.time}</span>
                </div>

                <div className={cn("ml-9 p-4 rounded-lg border-l-4", theme.surface.highlight, theme.status.success.border)}>
                    <p className={cn("text-sm leading-relaxed mb-3", theme.text.primary)}>
                        {item.answer}
                    </p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {item.verified && <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", theme.status.success.bg, theme.status.success.text)}>Verified Answer</span>}
                            <span className={cn("text-xs", theme.text.secondary)}>by {item.answerer} ({item.role})</span>
                        </div>
                        <button className={cn("flex items-center gap-1 text-xs hover:text-blue-600 transition-colors", theme.text.tertiary)}>
                            <ThumbsUp className="h-3 w-3"/> Helpful
                        </button>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
