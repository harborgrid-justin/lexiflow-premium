import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Case } from '@/types';

interface CaseOverviewProps {
  caseData: Case;
}

export function CaseOverview({ caseData }: CaseOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {caseData.description ? (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {caseData.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No description available.</p>
        )}
      </CardContent>
    </Card>
  );
}
