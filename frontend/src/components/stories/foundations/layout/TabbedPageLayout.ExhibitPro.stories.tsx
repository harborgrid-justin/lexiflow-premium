import type { Meta, StoryObj } from 'storybook/react-vite';
import { TabbedPageLayout, TabConfigItem } from '../../../../frontend/components/layout/TabbedPageLayout';
import { ThemeProvider } from '../../../../frontend/providers/ThemeContext';
import React, { useState } from 'react';
import { 
  Layers,
  PenTool,
  BarChart2,
  Grid as GridIcon,
  Plus,
  Printer,
  Search,
  Filter,
  List,
  Grid,
  Users,
  Calendar
} from 'lucide-react';
import { Button } from '../../../../frontend/components/common/Button';
import { cn } from '../../../../frontend/utils/cn';

/**
 * Exhibit Pro demonstrates the complete trial exhibit management interface.
 * This is a real-world example showing:
 * - Sidebar with category counts
 * - Search and filter toolbar
 * - List/Grid view toggle
 * - Data table with sortable columns
 * - Status badges and formatting
 * 
 * This builds upon the basic TabbedPageLayout by adding:
 * - Complex sidebar navigation
 * - Inline search functionality
 * - View mode switching
 * - Rich data display
 */

const meta: Meta<typeof TabbedPageLayout> = {
  title: 'Layout/TabbedPageLayout/Examples/Exhibit Pro',
  component: TabbedPageLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete trial exhibit management interface with sidebar, search, and table display.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="h-screen bg-slate-100">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ExhibitPro: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('all');
    const [filterParty, setFilterParty] = useState('All');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [searchQuery, setSearchQuery] = useState('');

    const tabConfig: TabConfigItem[] = [
      {
        id: 'exhibits',
        label: 'Exhibits',
        icon: Layers,
        subTabs: [
          { id: 'all', label: 'All Exhibits', icon: Layers },
        ],
      },
      {
        id: 'tools',
        label: 'Tools',
        icon: PenTool,
        subTabs: [
          { id: 'sticker', label: 'Sticker Designer', icon: PenTool },
          { id: 'analytics', label: 'Analytics', icon: BarChart2 },
          { id: 'binders', label: 'Binders', icon: GridIcon },
        ],
      },
    ];

    const exhibits = [
      { id: 1, number: 'PX-001', description: 'Employment Contract', party: 'Plaintiff', dateMarked: '2024-12-15', witness: 'John Smith', status: 'Admitted' },
      { id: 2, number: 'DX-001', description: 'Email Chain re: Performance', party: 'Defense', dateMarked: '2024-12-16', witness: 'Jane Doe', status: 'Marked' },
      { id: 3, number: 'PX-002', description: 'Termination Letter', party: 'Plaintiff', dateMarked: '2024-12-17', witness: 'John Smith', status: 'Admitted' },
      { id: 4, number: 'JX-001', description: 'Company Handbook', party: 'Joint', dateMarked: '2024-12-18', witness: 'Both', status: 'Admitted' },
      { id: 5, number: 'DX-002', description: 'Performance Reviews', party: 'Defense', dateMarked: '2024-12-19', witness: 'Jane Doe', status: 'Pending' },
    ];

    const partyCounts = {
      All: exhibits.length,
      Plaintiff: exhibits.filter(e => e.party === 'Plaintiff').length,
      Defense: exhibits.filter(e => e.party === 'Defense').length,
      Joint: exhibits.filter(e => e.party === 'Joint').length,
      Court: 0,
    };

    const filteredExhibits = exhibits.filter(e => 
      (filterParty === 'All' || e.party === filterParty) &&
      (searchQuery === '' || e.description.toLowerCase().includes(searchQuery.toLowerCase()) || e.number.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const witnesses = Array.from(new Set(exhibits.map(e => e.witness)));

    return (
      <TabbedPageLayout
        pageTitle="Exhibit Pro"
        pageSubtitle="Trial exhibit management, digital stickering, and admissibility tracking."
        pageActions={
          <div className="flex gap-2">
            <Button variant="outline" icon={Printer}>Export Index</Button>
            <Button variant="primary" icon={Plus}>Add Exhibit</Button>
          </div>
        }
        tabConfig={tabConfig}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="flex h-full overflow-hidden -mx-6 -mb-6">
          {/* Left Sidebar - Binders */}
          <div className="w-64 border-r bg-white flex-col shrink-0 hidden md:flex overflow-y-auto">
            <div className="p-4 border-b">
              <h4 className="text-xs font-bold uppercase tracking-wide mb-3 text-slate-500">Binders</h4>
              <div className="space-y-1">
                {Object.entries(partyCounts).map(([party, count]) => (
                  <button
                    key={party}
                    onClick={() => setFilterParty(party)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center",
                      filterParty === party 
                        ? "bg-blue-50 text-blue-700" 
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {party} Exhibits
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-xs font-bold uppercase tracking-wide mb-3 text-slate-500">Witnesses</h4>
              <div className="space-y-1">
                {witnesses.map(witness => (
                  <button key={witness} className="w-full text-left px-3 py-1.5 rounded text-sm flex items-center text-slate-600 hover:bg-slate-50">
                    <Users className="h-3 w-3 mr-2 opacity-50"/> {witness}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            {activeTab === 'all' && (
              <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex justify-between items-center">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                    <input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                      placeholder="Search exhibits..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex p-1 rounded-lg border border-slate-300 bg-white">
                      <button 
                        onClick={() => setViewMode('list')} 
                        className={cn(
                          "p-1.5 rounded transition-colors",
                          viewMode === 'list' ? "bg-white shadow text-blue-600" : "text-slate-500"
                        )}
                      >
                        <List className="h-4 w-4"/>
                      </button>
                      <button 
                        onClick={() => setViewMode('grid')} 
                        className={cn(
                          "p-1.5 rounded transition-colors",
                          viewMode === 'grid' ? "bg-white shadow text-blue-600" : "text-slate-500"
                        )}
                      >
                        <Grid className="h-4 w-4"/>
                      </button>
                    </div>
                    <Button variant="secondary" icon={Filter}>Filter</Button>
                  </div>
                </div>

                {/* Table */}
                {viewMode === 'list' ? (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Exhibit #</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Party</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date Marked</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Witness</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredExhibits.map((exhibit) => (
                          <tr key={exhibit.id} className="hover:bg-slate-50 cursor-pointer">
                            <td className="px-4 py-3 text-sm font-medium text-blue-600">{exhibit.number}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{exhibit.description}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{exhibit.party}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{exhibit.dateMarked}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{exhibit.witness}</td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                                exhibit.status === 'Admitted' ? "bg-green-100 text-green-700" :
                                exhibit.status === 'Marked' ? "bg-blue-100 text-blue-700" :
                                "bg-amber-100 text-amber-700"
                              )}>
                                {exhibit.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredExhibits.map((exhibit) => (
                      <div key={exhibit.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-bold text-blue-600">{exhibit.number}</span>
                          <span className={cn(
                            "inline-flex px-2 py-0.5 text-xs font-semibold rounded-full",
                            exhibit.status === 'Admitted' ? "bg-green-100 text-green-700" :
                            exhibit.status === 'Marked' ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                          )}>
                            {exhibit.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 mb-2">{exhibit.description}</h4>
                        <div className="space-y-1 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3"/>
                            {exhibit.party}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3"/>
                            {exhibit.dateMarked}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sticker' && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <PenTool className="h-12 w-12 mx-auto mb-4 text-slate-400"/>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Sticker Designer</h3>
                <p className="text-slate-600">Design and print exhibit stickers</p>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-white rounded-lg shadow p-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Exhibit Analytics</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-800">{exhibits.length}</div>
                    <div className="text-sm text-slate-600">Total Exhibits</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">3</div>
                    <div className="text-sm text-slate-600">Admitted</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">1</div>
                    <div className="text-sm text-slate-600">Marked</div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-700">1</div>
                    <div className="text-sm text-slate-600">Pending</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </TabbedPageLayout>
    );
  },
};
