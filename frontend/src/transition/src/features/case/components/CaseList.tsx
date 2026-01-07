/**
 * Case List Component
 *
 * Displays a list of cases fetched from the backend.
 */

import { useState } from 'react';
import { useCases } from '../hooks/useCases';

export function CaseList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useCases({ page, limit: 10 });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading cases...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-lg">
        <h3 className="text-lg font-semibold">Error loading cases</h3>
        <p>{(error as Error).message}</p>
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        <p>No cases found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Cases</h1>
        <div className="text-sm text-slate-500">
          Total: {data.meta.total}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Number</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Updated</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {data.data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.caseNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${item.status === 'open' ? 'bg-green-100 text-green-800' :
                      item.status === 'closed' ? 'bg-slate-100 text-slate-800' :
                        'bg-blue-100 text-blue-800'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center py-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-slate-600">
          Page {data.meta.page} of {Math.max(1, data.meta.lastPage)}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!data.meta.hasNextPage}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
