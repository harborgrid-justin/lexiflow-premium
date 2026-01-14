/**
 * Practice Domain - View Component
 */

import { PageHeader } from '@/shared/ui/organisms/PageHeader';
import { Briefcase, Users } from 'lucide-react';
import { useId } from 'react';
import { usePractice } from './PracticeProvider';

export function PracticeView() {
  const { areas, searchTerm, setSearchTerm, isPending } = usePractice();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Practice Areas"
        subtitle="Legal practice specializations"
      />

      <div className="px-4 pb-4">
        <label htmlFor={searchId} className="sr-only">Search practice areas</label>
        <input
          id={searchId}
          type="search"
          placeholder="Search practice areas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        {isPending && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {!isPending && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {areas.map(area => (
              <PracticeAreaCard key={area.id} area={area} />
            ))}
            {areas.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">
                No practice areas found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type PracticeArea = {
  id: string;
  name: string;
  category: string;
  activeCases: number;
  specialists: string[];
  description: string;
};

function PracticeAreaCard({ area }: { area: PracticeArea }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
            {area.name}
          </h3>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {area.category}
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
        {area.description}
      </p>
      <div className="flex items-center justify-between text-sm">
        <div className="text-slate-600 dark:text-slate-400">
          {area.activeCases} active cases
        </div>
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <Users className="w-4 h-4" />
          {area.specialists.length}
        </div>
      </div>
    </div>
  );
}
