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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { Input } from '@/components/ui/shadcn/input';
import { Button } from '@/components/ui/shadcn/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';

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
  title?: string;
}

interface ShepardizeResult {
  status: string;
  authority?: string;
}


// Active Research Tab
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
      <Card>
        <CardHeader>
          <CardTitle>Search Query</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Enter keywords, citation, or natural language query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Results ({results.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result) => (
              <div key={result.id} className="border-b last:border-0 pb-4 last:pb-0">
                <h5 className="font-medium">{result.title}</h5>
                {result.citation && (
                  <p className="text-sm text-muted-foreground">{result.citation}</p>
                )}
                {result.summary && (
                  <p className="text-sm mt-2">{result.summary}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="min-h-50 flex items-center justify-center text-muted-foreground">
          <CardContent>
            {query ? 'No results found' : 'Enter a search term to begin research'}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Research History Tab
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
    <Card>
      <CardHeader>
        <CardTitle>Recent Research</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground text-center py-8">Loading history...</div>
        ) : history.length > 0 ? (
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className="p-3 hover:bg-muted/50 rounded cursor-pointer border border-transparent hover:border-border transition-colors">
                <p className="font-medium">{item.title || item.query}</p>
                {item.timestamp && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-8">No recent history</div>
        )}
      </CardContent>
    </Card>
  );
};

// Saved Authorities Tab
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
    <Card>
      <CardHeader>
        <CardTitle>Saved Authorities</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground text-center py-8">Loading authorities...</div>
        ) : saved.length > 0 ? (
          <div className="space-y-3">
            {saved.map((authority) => (
              <div key={authority.id} className="p-3 border rounded hover:bg-muted/50 transition-colors">
                <p className="font-medium">{authority.title || authority.citation}</p>
                {authority.jurisdiction && (
                  <p className="text-xs text-muted-foreground mt-1">{authority.jurisdiction}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-8">No saved authorities</div>
        )}
      </CardContent>
    </Card>
  );
};

// Shepardizing Tool
const ShepardizingTool = () => {
  const [citation, setCitation] = useState('');
  const [result, setResult] = useState<ShepardizeResult | null>(null);
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
    <Card>
      <CardHeader>
        <CardTitle>Shepards Citation Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleValidate} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter citation (e.g., 123 F.3d 456)"
              value={citation}
              onChange={(e) => setCitation(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
        </form>
        {result && (
          <div className="mt-4 p-4 bg-muted/30 rounded border">
            <p className="font-medium">{result.status || 'Valid Citation'}</p>
            {result.authority && (
              <p className="text-sm text-muted-foreground mt-2">{result.authority}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Jurisdiction Settings Tab
const JurisdictionSettings = () => {
  const [jurisdiction, setJurisdiction] = useState('Federal (All Circuits)');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jurisdiction Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">Primary Jurisdiction</label>
            <Select value={jurisdiction} onValueChange={setJurisdiction}>
              <SelectTrigger>
                <SelectValue placeholder="Select one" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Federal (All Circuits)">Federal (All Circuits)</SelectItem>
                <SelectItem value="California">California</SelectItem>
                <SelectItem value="New York">New York</SelectItem>
                <SelectItem value="Texas">Texas</SelectItem>
                <SelectItem value="Florida">Florida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function ResearchTool() {
  return (
    <div className="p-6">
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="gap-2"><Search size={16} /> Active Research</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><History size={16} /> History</TabsTrigger>
          <TabsTrigger value="saved" className="gap-2"><Bookmark size={16} /> Saved Authorities</TabsTrigger>
          <TabsTrigger value="shepardize" className="gap-2"><Scale size={16} /> Shepardize</TabsTrigger>
          <TabsTrigger value="settings" className="gap-2"><Settings size={16} /> Jurisdiction</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ActiveResearch onSearch={() => { }} />
        </TabsContent>
        <TabsContent value="history">
          <ResearchHistory />
        </TabsContent>
        <TabsContent value="saved">
          <SavedAuthorities />
        </TabsContent>
        <TabsContent value="shepardize">
          <ShepardizingTool />
        </TabsContent>
        <TabsContent value="settings">
          <JurisdictionSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
