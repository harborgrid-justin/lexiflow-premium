/**
 * Entities Domain - View Component
 */

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/shared/ui/organisms/PageHeader';
import { Building, Plus, User } from 'lucide-react';
import React, { useId } from 'react';
import { useEntities } from './EntitiesProvider';

export function EntitiesView() {
  const { entities, typeFilter, setTypeFilter, searchTerm, setSearchTerm, isPending } = useEntities();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Legal Entities"
        subtitle="People, organizations, and trust management"
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            Add Entity
          </Button>
        }
      />

      <div className="px-4 pb-4 space-y-4">
        <div className="flex-1">
          <label htmlFor={searchId} className="sr-only">Search entities</label>
          <input
            id={searchId}
            type="search"
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
            className="w-full px-4 py-2 rounded-lg border"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <FilterButton active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
            All Types
          </FilterButton>
          <FilterButton active={typeFilter === 'Person'} onClick={() => setTypeFilter('Person')}>
            <User className="w-4 h-4" />
            Person
          </FilterButton>
          <FilterButton active={typeFilter === 'Organization'} onClick={() => setTypeFilter('Organization')}>
            <Building className="w-4 h-4" />
            Organization
          </FilterButton>
          <FilterButton active={typeFilter === 'Government'} onClick={() => setTypeFilter('Government')}>
            Government
          </FilterButton>
          <FilterButton active={typeFilter === 'Trust'} onClick={() => setTypeFilter('Trust')}>
            Trust
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
            {entities.map(entity => (
              <EntityCard key={entity.id} entity={entity} />
            ))}
            {entities.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">
                No entities found
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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${active
        ? 'bg-blue-600 text-white'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
    >
      {children}
    </button>
  );
}

type Entity = {
  id: string;
  name: string;
  type: 'Person' | 'Organization' | 'Government' | 'Trust';
  jurisdiction: string;
  identificationNumber: string;
  relatedCases: number;
  status: 'Active' | 'Inactive';
};

const typeIcons = {
  Person: User,
  Organization: Building,
  Government: Building,
  Trust: Building,
};

function EntityCard({ entity }: { entity: Entity }) {
  const Icon = typeIcons[entity.type];

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {entity.type}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${entity.status === 'Active'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
              }`}>
              {entity.status}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
            {entity.name}
          </h3>
        </div>
      </div>
      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
        <div>ID: {entity.identificationNumber}</div>
        <div>Jurisdiction: {entity.jurisdiction}</div>
        <div>Related Cases: {entity.relatedCases}</div>
      </div>
    </div>
  );
}
