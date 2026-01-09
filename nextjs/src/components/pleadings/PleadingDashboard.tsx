'use client';

import { DataService } from '@/services/data/dataService';
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/shadcn/dialog";
import { Badge } from "@/components/ui/shadcn/badge";
import { cn } from '@/lib/utils';
import { Clock, FileText, Filter, Plus, Search, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Label } from "@/components/ui/shadcn/label";

// Define based on DataService return types
interface PleadingDocument {
  id: string;
  title: string;
  caseId: string;
  status: string;
  updatedAt: string;
}

interface PleadingDashboardProps {
  onCreate: () => void;
  onEdit: (id: string) => void;
}

export const PleadingDashboard: React.FC<PleadingDashboardProps> = ({ onCreate, onEdit }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [pleadings, setPleadings] = useState<PleadingDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Using DataService to fetch all pleadings
        const data = await DataService.pleadings.getAll();
        setPleadings(data as unknown as PleadingDocument[]);
      } catch (e) {
        console.error("Failed to load pleadings", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredPleadings = pleadings.filter(p =>
    (p.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (p.caseId?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newDocTitle.trim()) return;

    try {
      // Create via DataService
      await DataService.pleadings.add({
        title: newDocTitle,
        status: 'Draft',
        caseId: 'Unassigned', // Or prompt for case
        type: 'Pleading',
        content: ''
      } as unknown);

      // Refresh list
      const data = await DataService.pleadings.getAll();
      setPleadings(data as unknown as PleadingDocument[]);

      setIsCreateModalOpen(false);
      setNewDocTitle('');
      onCreate(); // Notify parent
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Pleadings</h1>
          <p className="text-muted-foreground">Manage and draft legal pleadings</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Pleading
        </Button>
      </div>

      <div className="flex gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search pleadings..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredPleadings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No pleadings found. Create one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPleadings.map((item) => (
            <div
              key={item.id}
              className="p-4 border rounded-lg bg-card hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onEdit(item.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <FileText className="h-6 w-6" />
                </div>
                <Badge variant={
                  item.status === 'Draft' ? 'secondary' :
                    item.status === 'Review' ? 'default' :
                      'outline'
                } className={cn(
                  item.status === 'Draft' && "bg-slate-100 text-slate-600",
                  item.status === 'Review' && "bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
                  item.status === 'Final' && "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                )}>
                  {item.status}
                </Badge>
              </div>
              <h4 className="font-bold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <p className="text-xs mb-4 font-mono text-muted-foreground">
                {item.caseId}
              </p>
              <div className="mt-auto text-xs flex items-center pt-3 border-t text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                Updated: {new Date(item.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Pleading</DialogTitle>
            <DialogDescription>Enter a title for your new legal document.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="e.g., Motion for Summary Judgment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
