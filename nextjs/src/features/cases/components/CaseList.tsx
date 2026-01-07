'use client';

import Link from 'next/link';
import { Case } from '@/lib/dal/cases'; // Assuming type is exported
import { BriefcaseIcon, CalendarIcon, ChevronRightIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CaseListProps {
  cases: Case[];
}

export function CaseList({ cases }: CaseListProps) {
  if (cases.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg dark:border-slate-800">
        <BriefcaseIcon className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">No cases</h3>
        <p className="mt-1 text-sm text-slate-500">Get started by creating a new case.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <ul role="list" className="divide-y divide-slate-200 dark:divide-slate-800">
        {cases.map((caseItem) => (
          <li key={caseItem.id}>
            <Link href={`/cases/${caseItem.id}`} className="block hover:bg-slate-50 dark:hover:bg-slate-800/50 transition duration-150 ease-in-out">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="truncate text-sm font-medium text-blue-600 dark:text-blue-400">
                    {caseItem.title}
                    <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">
                      #{caseItem.caseNumber}
                    </span>
                  </div>
                  <div className="ml-2 flex flex-shrink-0">
                    <Badge variant={caseItem.status === 'Active' ? 'default' : 'secondary'}>
                      {caseItem.status}
                    </Badge>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <BriefcaseIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
                      {caseItem.description || 'No description'}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0 dark:text-slate-400">
                    <CalendarIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
                    <p>
                      Updated <time dateTime={caseItem.updatedAt}>{new Date(caseItem.updatedAt).toLocaleDateString()}</time>
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
