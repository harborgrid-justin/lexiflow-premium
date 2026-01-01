import { cn } from '@/lib/utils';
import {
  AlertOctagon, CheckCircle2,
  Clock,
  File,
  FileText,
  Folder, FolderOpen,
  Image as ImageIcon,
  Loader2,
  Star,
  Video
} from 'lucide-react';

interface DocumentFiltersProps {
  currentFolder: string;
  setCurrentFolder: (folder: string) => void;
}

export function DocumentFilters({ currentFolder, setCurrentFolder }: DocumentFiltersProps) {
  // Mock data
  const folders = [
    { id: 'All Documents', label: 'All Documents' },
    { id: 'Contracts', label: 'Contracts' },
    { id: 'Evidence', label: 'Evidence' },
    { id: 'Pleadings', label: 'Pleadings' },
    { id: 'Correspondence', label: 'Correspondence' },
  ];
  const isLoading = false;

  const smartViews = [
    { id: 'recent', label: 'Recent Files', icon: Clock },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'missing_meta', label: 'Missing Metadata', icon: AlertOctagon, count: 3, color: 'text-amber-600' },
  ];

  const facets = [
    {
      label: 'File Type', items: [
        { id: 'pdf', label: 'PDF Documents', icon: FileText, count: 124 },
        { id: 'img', label: 'Images', icon: ImageIcon, count: 45 },
        { id: 'media', label: 'Audio/Video', icon: Video, count: 12 },
      ]
    },
    {
      label: 'Status', items: [
        { id: 'final', label: 'Finalized', icon: CheckCircle2, count: 89 },
        { id: 'draft', label: 'Drafts', icon: File, count: 32 },
      ]
    }
  ];

  return (
    <div className="w-full flex flex-col h-full shrink-0 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-xs uppercase tracking-wide mb-3 px-2 text-slate-500 dark:text-slate-400">Smart Views</h3>
        <div className="space-y-0.5">
          {smartViews.map(sf => (
            <button
              key={sf.id}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors group text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <div className="flex items-center">
                <sf.icon className={cn("h-4 w-4 mr-3 opacity-70 group-hover:opacity-100", sf.color || "")} />
                {sf.label}
              </div>
              {sf.count && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">{sf.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <h3 className="font-bold text-xs uppercase tracking-wide mb-3 px-2 text-slate-500 dark:text-slate-400">Library Folders</h3>
        <div className="space-y-0.5 mb-6">
          {isLoading ? (
            <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-4 w-4 text-slate-400" /></div>
          ) : (folders).map((folder) => {
            const isActive = currentFolder === folder.id;
            const Icon = isActive ? FolderOpen : Folder;
            return (
              <button
                key={folder.id}
                onClick={() => setCurrentFolder(folder.id)}
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                <Icon className={cn("h-4 w-4 mr-3", isActive ? "fill-current opacity-20" : "opacity-50")} />
                {folder.label}
              </button>
            );
          })}
        </div>

        {/* Facets */}
        {facets.map((facet, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="font-bold text-xs uppercase tracking-wide mb-2 px-2 text-slate-500 dark:text-slate-400">{facet.label}</h3>
            <div className="space-y-0.5">
              {facet.items.map(item => (
                <div key={item.id} className="flex items-center justify-between px-3 py-1.5 rounded cursor-pointer group hover:bg-white dark:hover:bg-slate-700">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                    <item.icon className="h-3.5 w-3.5 mr-3 opacity-50" />
                    {item.label}
                  </div>
                  <span className="text-[10px] text-slate-400">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
