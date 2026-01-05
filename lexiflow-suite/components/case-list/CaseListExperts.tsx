
import React from 'react';
import { Badge } from '../common/Badge.tsx';
import { Button } from '../common/Button.tsx';
import { Skeleton } from '../common/Primitives.tsx';

interface CaseListExpertsProps {
  isLoading?: boolean;
}

export const CaseListExperts: React.FC<CaseListExpertsProps> = ({ isLoading = false }) => {
  const experts = [
    { id: 1, name: 'Dr. Emily Chen', field: 'Forensic Accounting', rating: 4.8, rate: '$450/hr', cases: 3 },
    { id: 2, name: 'Mark Watney', field: 'Botany / Environmental', rating: 5.0, rate: '$600/hr', cases: 1 },
    { id: 3, name: 'Sarah Connor', field: 'Security & Ballistics', rating: 4.9, rate: '$550/hr', cases: 5 },
  ];

  if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="space-y-2 mb-4">
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-8 w-full rounded" />
                </div>
            ))}
        </div>
      );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {experts.map(exp => (
        <div key={exp.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700 text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              {exp.name.charAt(0)}
            </div>
            <Badge variant="success">{exp.rating} ★</Badge>
          </div>
          <h3 className="font-bold text-lg text-slate-900">{exp.name}</h3>
          <p className="text-sm text-blue-600 font-medium mb-2">{exp.field}</p>
          <div className="text-sm text-slate-500 space-y-1">
            <p>Rate: <span className="font-semibold text-slate-700">{exp.rate}</span></p>
            <p>Prior Firm Cases: {exp.cases}</p>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">View CV & Conflicts</Button>
        </div>
      ))}
    </div>
  );
};
