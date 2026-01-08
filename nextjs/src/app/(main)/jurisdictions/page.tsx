/**
 * Jurisdictions Page
 * Manage court jurisdictions, rules, and local requirements.
 */

import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Input } from '@/components/ui/shadcn/input';
import { AlertCircle, BookOpen, MapPin, Scale, Search } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jurisdictions | LexiFlow',
  description: 'Manage court jurisdictions and rules',
};

export default function JurisdictionsPage() {
  const jurisdictions = [
    { name: 'US District Court, S.D.N.Y.', type: 'Federal', location: 'New York, NY', rules: 'Updated 2025' },
    { name: 'California Superior Court, Los Angeles', type: 'State', location: 'Los Angeles, CA', rules: 'Updated 2024' },
    { name: 'Delaware Court of Chancery', type: 'State', location: 'Wilmington, DE', rules: 'Updated 2025' },
    { name: 'US Court of Appeals, 9th Circuit', type: 'Federal Appellate', location: 'San Francisco, CA', rules: 'Updated 2025' },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jurisdictions</h1>
          <p className="text-muted-foreground">Database of supported courts and local rules.</p>
        </div>
        <Button variant="outline">
          Update Rules Database
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search courts..." className="pl-9" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {jurisdictions.map((court, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{court.name}</CardTitle>
                    <CardDescription>{court.type}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">{court.rules}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{court.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span className="underline cursor-pointer hover:text-primary">View Local Rules</span>
                </div>
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">Holiday closure approaching (Jan 15)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
