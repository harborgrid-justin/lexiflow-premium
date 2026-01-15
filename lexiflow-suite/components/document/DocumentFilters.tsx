
import { Clock, Cloud, Folder, FolderOpen, Star } from 'lucide-react';
import React from 'react';

interface DocumentFiltersProps {
    currentFolder: string;
    setCurrentFolder: (folder: string) => void;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({ currentFolder, setCurrentFolder }) => {
    const folders = [
        { id: 'root', label: 'All Documents', icon: Folder },
        { id: 'discovery', label: 'Discovery', icon: Folder },
        { id: 'evidence', label: 'Evidence', icon: Folder },
        { id: 'pleadings', label: 'Pleadings', icon: Folder },
        { id: 'correspondence', label: 'Correspondence', icon: Folder },
        { id: 'admin', label: 'Admin & Billing', icon: Folder },
    ];

    const smartFolders = [
        { id: 'recent', label: 'Recent Files', icon: Clock },
        { id: 'favorites', label: 'Favorites', icon: Star },
    ];

    return (
        <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="w-64 rounded-lg border flex flex-col h-full shrink-0">
            <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wide mb-3">Library</h3>
                <div className="space-y-1">
                    {smartFolders.map(sf => (
                        <button
                            key={sf.id}
                            style={{ color: 'var(--color-textMuted)' }}
                            className="w-full flex items-center px-3 py-2 text-sm font-medium hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors"
                        >
                            <sf.icon className="h-4 w-4 mr-3 opacity-70" />
                            {sf.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wide mb-3">Folders</h3>
                <div className="space-y-1">
                    {folders.map(folder => {
                        const isActive = currentFolder === folder.id;
                        const Icon = isActive ? FolderOpen : Folder;
                        return (
                            <button
                                key={folder.id}
                                onClick={() => setCurrentFolder(folder.id)}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <Icon className={`h-4 w-4 mr-3 ${isActive ? 'text-blue-500 fill-blue-100' : 'text-slate-400 fill-slate-50'}`} />
                                {folder.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-surfaceHover)', borderColor: 'var(--color-border)' }} className="p-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                    <Cloud className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-700">Storage</span>
                </div>
                <div style={{ backgroundColor: 'var(--color-surfaceHover)' }} className="w-full rounded-full h-1.5 mb-1">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                    <span>65 GB Used</span>
                    <span>100 GB Total</span>
                </div>
            </div>
        </div>
    );
};
