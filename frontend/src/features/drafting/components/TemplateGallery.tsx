import React from 'react';
import { FileCode, Plus } from 'lucide-react';
import { LegalDocument } from '../../../types/models';

interface TemplateGalleryProps {
  templates: LegalDocument[];
  onSelect: (template: LegalDocument) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ templates, onSelect }) => {
  if (templates.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        No templates available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {templates.map((template) => (
        <div 
          key={template.id} 
          className="group relative bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer"
          onClick={() => onSelect(template)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm group-hover:shadow-md transition-shadow">
                <FileCode className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {template.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {template.description || 'Standard Template'}
                </p>
              </div>
            </div>
            <Plus className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ))}
    </div>
  );
};
