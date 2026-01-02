'use client';

import { BookOpen, FileText, Plus } from 'lucide-react';
import { useState } from 'react';

// Mock sub-components
const CitationLibrary = () => (
  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-medium text-slate-900 mb-4">Citation Library</h3>
    <div className="text-slate-500 text-center py-8">No citations found</div>
  </div>
);

const BriefAnalyzer = () => (
  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-medium text-slate-900 mb-4">Brief Analyzer</h3>
    <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
      <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
      <p className="text-slate-600">Upload a brief to analyze citations</p>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        Upload Brief
      </button>
    </div>
  </div>
);

const TABS = [
  { id: 'library', label: 'Citation Library', icon: BookOpen },
  { id: 'analyzer', label: 'Brief Analyzer', icon: FileText },
];

export function CitationManager() {
  const [activeTab, setActiveTab] = useState('library');

  const renderContent = () => {
    switch (activeTab) {
      case 'library': return <CitationLibrary />;
      case 'analyzer': return <BriefAnalyzer />;
      default: return <CitationLibrary />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Citation Manager</h1>
            <p className="text-slate-500">Manage legal citations and analyze briefs with Bluebook formatting.</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Add Citation
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
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
