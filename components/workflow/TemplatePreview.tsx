import React from 'react';
import { Clock, BarChart, ShieldCheck, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { WorkflowTemplateData } from '../../types';

interface TemplatePreviewProps {
  data: WorkflowTemplateData;
  onClick: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ data, onClick }) => {
  const { theme } = useTheme();

  const getComplexityColor = (c: string) => {
    switch (c) {
      case 'Low': return cn(theme.status.success.text, theme.status.success.bg, theme.status.success.border);
      case 'Medium': return cn(theme.status.info.text, theme.status.info.bg, theme.status.info.border);
      case 'High': return cn(theme.status.warning.text, theme.status.warning.bg, theme.status.warning.border);
      default: return theme.text.secondary;
    }
  };

  return (
    <div 
      className={cn(
        "rounded-xl border shadow-sm transition-all cursor-pointer group overflow-hidden flex flex-col h-full",
        theme.surface.default,
        theme.border.default,
        `hover:shadow-md hover:${theme.primary.border}`
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className={cn("p-5 border-b", theme.border.default, theme.surface.highlight)}>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="neutral" className={theme.surface.default}>{data.category}</Badge>
          {data.auditReady && (
            <div className={cn("flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border", theme.status.success.text, theme.status.success.bg, theme.status.success.border)} title="Full Audit Trail Enabled">
              <ShieldCheck className="h-3 w-3 mr-1"/> Audited
            </div>
          )}
        </div>
        <h4 className={cn("font-bold text-lg transition-colors leading-tight", theme.text.primary, `group-hover:${theme.primary.text}`)}>
          {data.title}
        </h4>
        
        <div className={cn("flex items-center gap-4 mt-3 text-xs", theme.text.secondary)}>
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1"/> {data.duration}
          </span>
          <span className={cn("flex items-center px-1.5 py-0.5 rounded border", getComplexityColor(data.complexity))}>
            <BarChart className="h-3 w-3 mr-1"/> {data.complexity}
          </span>
        </div>
      </div>

      {/* Visual Mini-Map */}
      <div className={cn("p-5 flex-1 flex flex-col justify-center", theme.surface.highlight)}>
        <div className="space-y-3 relative">
          <div className={cn("absolute left-3 top-2 bottom-2 w-0.5 -z-10", theme.border.default)}></div>
          {data.stages.slice(0, 4).map((stage, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 border-2",
                theme.surface.default,
                i === 0 ? cn(theme.primary.DEFAULT, theme.text.inverse, "shadow-sm border-transparent") : cn(theme.border.default, theme.text.tertiary)
              )}>
                {i + 1}
              </div>
              <div className={cn("text-xs font-medium px-2 py-1 rounded border shadow-sm flex-1 truncate", theme.surface.default, theme.border.default, theme.text.secondary)}>
                {stage}
              </div>
            </div>
          ))}
          {data.stages.length > 4 && (
            <div className="flex items-center gap-3">
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 border-2", theme.surface.default, theme.border.default)}>
                +
              </div>
              <span className={cn("text-[10px] italic", theme.text.tertiary)}>
                {data.stages.length - 4} more stages
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={cn("p-3 border-t flex justify-between items-center text-xs", theme.surface.default, theme.border.default, theme.text.secondary)}>
        <div className="flex gap-1">
          {data.tags.slice(0, 2).map(tag => (
            <span key={tag} className={cn("px-1.5 py-0.5 rounded text-[10px]", theme.surface.highlight)}>{tag}</span>
          ))}
        </div>
        <span className={cn("flex items-center font-medium transition-colors", `group-hover:${theme.primary.text}`)}>
          Use Template <ArrowRight className="h-3 w-3 ml-1"/>
        </span>
      </div>
    </div>
  );
};
