'use client';

import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { cn } from '@/lib/utils';
import { CaseStatus, MatterPriority } from '@/types';
import { useState } from 'react';

export function CaseFilters() {
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | 'ALL'>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<MatterPriority | 'ALL'>('ALL');

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Filter */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Status</h3>
          <div className="flex flex-col space-y-1">
            {['ALL', ...Object.values(CaseStatus)].map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "secondary" : "ghost"}
                className={cn(
                  "justify-start h-8 px-3 font-normal text-start",
                  selectedStatus === status && "bg-secondary font-medium"
                )}
                onClick={() => setSelectedStatus(status as CaseStatus | 'ALL')}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Priority</h3>
          <div className="flex flex-col space-y-1">
            {['ALL', ...Object.values(MatterPriority)].map((priority) => (
              <Button
                key={priority}
                variant={selectedPriority === priority ? "secondary" : "ghost"}
                className={cn(
                  "justify-start h-8 px-3 font-normal text-start",
                  selectedPriority === priority && "bg-secondary font-medium"
                )}
                onClick={() => setSelectedPriority(priority as MatterPriority | 'ALL')}
              >
                {priority}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
