
import React from 'react';
import { 
  Folder, FolderOpen, Clock, Star, Cloud, 
  FileText, Image as ImageIcon, Video, AlertOctagon, CheckCircle2, File, Loader2 
} from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { DataService } from '@/services/data/dataService';
import { useQuery } from '@/hooks/useQueryHooks';

interface DocumentFiltersProps {
  currentFolder: string;
  setCurrentFolder: (folder: string) => void;
}

export function DocumentFilters({ currentFolder, setCurrentFolder }: DocumentFiltersProps) {
  const { theme } = useTheme();
  
  // Enterprise Data Access
  const { data: folders = [], isLoading } = useQuery<any[]>(
      ['documents', 'folders'],
      () => DataService.documents.getFolders()
  );

  const smartViews = [
    { id: 'recent', label: 'Recent Files', icon: Clock },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'missing_meta', label: 'Missing Metadata', icon: AlertOctagon, count: 3, color: 'text-amber-600' },
  ];

  const facets = [
    { label: 'File Type', items: [
      { id: 'pdf', label: 'PDF Documents', icon: FileText, count: 124 },
      { id: 'img', label: 'Images', icon: ImageIcon, count: 45 },
      { id: 'media', label: 'Audio/Video', icon: Video, count: 12 },
    ]},
    { label: 'Status', items: [
      { id: 'final', label: 'Finalized', icon: CheckCircle2, count: 89 },
      { id: 'draft', label: 'Drafts', icon: File, count: 32 },
    ]}
  ];

  return (
    <div className="w-full flex flex-col h-full shrink-0">
        <div className={cn("p-4 border-b", theme.border.default)}>
            <h3 className={cn("font-bold text-xs uppercase tracking-wide mb-3 px-2", theme.text.tertiary)}>Smart Views</h3>
            <div className="space-y-0.5">
                {smartViews.map(sf => (
                    <button 
                        key={sf.id}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors group",
                            theme.text.secondary,
                            `hover:${theme.surface.default}`,
                            `hover:${theme.primary.text}`
                        )}
                    >
                        <div className="flex items-center">
                            <sf.icon className={cn("h-4 w-4 mr-3 opacity-70 group-hover:opacity-100", sf.color || "")}/>
                            {sf.label}
                        </div>
                        {sf.count && <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold", theme.surface.default, theme.text.secondary)}>{sf.count}</span>}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <h3 className={cn("font-bold text-xs uppercase tracking-wide mb-3 px-2", theme.text.tertiary)}>Library Folders</h3>
            <div className="space-y-0.5 mb-6">
                {isLoading ? (
                     <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-4 w-4 text-slate-400"/></div>
                ) : (Array.isArray(folders) ? folders : []).map(folder => {
                    const isActive = currentFolder === folder.id;
                    const Icon = isActive ? FolderOpen : Folder;
                    return (
                        <button 
                            key={folder.id}
                            onClick={() => setCurrentFolder(folder.id)}
                            className={cn(
                                "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive 
                                    ? cn(theme.primary.light, theme.primary.text, "font-semibold") 
                                    : cn(theme.text.secondary, `hover:${theme.surface.default}`, `hover:${theme.primary.text}`)
                            )}
                        >
                            <Icon className={cn("h-4 w-4 mr-3", isActive ? "fill-current opacity-20" : "opacity-50")}/>
                            {folder.label}
                        </button>
                    );
                })}
            </div>

            {/* Facets */}
            {facets.map((facet, idx) => (
                <div key={idx} className="mb-6">
                    <h3 className={cn("font-bold text-xs uppercase tracking-wide mb-2 px-2", theme.text.tertiary)}>{facet.label}</h3>
                    <div className="space-y-0.5">
                        {facet.items.map(item => (
                            <div key={item.id} className={cn("flex items-center justify-between px-3 py-1.5 rounded cursor-pointer group", `hover:${theme.surface.default}`)}>
                                <div className={cn("flex items-center text-sm", theme.text.secondary)}>
                                    <input type="checkbox" className={cn("mr-3 rounded", theme.border.default, theme.primary.text)} />
                                    {item.label}
                                </div>
                                <span className={cn("text-xs opacity-60 group-hover:opacity-100", theme.text.tertiary)}>{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        <div className={cn("p-4 border-t", theme.surface.highlight, theme.border.default)}>
            <div className="flex items-center gap-2 mb-2">
                <Cloud className={cn("h-4 w-4", theme.primary.text)}/>
                <span className={cn("text-xs font-bold", theme.text.secondary)}>Storage Quota</span>
            </div>
            <div className={cn("w-full rounded-full h-1.5 mb-1 overflow-hidden", theme.border.default, "bg-slate-200 dark:bg-slate-700")}>
                <div className={cn("h-1.5 rounded-full", theme.primary.DEFAULT)} style={{ width: '65%' }}></div>
            </div>
            <div className={cn("flex justify-between text-[10px] font-medium", theme.text.tertiary)}>
                <span>65 GB Used</span>
                <span>100 GB Total</span>
            </div>
        </div>
    </div>
  );
};

