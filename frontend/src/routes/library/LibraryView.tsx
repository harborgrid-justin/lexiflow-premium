/**
 * Library Domain - View Component
 */

import { BookMarked, BookOpen, FileCheck, FileText, Plus } from 'lucide-react';
import React, { useId } from 'react';

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/components/organisms/PageHeader';

import { useLibrary } from './LibraryProvider';

export function LibraryView() {
  const { items, typeFilter, setTypeFilter, searchTerm, setSearchTerm, isPending } = useLibrary();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Document Library"
        subtitle="Templates, forms, and legal precedents"
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        }
      />

      <div className="px-4 pb-4 space-y-4">
        <div className="flex-1">
          <label htmlFor={searchId} className="sr-only">Search library</label>
          <input
            id={searchId}
            type="search"
            placeholder="Search library..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
            className="w-full px-4 py-2 rounded-lg border"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <FilterButton active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
            <BookOpen className="w-4 h-4" />
            All
          </FilterButton>
          <FilterButton active={typeFilter === 'Template'} onClick={() => setTypeFilter('Template')}>
            <FileText className="w-4 h-4" />
            Templates
          </FilterButton>
          <FilterButton active={typeFilter === 'Form'} onClick={() => setTypeFilter('Form')}>
            <FileCheck className="w-4 h-4" />
            Forms
          </FilterButton>
          <FilterButton active={typeFilter === 'Precedent'} onClick={() => setTypeFilter('Precedent')}>
            <BookMarked className="w-4 h-4" />
            Precedents
          </FilterButton>
          <FilterButton active={typeFilter === 'Guide'} onClick={() => setTypeFilter('Guide')}>
            <BookOpen className="w-4 h-4" />
            Guides
          </FilterButton>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        {isPending && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {!isPending && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <LibraryItemCard key={item.id} item={item} />
            ))}
            {items.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">
                No library items found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${active
        ? 'bg-blue-600 text-white'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
    >
      {children}
    </button>
  );
}

type LibraryItem = {
  id: string;
  title: string;
  type: 'Template' | 'Form' | 'Precedent' | 'Guide';
  category: string;
  description: string;
  lastUsed?: string;
  useCount: number;
};

const typeIcons = {
  Template: FileText,
  Form: FileCheck,
  Precedent: BookMarked,
  Guide: BookOpen,
};

function LibraryItemCard({ item }: { item: LibraryItem }) {
  const Icon = typeIcons[item.type];

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
            {item.title}
          </h3>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {item.type} • {item.category}
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
        {item.description}
      </p>
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
        <span>Used {item.useCount} times</span>
        {item.lastUsed && (
          <span>{new Date(item.lastUsed).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}
