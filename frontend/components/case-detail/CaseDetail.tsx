/**
 * CaseDetail.tsx
 * 
 * Main case detail view component - lazy-loaded for code splitting.
 * Displays case information with beautiful skeleton loaders for content sections.
 */

import React from 'react';
import { AlertTriangle, Clock, ArrowLeft } from 'lucide-react';
import { Case } from '../../types';

interface CaseDetailProps {
  caseData: Case;
  onClose?: () => void;
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

/**
 * CaseDetail - Main case detail view with skeleton loaders
 * 
 * Shows actual case data in header with loading placeholders for detail sections.
 * TODO: Implement full case detail tabs (documents, timeline, billing, etc.)
 */
export const CaseDetail: React.FC<CaseDetailProps> = ({ caseData, onClose }) => {
  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header with actual case data */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          {onClose && (
            <button 
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cases
            </button>
          )}
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium">
            <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse" />
            {caseData.status}
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">{caseData.title}</h1>
          <p className="text-blue-100 text-sm font-mono">{caseData.caseNumber}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-blue-200 mb-1">Client</div>
            <div className="font-semibold">{caseData.client}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-blue-200 mb-1">Court</div>
            <div className="font-semibold">{caseData.court}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-blue-200 mb-1">Jurisdiction</div>
            <div className="font-semibold truncate">{caseData.jurisdiction}</div>
          </div>
        </div>
      </div>

      {/* Content area with skeleton loaders */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Command Center Skeleton */}
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>

          {/* Critical Alerts Placeholder */}
          <div className="bg-white rounded-lg shadow-sm border border-amber-200">
            <div className="p-4 border-b border-amber-100 bg-amber-50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h2 className="font-bold text-slate-900">Critical Alerts</h2>
                <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                  Loading...
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline/Activity Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-600" />
                <h2 className="font-bold text-slate-900">Recent Activity</h2>
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    {i < 4 && <div className="w-px h-12 bg-slate-200 my-2" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents Grid Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-900">Documents & Evidence</h2>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <Skeleton className="h-32 w-full rounded" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CaseDetail;