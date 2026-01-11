'use client';

import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { cn } from '@/lib/utils';
import { CaseStatus, MatterType } from '@/types';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Loader2 } from 'lucide-react';

export function CaseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'ALL') {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      params.delete('page');
      return params.toString();
    },
    [searchParams]
  );

  const handleFilter = (key: string, value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString(key, value)}`);
    });
  };

  const currentStatus = searchParams.get('status') || 'ALL';
  const currentType = searchParams.get('type') || 'ALL';

  return (
    <Card className="h-full relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 flex items-center justify-center z-10 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
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
                variant={currentStatus === status ? "secondary" : "ghost"}
                className={cn(
                  "justify-start h-8 px-3 font-normal text-start",
                  currentStatus === status && "bg-secondary font-medium"
                )}
                onClick={() => handleFilter('status', status)}
              >
                {status.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Matter Type Filter */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Matter Type</h3>
          <div className="flex flex-col space-y-1">
            {['ALL', ...Object.values(MatterType)].map((type) => (
              <Button
                key={type}
                variant={currentType === type ? "secondary" : "ghost"}
                className={cn(
                  "justify-start h-8 px-3 font-normal text-start",
                  currentType === type && "bg-secondary font-medium"
                )}
                onClick={() => handleFilter('type', type)}
              >
                {type.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
