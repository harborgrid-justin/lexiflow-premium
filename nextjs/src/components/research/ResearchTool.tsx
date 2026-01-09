'use client';

import { DataService } from '@/services/data/dataService';
import {
  Bookmark,
  History,
  Loader2,
  Search
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { Input } from '@/components/ui/shadcn/input';
import { Button } from '@/components/ui/shadcn/button';

interface SearchResult {
  id: string;
  title: string;
  type: string;
  citation?: string;
  summary?: string;
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
      // Use DataService.research
      const research = await DataService.research;
      const data = await research.search(query);
      setResults(data);
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
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2 h-4 w-4" />}
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
          <CardContent>
            <div className="space-y-4">
              {results.map(r => (
                <div key={r.id} className="border-b pb-4 last:border-0">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{r.title}</h4>
                  <p className="text-sm text-muted-foreground">{r.citation}</p>
                  <p className="mt-1 text-sm">{r.summary}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default function ResearchTool() {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="space-y-6 m-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Legal Research Intelligence</h1>
          <p className="text-muted-foreground">AI-powered case law research and citation analysis.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="gap-2"><Search size={16} /> Active Research</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><History size={16} /> History</TabsTrigger>
          <TabsTrigger value="saved" className="gap-2"><Bookmark size={16} /> Saved Authorities</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <ActiveResearch onSearch={(q) => console.log('Searched:', q)} />
        </TabsContent>

        <TabsContent value="history">
          <Card><CardContent className="p-8 text-center text-muted-foreground">Research history functionality coming soon via DataService.</CardContent></Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card><CardContent className="p-8 text-center text-muted-foreground">Saved authorities functionality coming soon via DataService.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
