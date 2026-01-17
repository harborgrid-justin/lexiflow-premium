/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Real Estate Domain - View Component
 */

import { Building2, FileText, MapPin, Plus } from 'lucide-react';
import React, { useId } from 'react';

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/components/organisms/PageHeader';

import { useRealEstate } from './RealEstateProvider';

export function RealEstateView() {
  const { properties, typeFilter, setTypeFilter, statusFilter, setStatusFilter, searchTerm, setSearchTerm, isPending } = useRealEstate();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Real Estate"
        subtitle="Property portfolio management"
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            Add Property
          </Button>
        }
      />

      <div className="px-4 pb-4 space-y-4">
        <div className="flex-1">
          <label htmlFor={searchId} className="sr-only">Search properties</label>
          <input
            id={searchId}
            type="search"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            <FilterButton active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
              All Types
            </FilterButton>
            <FilterButton active={typeFilter === 'Residential'} onClick={() => setTypeFilter('Residential')}>
              Residential
            </FilterButton>
            <FilterButton active={typeFilter === 'Commercial'} onClick={() => setTypeFilter('Commercial')}>
              Commercial
            </FilterButton>
            <FilterButton active={typeFilter === 'Industrial'} onClick={() => setTypeFilter('Industrial')}>
              Industrial
            </FilterButton>
            <FilterButton active={typeFilter === 'Land'} onClick={() => setTypeFilter('Land')}>
              Land
            </FilterButton>
          </div>

          <div className="flex gap-2">
            <FilterButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
              All Status
            </FilterButton>
            <FilterButton active={statusFilter === 'Active'} onClick={() => setStatusFilter('Active')}>
              Active
            </FilterButton>
            <FilterButton active={statusFilter === 'Pending'} onClick={() => setStatusFilter('Pending')}>
              Pending
            </FilterButton>
            <FilterButton active={statusFilter === 'Closed'} onClick={() => setStatusFilter('Closed')}>
              Closed
            </FilterButton>
          </div>
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
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
            {properties.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">
                No properties found
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
      className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${active
        ? 'bg-blue-600 text-white'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
    >
      {children}
    </button>
  );
}

type RealEstateProperty = {
  id: string;
  address: string;
  type: 'Residential' | 'Commercial' | 'Industrial' | 'Land';
  status: 'Active' | 'Pending' | 'Closed' | 'Disputed';
  value: number;
  caseId?: string;
  documents: string[];
  lastUpdated: string;
};

const statusColors = {
  Active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Closed: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400',
  Disputed: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
};

function PropertyCard({ property }: { property: RealEstateProperty }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            {property.type}
          </span>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[property.status]}`}>
          {property.status}
        </span>
      </div>
      <div className="flex items-start gap-2 mb-3">
        <MapPin className="w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
        <h3 className="font-semibold text-slate-900 dark:text-white">
          {property.address}
        </h3>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400">Value:</span>
          <span className="font-medium text-slate-900 dark:text-white">
            ${property.value.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400">Documents:</span>
          <span className="flex items-center gap-1 text-slate-900 dark:text-white">
            <FileText className="w-4 h-4" />
            {property.documents.length}
          </span>
        </div>
      </div>
    </div>
  );
}
