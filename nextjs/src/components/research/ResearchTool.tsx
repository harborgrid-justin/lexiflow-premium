'use client';

import { API_ENDPOINTS } from '@/lib/api-config';
import {
  Bookmark,
  History,
  Scale,
  Search,
  Settings
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SearchResult {
  id: string;
  title: string;
  type: string;
  citation?: string;
  summary?: string;
}

interface SavedAuthority {
  id: string;
  citation: string;
  title: string;
  jurisdiction: string;
}

interface ResearchQuery {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
}

// Active Research Tab - Fetches from API
const ActiveResearch = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_ENDPOINTS.SEARCH.CASES}?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setResults(Array.isArray(data) ? data : data.data || []);
      onSearch(query);
    } catch (error) {
      console.error('Failed to search:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Search Query</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter keywords, citation, or natural language query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {results.length > 0 ? (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-medium text-slate-900">Results ({results.length})</h4>
          {results.map((result) => (
            <div key={result.id} className="border-b border-slate-100 pb-4 last:border-b-0">
              <h5 className="font-medium text-slate-900">{result.title}</h5>
              {result.citation && (
                <p className="text-sm text-slate-600">{result.citation}</p>
              )}
              {result.summary && (
                <p className="text-sm text-slate-700 mt-2">{result.summary}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm min-h-100 flex items-center justify-center text-slate-400">
          {query ? 'No results found' : 'Enter a search term to begin research'}
        </div>
      )}
    </div>
  );
};

// Research History Tab - Fetches from API
const ResearchHistory = () => {
  const [history, setHistory] = useState<ResearchQuery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.KNOWLEDGE.ARTICLES}?limit=10`);
        const data = await response.json();
        setHistory(Array.isArray(data) ? data.slice(0, 10) : data.data?.slice(0, 10) || []);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Recent Research</h3>
      {loading ? (
        <div className="text-slate-500 text-center py-8">Loading history...</div>
      ) : history.length > 0 ? (
        <div className="space-y-2">
          {history.map((item: any) => (
            <div key={item.id} className="p-3 hover:bg-slate-50 rounded cursor-pointer">
              <p className="text-slate-900 font-medium">{item.title || item.query}</p>
              {item.timestamp && (
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(item.timestamp).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-slate-500 text-center py-8">No recent history</div>
      )}
    </div>
  );
};

// Saved Authorities Tab - Fetches from API
const SavedAuthorities = () => {
  const [saved, setSaved] = useState<SavedAuthority[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.CITATIONS.LIST);
        const data = await response.json();
        setSaved(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error('Failed to fetch saved authorities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Saved Authorities</h3>
      {loading ? (
        <div className="text-slate-500 text-center py-8">Loading authorities...</div>
      ) : saved.length > 0 ? (
        <div className="space-y-3">
          {saved.map((authority: any) => (
            <div key={authority.id} className="p-3 border border-slate-200 rounded hover:bg-slate-50">
              <p className="font-medium text-slate-900">{authority.title || authority.citation}</p>
              {authority.jurisdiction && (
                <p className="text-xs text-slate-600 mt-1">{authority.jurisdiction}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-slate-500 text-center py-8">No saved authorities</div>
      )}
    </div>
  );
};

// Shepardizing Tool - Uses API validation
const ShepardizingTool = () => {
  const [citation, setCitation] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citation.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_ENDPOINTS.CITATIONS.VALIDATE}?citation=${encodeURIComponent(citation)}`
      );
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Failed to validate citation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Shepards Citation Analysis</h3>
      <form onSubmit={handleValidate} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter citation (e.g., 123 F.3d 456)"
            value={citation}
            onChange={(e) => setCitation(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </form>
      {result && (
        <div className="mt-4 p-4 bg-slate-50 rounded">
          <p className="text-slate-900 font-medium">{result.status || 'Valid Citation'}</p>
          {result.authority && (
            <p className="text-sm text-slate-600 mt-2">{result.authority}</p>
          )}
        </div>
      )}
    </div>
  );
};

// Jurisdiction Settings Tab
const JurisdictionSettings = () => {
  const [jurisdiction, setJurisdiction] = useState('Federal (All Circuits)');

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Jurisdiction Settings</h3>
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Primary Jurisdiction</label>
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Federal (All Circuits)</option>
            <option>California</option>
            <option>New York</option>
            <option>Texas</option>
            <option>Florida</option>
          </select>
        </div>
      </div>
    </div>
  );
};

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
      case 'active': return <ActiveResearch onSearch={() => { }} />;
      case 'history': return <ResearchHistory />;
      case 'saved': return <SavedAuthorities />;
      case 'shepardize': return <ShepardizingTool />;
      case 'settings': return <JurisdictionSettings />;
      default: return <ActiveResearch onSearch={() => { }} />;
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
