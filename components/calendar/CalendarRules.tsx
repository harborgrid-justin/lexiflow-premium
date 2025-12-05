
import React from 'react';
import { Settings, Book, Check, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';

export const CalendarRules: React.FC = () => {
  const { theme } = useTheme();

  // Enterprise Data Access
  const { data: rules = [], isLoading } = useQuery<string[]>(
      ['calendar', 'rulesets'],
      DataService.calendar.getActiveRuleSets
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <div className={cn("p-6 rounded-lg border shadow-sm", theme.surface, theme.border.default)}>
        <h3 className={cn("font-bold mb-4 flex items-center", theme.text.primary)}>
            <Book className={cn("h-5 w-5 mr-2", theme.primary.text)}/> Active Rule Sets
        </h3>
        {isLoading ? (
            <div className="py-4 flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-blue-600"/></div>
        ) : (
            <div className="space-y-3">
            {rules.map((rule, i) => (
                <div key={i} className={cn("flex items-center justify-between p-3 rounded border transition-colors", theme.surfaceHighlight, theme.border.default, `hover:${theme.border.light}`)}>
                <span className={cn("text-sm font-medium", theme.text.secondary)}>{rule}</span>
                <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-white"/>
                </div>
                </div>
            ))}
            {rules.length === 0 && <p className="text-sm text-slate-400 italic">No rule sets configured.</p>}
            </div>
        )}
        <button className={cn("mt-4 text-sm font-medium hover:underline", theme.primary.text)}>+ Add Jurisdiction</button>
      </div>

      <div className={cn("p-6 rounded-lg border shadow-sm", theme.surface, theme.border.default)}>
        <h3 className={cn("font-bold mb-4 flex items-center", theme.text.primary)}>
            <Settings className={cn("h-5 w-5 mr-2", theme.text.secondary)}/> Automation Triggers
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 rounded text-blue-600 focus:ring-blue-500" defaultChecked readOnly/>
            <div>
              <p className={cn("text-sm font-bold", theme.text.primary)}>Trial Date Set</p>
              <p className={cn("text-xs", theme.text.secondary)}>Auto-calculate discovery cutoff (30 days prior) and expert disclosure (50 days prior).</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 rounded text-blue-600 focus:ring-blue-500" defaultChecked readOnly/>
            <div>
              <p className={cn("text-sm font-bold", theme.text.primary)}>Motion Filed</p>
              <p className={cn("text-xs", theme.text.secondary)}>Auto-schedule Opposition Due (14 days before hearing) and Reply Due (5 days before).</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 rounded text-blue-600 focus:ring-blue-500" defaultChecked readOnly/>
            <div>
              <p className={cn("text-sm font-bold", theme.text.primary)}>Deposition Scheduled</p>
              <p className={cn("text-xs", theme.text.secondary)}>Remind court reporter 24h prior.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
