'use client';

import { Button } from '@/components/ui/atoms/Button/Button';
import { Input } from '@/components/ui/atoms/Input/Input';
import { Modal } from '@/components/ui/molecules/Modal/Modal';
import { cn } from '@/lib/utils';
import { Clock, FileText, Filter, Plus, Search } from 'lucide-react';
import React, { useState } from 'react';

// Mock types
interface PleadingDocument {
  id: string;
  title: string;
  caseId: string;
  status: string;
  lastAutoSaved?: string;
}

interface PleadingDashboardProps {
  onCreate: () => void;
  onEdit: (id: string) => void;
}

export const PleadingDashboard: React.FC<PleadingDashboardProps> = ({ onCreate, onEdit }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');

  // Mock data
  const pleadings: PleadingDocument[] = [
    { id: '1', title: 'Complaint for Damages', caseId: 'CASE-2024-001', status: 'Draft', lastAutoSaved: '2 mins ago' },
    { id: '2', title: 'Motion to Dismiss', caseId: 'CASE-2024-002', status: 'Review', lastAutoSaved: '1 hour ago' },
    { id: '3', title: 'Answer to Complaint', caseId: 'CASE-2024-003', status: 'Final', lastAutoSaved: 'Yesterday' },
    { id: '4', title: 'Interrogatories', caseId: 'CASE-2024-001', status: 'Draft', lastAutoSaved: '3 days ago' },
  ];

  const filteredPleadings = pleadings.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.caseId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    // In a real app, this would call an API
    console.log('Creating pleading:', newDocTitle);
    setIsCreateModalOpen(false);
    onCreate();
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pleadings</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and draft legal pleadings</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Pleading
        </Button>
      </div>

      <div className="flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search pleadings..."
            className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPleadings.map((item) => (
          <div
            key={item.id}
            className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => onEdit(item.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <FileText className="h-6 w-6" />
              </div>
              <span className={cn(
                "text-xs px-2 py-1 rounded font-medium",
                item.status === 'Draft' ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" :
                  item.status === 'Review' ? "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" :
                    "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
              )}>
                {item.status}
              </span>
            </div>
            <h4 className="font-bold text-sm mb-1 line-clamp-2 text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {item.title}
            </h4>
            <p className="text-xs mb-4 font-mono text-slate-500 dark:text-slate-400">
              {item.caseId}
            </p>
            <div className="mt-auto text-xs flex items-center pt-3 border-t border-slate-100 dark:border-slate-700 text-slate-400">
              <Clock className="h-3 w-3 mr-1" />
              Last edited: {item.lastAutoSaved}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Pleading"
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
            <Input
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              placeholder="e.g., Motion for Summary Judgment"
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Document</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
