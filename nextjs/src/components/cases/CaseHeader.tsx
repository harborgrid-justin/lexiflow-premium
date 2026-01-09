/**
 * Case Header Component - Server Component
 * Displays case header information
 */

import { formatDate } from '@/lib/utils';
import { Case } from '@/types';
import { Calendar, MapPin, User, Edit } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent } from '@/components/ui/shadcn/card';

interface CaseHeaderProps {
  caseData: Case;
}

export function CaseHeader({ caseData }: CaseHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {caseData.title}
              </h1>
            </div>
            <p className="text-muted-foreground font-medium">
              {caseData.caseNumber}
            </p>
          </div>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Case
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {caseData.court && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
              <MapPin className="h-4 w-4" />
              <span>
                {caseData.court}
              </span>
            </div>
          )}
          {caseData.filingDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
              <Calendar className="h-4 w-4" />
              <span>
                Filed: {formatDate(caseData.filingDate)}
              </span>
            </div>
          )}
          {caseData.assignedTo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
              <User className="h-4 w-4" />
              <span>
                Assigned to: {caseData.assignedTo}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
