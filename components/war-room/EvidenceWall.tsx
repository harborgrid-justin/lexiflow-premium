
import React, { useState, useMemo, useTransition } from 'react';
import { FileIcon } from '../common/Primitives';
import { SearchToolbar } from '../common/SearchToolbar';
import { CheckCircle, AlertTriangle, Eye, ArrowUpRight, Plus, Bookmark, Gavel, FileText, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useWindow } from '../../context/WindowContext';
import { DocumentPreviewPanel } from '../document/DocumentPreviewPanel';
import { WarRoomData, LegalDocument, EvidenceItem, Motion } from '../../types';

interface EvidenceWallProps {
  caseId: string;
  warRoomData: WarRoomData;
}

interface WallItem {
    id: string;
    title: string;
    type: string;
    status: string;
    hot: boolean;
    party: string;
    num: string;
    desc?: string;
    original: LegalDocument | EvidenceItem | Motion;
}

export const EvidenceWall: React.FC<EvidenceWallProps> = ({ caseId, warRoomData }) => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  // Memoize heavy mapping logic
  const combinedItems = useMemo<WallItem[]>(() => {
      const docs = (warRoomData.documents || []).map((d) => ({
          id: d.id,
          title: d.title,
          type: d.type,
          status: d.status || 'Available',
          hot: d.tags.includes('Hot') || d.tags.includes('Critical'),
          party: 'Unknown', 
          num: d.id,
          desc: d.content?.substring(0, 100),
          original: d
      }));

      const ev = (warRoomData.evidence || []).map((e) => ({
          id: e.id,
          title: e.title,
          type: e.type,
          status: e.admissibility || 'Pending',
          hot: e.tags.includes('Key Doc'),
          party: 'Joint', 
          num: e.id,
          desc: e.description,
          original: e
      }));
      
      const motions = (warRoomData.motions || []).map((m) => ({
          id: m.id,
          title: m.title,
          type: 'Motion',
          status: m.status,
          hot: true,
          party: 'Appellant', 
          num: m.id,
          desc: `Motion Type: ${m.type}`,
          original: m
      }));

      return [...docs, ...ev, ...motions];
  }, [warRoomData]);

  // Handle input with transition to keep UI responsive during filtering
  const handleSearch = (val: string) => {
      startTransition(() => {
          setSearchTerm(val);
      });
  };

  const handleFilterClick = (val: string) => {
      startTransition(() => {
          setFilter(val);
      });
  };

  const handleViewItem = (item: WallItem) => {
      const winId = `ev-wall-${item.id}`;
      openWindow(
          winId,
          `Evidence Preview: ${item.title}`,
          <div className="h-full bg-white">
              <DocumentPreviewPanel 
                 document={{
                     id: item.id,
                     title: item.title,
                     type: item.type,
                     content: item.desc || '',
                     uploadDate: new Date().toISOString(),
                     lastModified: new Date().toISOString(),
                     tags: item.hot ? ['Hot'] : [],
                     versions: [],
                     caseId: caseId,
                     status: item.status
                 }}
                 onViewHistory={() => {}}
                 isOrbital={true}
              />
          </div>
      );
  };

  const filteredExhibits = combinedItems.filter((ex) => {
      const matchesSearch = ex.title.toLowerCase().includes(searchTerm.toLowerCase()) || (ex.desc && ex.desc.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;

      if (filter === 'All') return true;
      if (filter === 'Hot Docs') return ex.hot;
      if (filter === 'Admitted') return ex.status === 'Admitted' || ex.status === 'Filed';
      if (filter === 'Motions') return ex.type === 'Motion';
      return ex.party === filter;
  });

  const getTypeIcon = (type: string) => {
      if (type === 'Motion') return <Gavel className="h-12 w-12 opacity-50 text-purple-500"/>;
      if (type === 'Order') return <FileText className="h-12 w-12 opacity-50 text-red-500"/>;
      return <FileIcon type={type} className="h-12 w-12 opacity-50"/>;
  };

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
        <div className="flex justify-between items-center gap-4 shrink-0">
            <div className="flex-1 relative">
                <SearchToolbar value={searchTerm} onChange={handleSearch} placeholder="Search exhibits & filings..." className="w-full"/>
                {isPending && <div className="absolute right-12 top-1/2 -translate-y-1/2"><Loader2 className="h-4 w-4 animate-spin text-blue-500"/></div>}
            </div>
            
            <div className={cn("flex bg-slate-100 p-1 rounded-lg border", theme.border.default)}>
                {['All', 'Hot Docs', 'Admitted', 'Motions'].map(f => (
                    <button
                        key={f}
                        onClick={() => handleFilterClick(f)}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            filter === f ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>

        <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4 content-start", isPending ? "opacity-70 transition-opacity" : "")}>
            {filteredExhibits.map((ex) => (
                <div key={ex.id} className={cn("group relative flex flex-col rounded-xl border shadow-sm transition-all hover:shadow-md cursor-pointer", theme.surface, theme.border.default, ex.hot ? "ring-2 ring-red-500/20" : "")}>
                    <div className={cn("aspect-[4/3] bg-slate-100 rounded-t-xl flex items-center justify-center relative overflow-hidden", theme.surfaceHighlight)}>
                        {getTypeIcon(ex.type)}
                        {ex.hot && <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">HOT</span>}
                        
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                             <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handleViewItem(ex); }} className="p-2 bg-white rounded-full text-slate-700 hover:text-blue-600 shadow-lg" title="View"><Eye className="h-4 w-4"/></button>
                                <button className="p-2 bg-white rounded-full text-slate-700 hover:text-blue-600 shadow-lg" title="Open"><ArrowUpRight className="h-4 w-4"/></button>
                             </div>
                             <div className="flex gap-2 mt-2">
                                <button className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full shadow hover:bg-blue-700 flex items-center" title="Add to Binder">
                                    <Bookmark className="h-3 w-3 mr-1"/> Binder
                                </button>
                             </div>
                        </div>
                    </div>
                    <div className="p-3">
                        <div className="flex justify-between items-start mb-1">
                            <span className={cn("font-mono text-[10px] font-bold px-1.5 rounded border bg-slate-50 text-slate-600")}>{ex.num.substring(0, 8)}</span>
                            {ex.status === 'Admitted' && <CheckCircle className="h-3.5 w-3.5 text-green-500"/>}
                            {ex.status === 'Excluded' && <AlertTriangle className="h-3.5 w-3.5 text-red-500"/>}
                        </div>
                        <h4 className={cn("font-bold text-sm line-clamp-2 leading-tight mb-2", theme.text.primary)}>{ex.title}</h4>
                        <div className="flex justify-between items-center text-xs">
                            <span className={cn("text-slate-500")}>{ex.type}</span>
                            <span className={cn("font-medium", (ex.status === 'Admitted' || ex.status === 'Filed') ? 'text-green-600' : 'text-slate-400')}>{ex.status}</span>
                        </div>
                    </div>
                </div>
            ))}
            
            <div className={cn("border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer", theme.border.default)}>
                <span className="text-2xl font-light mb-2">+</span>
                <span className="text-xs font-medium">Add Evidence</span>
            </div>
        </div>
    </div>
  );
};
