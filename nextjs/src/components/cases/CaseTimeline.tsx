'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";

interface CaseTimelineProps {
  caseId: string;
}

export function CaseTimeline({ caseId }: CaseTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>Timeline for case {caseId}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Timeline content would go here */}
        <p className="text-sm text-muted-foreground">No events recorded yet.</p>
      </CardContent>
    </Card>
  );
}
