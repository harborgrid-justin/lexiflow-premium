'use client';

/**
 * Case List Component - Client Component
 * Displays list of cases with filtering and sorting
 */

import { DataService } from '@/services/data/dataService';
import { Case, CaseStatus, MatterPriority } from '@/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/shadcn/badge';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Loader2 } from 'lucide-react';

const statusVariants: Record<CaseStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [CaseStatus.Active]: 'default',
  [CaseStatus.Open]: 'default',
  [CaseStatus.Pending]: 'secondary',
  [CaseStatus.Discovery]: 'outline',
  [CaseStatus.Trial]: 'destructive',
  [CaseStatus.Settled]: 'secondary',
  [CaseStatus.Closed]: 'outline',
  [CaseStatus.Archived]: 'outline',
  [CaseStatus.OnHold]: 'secondary',
  [CaseStatus.PreFiling]: 'outline',
  [CaseStatus.Appeal]: 'destructive',
  [CaseStatus.Transferred]: 'outline',
};

const priorityVariants: Record<MatterPriority, "default" | "secondary" | "destructive" | "outline"> = {
  [MatterPriority.LOW]: 'outline',
  [MatterPriority.MEDIUM]: 'secondary',
  [MatterPriority.HIGH]: 'default',
  [MatterPriority.URGENT]: 'destructive',
};

export function CaseList() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCases() {
      try {
        const data = await DataService.cases.getAll();
        setCases(data || []);
      } catch (error) {
        console.error('Failed to fetch cases:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCases();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No cases found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cases.map((caseItem) => (
        <Link
          key={caseItem.id}
          href={`/cases/${caseItem.id}`}
          className="block group"
        >
          <Card className="transition-colors hover:bg-muted/50 hover:border-primary/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {caseItem.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {caseItem.caseNumber}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={statusVariants[caseItem.status] || 'outline'}>
                    {caseItem.status}
                  </Badge>
                  <Badge variant={priorityVariants[caseItem.priority] || 'outline'}>
                    {caseItem.priority}
                  </Badge>
                </div>
              </div>

              {caseItem.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {caseItem.description}
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
