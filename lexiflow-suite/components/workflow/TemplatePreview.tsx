
import React from 'react';
import { Card } from '../common/Card.tsx';
import { Clock, BarChart, ShieldCheck, ArrowRight, GitBranch, CheckCircle } from 'lucide-react';
import { Badge } from '../common/Badge.tsx';

export interface WorkflowTemplateData {
  id: string;
  title: string;
  category: string;
  complexity: 'Low' | 'Medium' | 'High';
  duration: string;
  tags: string[];
  auditReady: boolean;
  stages: string[];
}

interface TemplatePreviewProps {
  data: WorkflowTemplateData;
  onClick: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ data, onClick }) => {
  const getComplexityColor = (c: string) => {
    switch (c) {
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'High': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-slate-600';
    }
  };

  return (
    <div 
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group overflow-hidden flex flex-col h-full"
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="neutral" className="bg-white">{data.category}</Badge>
          {data.auditReady && (
            <div className="flex items-center text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-100" title="Full Audit Trail Enabled">
              <ShieldCheck className="h-3 w-3 mr-1"/> Audited
            </div>
          )}
        </div>
        <h4 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
          {data.title}
        </h4>
        
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1"/> {data.duration}
          </span>
          <span className={`flex items-center px-1.5 py-0.5 rounded border ${getComplexityColor(data.complexity)}`}>
            <BarChart className="h-3 w-3 mr-1"/> {data.complexity}
          </span>
        </div>
      </div>

      {/* Visual Mini-Map */}
      <div className="p-5 flex-1 flex flex-col justify-center bg-slate-50/30">
        <div className="space-y-3 relative">
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-200 -z-10"></div>
          {data.stages.slice(0, 4).map((stage, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 border-2 border-white ${i === 0 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>
                {i + 1}
              </div>
              <div className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded border border-slate-100 shadow-sm flex-1 truncate">
                {stage}
              </div>
            </div>
          ))}
          {data.stages.length > 4 && (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold z-10 border-2 border-white">
                +
              </div>
              <span className="text-[10px] text-slate-400 italic">
                {data.stages.length - 4} more stages
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 bg-white flex justify-between items-center text-xs text-slate-500">
        <div className="flex gap-1">
          {data.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">{tag}</span>
          ))}
        </div>
        <span className="flex items-center group-hover:text-blue-600 font-medium transition-colors">
          Use Template <ArrowRight className="h-3 w-3 ml-1"/>
        </span>
      </div>
    </div>
  );
};
