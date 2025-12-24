
import React from 'react';
import { Type, Layout, List, PenTool, Hash, GripVertical, FileText } from 'lucide-react';
import { useTheme } from '../../../../providers/ThemeContext';
import { cn } from '@/utils/cn';

interface SidebarLibraryProps {
  onAddSection: (type: string) => void;
}

export const SidebarLibrary: React.FC<SidebarLibraryProps> = ({ onAddSection }) => {
  const { theme } = useTheme();

  const items = [
      { type: 'Heading', icon: Type, label: 'Section Header' },
      { type: 'Paragraph', icon: FileText, label: 'Text Block' },
      { type: 'NumberedList', icon: List, label: 'Numbered List' },
      { type: 'Caption', icon: Layout, label: 'Case Caption' },
      { type: 'Signature', icon: PenTool, label: 'Signature Block' },
      { type: 'CertificateOfService', icon: Hash, label: 'Cert. of Service' },
  ];

  const handleDragStart = (e: React.DragEvent, type: string) => {
      e.dataTransfer.setData('pleading/section-type', type);
      e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col h-full">
        <div className={cn("p-4 border-b font-bold text-xs uppercase text-slate-500", theme.border.default)}>Components</div>
        <div className="p-4 space-y-3">
            {items.map(item => (
                <div 
                    key={item.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.type)}
                    onClick={() => onAddSection(item.type)}
                    className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-grab hover:shadow-sm transition-all active:cursor-grabbing",
                        theme.surface.default,
                        theme.border.default,
                        `hover:${theme.primary.border}`
                    )}
                >
                    <GripVertical className="h-4 w-4 text-slate-300"/>
                    <item.icon className="h-4 w-4 text-slate-600"/>
                    <span className={cn("text-sm font-medium", theme.text.primary)}>{item.label}</span>
                </div>
            ))}
        </div>
        <div className="mt-auto p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
            <p><strong>Tip:</strong> Drag items onto the canvas or click to append.</p>
        </div>
    </div>
  );
};
