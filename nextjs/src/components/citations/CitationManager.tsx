'use client';

import { DataService } from '@/services/data/dataService';
import { BookOpen, FileText, Plus, Upload, Loader2, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { Input } from '@/components/ui/shadcn/input';

interface Citation {
  id: string;
  source: string;
  reference: string;
  tags?: string[];
  notes?: string;
  created?: string;
}

// Data-connected Citation Library
const CitationLibrary = () => {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCitations() {
      try {
        setLoading(true);
        // Use DataService.citations repository
        // If not directly available, can map from documents
        let items: any[] = [];

        if (DataService.citations) {
          const repo = await DataService.citations;
          items = await repo.getAll();
        } else {
          // Fallback
          const docs = await DataService.documents.getAll();
          // Assuming we store citations as a doc type or separate
          // For now mocking fallback empty
        }

        setCitations(items);
      } catch (e) {
        console.error("Failed to load citations", e);
      } finally {
        setLoading(false);
      }
    }
    loadCitations();
  }, []);

  const filtered = citations.filter(c =>
    c.source.toLowerCase().includes(search.toLowerCase()) ||
    c.reference.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Citation Library</CardTitle>
        <CardDescription>View and manage your saved legal citations.</CardDescription>
        <div className="pt-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search citations..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <BookOpen className="h-10 w-10 mb-3 opacity-50" />
            <p>No citations found in library</p>
            <Button variant="outline" className="mt-4">Import Citations</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((c) => (
              <div key={c.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-medium">{c.source}</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-mono mt-1">{c.reference}</p>
                {c.notes && <p className="text-xs text-muted-foreground mt-2 italic">{c.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const BriefAnalyzer = () => (
  <Card>
    <CardHeader>
      <CardTitle>Brief Analyzer</CardTitle>
      <CardDescription>Upload a legal brief to extract and validate citations.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
        <Upload className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-1">Upload Brief</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          Drag and drop your PDF or DOCX file here, or click to browse.
          We&apos;ll analyze formatting and validity.
        </p>
        <Button>
          Select File
        </Button>
      </div>
    </CardContent>
  </Card>
);

export function CitationManager() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Tabs defaultValue="library" className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b px-6 py-4 bg-background z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Citation Manager</h1>
              <p className="text-muted-foreground">Manage legal citations and analyze briefs with Bluebook formatting.</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Citation
            </Button>
          </div>

          <TabsList>
            <TabsTrigger value="library" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Citation Library
            </TabsTrigger>
            <TabsTrigger value="analyzer" className="gap-2">
              <FileText className="w-4 h-4" />
              Brief Analyzer
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-muted/10">
          <TabsContent value="library" className="mt-0 space-y-4">
            <CitationLibrary />
          </TabsContent>
          <TabsContent value="analyzer" className="mt-0 space-y-4">
            <BriefAnalyzer />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
