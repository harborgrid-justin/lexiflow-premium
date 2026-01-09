import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';
import { BookOpen, ChevronRight, FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/shadcn/input';
import { DataService } from '@/services/data/dataService';
import { useDebounce } from '@/hooks/useDebounce';

interface Playbook {
  id: string;
  title: string;
  category: string;
  usageCount: number;
  lastUpdated: string;
}

export const PlaybookLibrary: React.FC = () => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchPlaybooks = async () => {
      setLoading(true);
      try {
        // Mapping 'knowledge' domain to playbooks for now
        const data = await DataService.knowledge.getAll({
          type: 'playbook',
          search: debouncedSearch
        });

        // Transform or use directly depending on API shape
        const mappedData = data.map((d: unknown) => ({
          id: d.id,
          title: d.title || d.name,
          category: d.category || 'General',
          usageCount: d.metadata?.usageCount || 0,
          lastUpdated: d.updatedAt
        }));

        setPlaybooks(mappedData);
      } catch (error) {
        console.error('Failed to load playbooks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaybooks();
  }, [debouncedSearch]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Playbook Library
        </CardTitle>
        <CardDescription>Standardized litigation strategies and templates</CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search playbooks..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-100">
          <div className="p-4 space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : playbooks.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No playbooks found matching your search.
              </div>
            ) : (
              playbooks.map((playbook) => (
                <div
                  key={playbook.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      {playbook.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{playbook.category}</Badge>
                      <span>Used {playbook.usageCount} times</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
