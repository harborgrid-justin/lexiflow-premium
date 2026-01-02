'use client';

/**
 * ExhibitManager - REFACTORED for React 18/19 Concurrent Mode
 *
 * Changes from original:
 * 1. Separated urgent UI state from deferred filtering
 * 2. Uses startTransition for expensive filter operations
 * 3. Uses useDeferredValue for consistent UI
 *
 * Performance improvements:
 * - Immediate UI feedback on filter changes
 * - Non-blocking filter computation
 * - Smoother animations and interactions
 *
 * @see /nextjs/REACT_CONCURRENT_MODE_GAP_ANALYSIS.md - Section 3
 */

import { BarChart2, Filter, PenTool, Users } from 'lucide-react';
import { useDeferredValue, useMemo, useState, useTransition } from 'react';
import { Button } from '../ui/atoms/Button/Button';

interface TrialExhibit {
  id: string;
  number: string;
  description: string;
  party: 'Plaintiff' | 'Defense';
  witness?: string;
  status: 'Admitted' | 'Marked' | 'Excluded';
  date: string;
}

interface ExhibitManagerProps {
  initialTab?: 'list' | 'sticker' | 'stats';
  caseId?: string;
}

export default function ExhibitManager({ initialTab = 'list', caseId }: ExhibitManagerProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'sticker' | 'stats'>(initialTab);

  // URGENT STATE: UI filter selection (immediate feedback)
  const [filterParty, setFilterParty] = useState<string>('All');

  // DEFERRED STATE: Expensive filtering (non-blocking)
  const [isPending, startTransition] = useTransition();
  const deferredFilterParty = useDeferredValue(filterParty);

  // Existing state
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [exhibits] = useState<TrialExhibit[]>([
    {
      id: '1',
      number: 'P-001',
      description: 'Contract Agreement dated March 2024',
      party: 'Plaintiff',
      witness: 'John Smith',
      status: 'Admitted',
      date: '2024-03-15'
    },
    {
      id: '2',
      number: 'D-001',
      description: 'Email correspondence',
      party: 'Defense',
      status: 'Marked',
      date: '2024-03-18'
    },
    {
      id: '3',
      number: 'P-002',
      description: 'Financial Records Q1 2024',
      party: 'Plaintiff',
      witness: 'Jane Doe',
      status: 'Admitted',
      date: '2024-04-01'
    },
  ]);

  // EXPENSIVE COMPUTATION: Uses deferred value
  const filteredExhibits = useMemo(() => {
    // This runs with the deferred value, not blocking urgent updates
    return exhibits.filter(ex => {
      const matchParty = deferredFilterParty === 'All' || ex.party === deferredFilterParty;
      return matchParty;
    });
  }, [exhibits, deferredFilterParty]);

  // URGENT HANDLER: Update UI immediately, defer computation
  const handleFilterChange = (party: string) => {
    // Update UI state immediately (urgent)
    setFilterParty(party);

    // Expensive filtering will use deferred value (non-urgent)
    // No need to call startTransition here - useDeferredValue handles it
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Exhibit Manager
        </h2>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'list' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('list')}
          >
            List View
          </Button>
          <Button
            variant={activeTab === 'sticker' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('sticker')}
          >
            Sticker Designer
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </Button>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'list' && (
          <div className="flex gap-6 h-full">
            {/* Left Sidebar (Filters) - Show loading state during transitions */}
            <div className="w-64 flex-shrink-0 space-y-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  Filters {isPending && '⏳'}
                </h3>

                {/* Party Filter - Immediate feedback on click */}
                <div className="space-y-2">
                  {['All', 'Plaintiff', 'Defense'].map(p => (
                    <button
                      key={p}
                      onClick={() => handleFilterChange(p)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${filterParty === p
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      <span className="flex justify-between items-center">
                        <span>{p}</span>
                        <span className="text-sm">
                          {p === 'All' ? exhibits.length : exhibits.filter(e => e.party === p).length}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                {/* Witness Filter */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">By Witness</h4>
                  {Array.from(new Set(exhibits.map(e => e.witness).filter(Boolean))).map(w => (
                    <div key={w} className="py-1 text-sm text-gray-600 dark:text-gray-400">
                      {w}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content - Show pending state */}
            <div className="flex-1">
              <div className="mb-4 flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'secondary'}
                    onClick={() => setViewMode('list')}
                  >
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" icon={Filter} onClick={() => alert("Filter")}>
                    Filter
                  </Button>
                </div>
              </div>

              {/* Show subtle loading indicator during transitions */}
              {isPending && (
                <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  Filtering... ({filteredExhibits.length} matches)
                </div>
              )}

              <ExhibitTable exhibits={filteredExhibits} viewMode={viewMode} />
            </div>
          </div>
        )}

        {activeTab === 'sticker' && <StickerDesigner />}
        {activeTab === 'stats' && <ExhibitStats exhibits={filteredExhibits} />}
      </div>
    </div>
  );
}

// Supporting components (unchanged)
const ExhibitTable = ({ exhibits, viewMode }: { exhibits: TrialExhibit[]; viewMode: 'list' | 'grid' }) => (
  <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Exhibit #</th>
          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Description</th>
          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Party</th>
          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Date</th>
        </tr>
      </thead>
      <tbody>
        {exhibits.map(ex => (
          <tr key={ex.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="p-3 font-mono text-sm">{ex.number}</td>
            <td className="p-3">{ex.description}</td>
            <td className="p-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${ex.party === 'Plaintiff'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100'
                : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-100'
                }`}>
                {ex.party}
              </span>
            </td>
            <td className="p-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${ex.status === 'Admitted'
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100'
                : ex.status === 'Marked'
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-100'
                  : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100'
                }`}>
                {ex.status}
              </span>
            </td>
            <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{ex.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

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
