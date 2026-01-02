'use client';

import { Button } from '@/components/ui/atoms/Button/Button';
import { cn } from '@/lib/utils';
import {
  BarChart2,
  FileText,
  Filter,
  Grid,
  Image as ImageIcon,
  Layers,
  List,
  Loader2,
  PenTool,
  Plus,
  Printer,
  Search,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Mock Types
interface TrialExhibit {
  id: string;
  exhibitNumber: string;
  title: string;
  dateMarked: string;
  party: 'Plaintiff' | 'Defense' | 'Joint' | 'Court';
  status: string;
  fileType: string;
  description: string;
  type: string;
  witness?: string;
}

interface ExhibitManagerProps {
  initialTab?: 'list' | 'sticker' | 'stats';
  caseId?: string;
}

// Mock Data
const MOCK_EXHIBITS: TrialExhibit[] = [
  { id: '1', exhibitNumber: 'PX-1', title: 'Contract Agreement', dateMarked: '2023-01-15', party: 'Plaintiff', status: 'Admitted', fileType: 'PDF', description: 'Main contract', type: 'Document', witness: 'John Doe' },
  { id: '2', exhibitNumber: 'PX-2', title: 'Email Thread', dateMarked: '2023-01-16', party: 'Plaintiff', status: 'Marked', fileType: 'MSG', description: 'Email regarding terms', type: 'Email', witness: 'Jane Smith' },
  { id: '3', exhibitNumber: 'DX-1', title: 'Invoice #1234', dateMarked: '2023-02-01', party: 'Defense', status: 'Admitted', fileType: 'PDF', description: 'Disputed invoice', type: 'Document', witness: 'Robert Johnson' },
  { id: '4', exhibitNumber: 'DX-2', title: 'Site Photo', dateMarked: '2023-02-02', party: 'Defense', status: 'Marked', fileType: 'JPG', description: 'Photo of the site', type: 'Image' },
];

// Mock Sub-components
const ExhibitTable = ({ exhibits, viewMode }: { exhibits: TrialExhibit[], viewMode: 'list' | 'grid' }) => {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {exhibits.map(ex => (
          <div key={ex.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded mb-3 flex items-center justify-center">
              {ex.fileType === 'JPG' ? <ImageIcon className="h-8 w-8 text-gray-400" /> : <FileText className="h-8 w-8 text-gray-400" />}
            </div>
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-blue-600 dark:text-blue-400">{ex.exhibitNumber}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{ex.status}</span>
            </div>
            <h4 className="font-medium text-sm truncate mb-1" title={ex.title}>{ex.title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{ex.dateMarked}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-4 py-3">Exhibit #</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Date Marked</th>
            <th className="px-4 py-3">Party</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Witness</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {exhibits.map(ex => (
            <tr key={ex.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400">{ex.exhibitNumber}</td>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{ex.title}</td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{ex.dateMarked}</td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{ex.party}</td>
              <td className="px-4 py-3">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  ex.status === 'Admitted' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                )}>
                  {ex.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{ex.witness || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StickerDesigner = () => (
  <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
    <PenTool className="h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">Sticker Designer</h3>
    <p className="text-gray-500 dark:text-gray-400 mt-2">Drag and drop interface for exhibit stickers coming soon.</p>
  </div>
);

const ExhibitStats = ({ exhibits }: { exhibits: TrialExhibit[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <BarChart2 className="h-5 w-5 text-blue-600" />
        Admissibility Status
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Admitted</span>
          <span className="font-bold text-green-600">50%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '50%' }}></div>
        </div>
        <div className="flex justify-between items-center">
          <span>Marked</span>
          <span className="font-bold text-yellow-600">30%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '30%' }}></div>
        </div>
      </div>
    </div>
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-purple-600" />
        Exhibits by Party
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
          <span>Plaintiff</span>
          <span className="font-bold">12</span>
        </div>
        <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
          <span>Defense</span>
          <span className="font-bold">8</span>
        </div>
      </div>
    </div>
  </div>
);

export default function ExhibitManager({ initialTab = 'list', caseId }: ExhibitManagerProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'sticker' | 'stats'>(initialTab);
  const [filterParty, setFilterParty] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [exhibits, setExhibits] = useState<TrialExhibit[]>([]);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setExhibits(MOCK_EXHIBITS);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAddExhibit = () => {
    alert("Add Exhibit Wizard would open here");
  };

  const filteredExhibits = exhibits.filter(ex => {
    const matchParty = filterParty === 'All' || ex.party === filterParty;
    return matchParty;
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading exhibits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in bg-gray-50 dark:bg-gray-900">
      <div className="px-6 pt-6 shrink-0">
        {!caseId && (
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exhibit Pro</h1>
              <p className="text-gray-500 dark:text-gray-400">Trial exhibit management, digital stickering, and admissibility tracking.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" icon={Printer}>Export Index</Button>
              <Button variant="primary" icon={Plus} onClick={handleAddExhibit}>Add Exhibit</Button>
            </div>
          </div>
        )}

        {/* Case Context Header if Embedded */}
        {caseId && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Case Exhibits</h3>
            <Button variant="primary" icon={Plus} size="sm" onClick={handleAddExhibit}>Add Exhibit</Button>
          </div>
        )}

        {/* View Toggles */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all",
                activeTab === 'list'
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <Layers className="h-4 w-4 mr-2" /> Exhibits
            </button>
            <button
              onClick={() => setActiveTab('sticker')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all",
                activeTab === 'sticker'
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <PenTool className="h-4 w-4 mr-2" /> Sticker Designer
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all",
                activeTab === 'stats'
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <BarChart2 className="h-4 w-4 mr-2" /> Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Filters) - Only visible in List Mode */}
        {activeTab === 'list' && (
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex-col shrink-0 hidden md:flex bg-white dark:bg-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400">Binders</h4>
              <div className="space-y-1">
                {['All', 'Plaintiff', 'Defense', 'Joint', 'Court'].map(p => (
                  <button
                    key={p}
                    onClick={() => setFilterParty(p)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center",
                      filterParty === p
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    {p} Exhibits
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      filterParty === p
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    )}>
                      {p === 'All' ? exhibits.length : exhibits.filter(e => e.party === p).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400">Witnesses</h4>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {Array.from(new Set(exhibits.map(e => e.witness).filter(Boolean))).map(w => (
                  <button key={w as string} className="w-full text-left px-3 py-1.5 rounded text-sm flex items-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Users className="h-3 w-3 mr-2 opacity-50" /> {w}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50 dark:bg-gray-900">
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* List Toolbar */}
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Search exhibits..."
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex p-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <button
                      onClick={() => setViewMode('list')}
                      title="List view"
                      className={cn(
                        "p-1.5 rounded transition-colors",
                        viewMode === 'list' ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      )}
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      title="Grid view"
                      className={cn(
                        "p-1.5 rounded transition-colors",
                        viewMode === 'grid' ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      )}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                  </div>
                  <Button variant="secondary" icon={Filter} onClick={() => alert("Filter")}>Filter</Button>
                </div>
              </div>

              <ExhibitTable exhibits={filteredExhibits} viewMode={viewMode} />
            </div>
          )}

          {activeTab === 'sticker' && <StickerDesigner />}

          {activeTab === 'stats' && <ExhibitStats exhibits={filteredExhibits} />}
        </div>
      </div>
    </div>
  );
}
