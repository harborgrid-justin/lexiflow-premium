import React from 'react';
import { FileCode, Plus, Edit, Copy, MoreVertical } from 'lucide-react';
import { DraftingTemplate } from '@api/domains/drafting.api';

interface TemplateGalleryProps {
  templates: DraftingTemplate[];
  onSelect: (template: DraftingTemplate) => void;
  onEdit?: (template: DraftingTemplate) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ templates, onSelect, onEdit }) => {
  // Safeguard: ensure templates is an array
  const templatesList = Array.isArray(templates) ? templates : [];

  if (templatesList.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        No templates available.
      </div>
    );
  }

  const handleEdit = (e: React.MouseEvent, template: DraftingTemplate) => {
    e.stopPropagation();
    onEdit?.(template);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {templatesList.map((template) => (
        <div 
          key={template.id} 
          className="group relative bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer"
          onClick={() => onSelect(template)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm group-hover:shadow-md transition-shadow">
                <FileCode className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {template.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {template.description || 'No description'}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    {template.category}
                  </span>
                  {template.jurisdiction && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                      {template.jurisdiction}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Used {template.usageCount} times
                  </span>
                </div>
              </div>
            </div>
            {onEdit && (
              <button
                onClick={(e) => handleEdit(e, template)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Edit template"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

