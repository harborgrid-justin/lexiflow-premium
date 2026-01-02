'use client';

import {
  Bookmark,
  History,
  Scale,
  Search,
  Settings
} from 'lucide-react';
import { useState } from 'react';

// Mock sub-components
const ActiveResearch = () => (
  <div className="space-y-4">
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Search Query</h3>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter keywords, citation, or natural language query..."
          className="flex-1 px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
          Search
        </button>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm min-h-100 flex items-center justify-center text-slate-400">
      Enter a search term to begin research
    </div>
  </div>
);

const ResearchHistory = () => (
  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-medium text-slate-900 mb-4">Recent Research</h3>
    <div className="text-slate-500 text-center py-8">No recent history</div>
  </div>
);

const SavedAuthorities = () => (
  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-medium text-slate-900 mb-4">Saved Authorities</h3>
    <div className="text-slate-500 text-center py-8">No saved authorities</div>
  </div>
);

const JurisdictionSettings = () => (
  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-medium text-slate-900 mb-4">Jurisdiction Settings</h3>
    <div className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Primary Jurisdiction</label>
        <select className="w-full px-3 py-2 border border-slate-300 rounded-md">
          <option>Federal (All Circuits)</option>
          <option>California</option>
          <option>New York</option>
          <option>Texas</option>
        </select>
      </div>
    </div>
  </div>
);

const ShepardizingTool = () => (
  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-medium text-slate-900 mb-4">Shepards Citation Analysis</h3>
    <div className="text-slate-500 text-center py-8">Enter a citation to analyze</div>
  </div>
);

const TABS = [
  { id: 'active', label: 'Active Research', icon: Search },
  { id: 'history', label: 'History', icon: History },
  { id: 'saved', label: 'Saved Authorities', icon: Bookmark },
  { id: 'shepardize', label: 'Shepardize', icon: Scale },
  { id: 'settings', label: 'Jurisdiction', icon: Settings },
];

export function ResearchTool() {
  const [activeTab, setActiveTab] = useState('active');

  const renderContent = () => {
    switch (activeTab) {
      case 'active': return <ActiveResearch />;
      case 'history': return <ResearchHistory />;
      case 'saved': return <SavedAuthorities />;
      case 'shepardize': return <ShepardizingTool />;
      case 'settings': return <JurisdictionSettings />;
      default: return <ActiveResearch />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header / Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Legal Research</h1>
            <p className="text-slate-500">Case law, statutes, and citation analysis</p>
          </div>
        </div>

        <div className="flex space-x-1 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'}
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
}
