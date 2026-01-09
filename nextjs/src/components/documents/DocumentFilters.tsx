import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
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
    <div className="w-full flex flex-col h-full shrink-0 bg-muted/30 border-r">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-xs uppercase tracking-wide mb-3 px-2 text-muted-foreground">Smart Views</h3>
        <div className="space-y-1">
          {smartViews.map(sf => (
            <Button
              key={sf.id}
              variant="ghost"
              className="w-full justify-start h-9 px-3 font-normal"
            >
              <sf.icon className={cn("h-4 w-4 mr-3 opacity-70", sf.color)} />
              <span className="flex-1 text-left">{sf.label}</span>
              {sf.count && <Badge variant="secondary" className="ml-auto h-5 px-1.5 min-w-5 justify-center">{sf.count}</Badge>}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <h3 className="font-semibold text-xs uppercase tracking-wide mb-3 px-2 text-muted-foreground">Library Folders</h3>
          <div className="space-y-1 mb-6">
            {isLoading ? (
              <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-4 w-4 text-muted-foreground" /></div>
            ) : (folders).map((folder) => {
              const isActive = currentFolder === folder.id;
              const Icon = isActive ? FolderOpen : Folder;
              return (
                <Button
                  key={folder.id}
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => setCurrentFolder(folder.id)}
                  className={cn(
                    "w-full justify-start h-9 px-3 font-normal",
                    isActive && "font-medium"
                  )}
                >
                  <Icon className={cn("h-4 w-4 mr-3", isActive ? "fill-current opacity-20" : "opacity-50")} />
                  {folder.label}
                </Button>
              );
            })}
          </div>

          {/* Facets */}
          {facets.map((facet, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="font-semibold text-xs uppercase tracking-wide mb-2 px-2 text-muted-foreground">{facet.label}</h3>
              <div className="space-y-1">
                {facet.items.map(item => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start h-8 px-3 text-sm font-normal"
                  >
                    <item.icon className="h-3.5 w-3.5 mr-3 opacity-50" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.count}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
