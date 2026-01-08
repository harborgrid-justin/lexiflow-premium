/**
 * Discovery Collections Page
 * Manage data collection from custodians and sources.
 */

import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Input } from '@/components/ui/shadcn/input';
import { Progress } from '@/components/ui/shadcn/progress';
import { CheckCircle2, Clock, HardDrive, Mail, Plus, Search, Smartphone } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Collections | LexiFlow',
  description: 'Manage data preservation and collection tasks',
};

export default function CollectionsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Collections</h1>
          <p className="text-muted-foreground">Manage custodian data sources and preservation tasks.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> New Collection
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search collections..." className="pl-9" />
        </div>
      </div>

      <div className="grid gap-6">
        {/* Active Collections */}
        <Card>
          <CardHeader>
            <CardTitle>Active Collections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { name: 'John Doe - Email Archive', source: 'Exchange Server', status: 'In Progress', progress: 45, icon: Mail },
              { name: 'Finance Dept Share Drive', source: 'Network Share', status: 'In Progress', progress: 78, icon: HardDrive },
              { name: 'Jane Smith - Mobile Device', source: 'Android/iOS', status: 'Queued', progress: 0, icon: Smartphone },
            ].map((job, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <job.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{job.name}</div>
                      <div className="text-xs text-muted-foreground">{job.source}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={job.status === 'In Progress' ? 'default' : 'secondary'}>{job.status}</Badge>
                    <span className="text-sm font-medium w-12 text-right">{job.progress}%</span>
                  </div>
                </div>
                <Progress value={job.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Completed Collections */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Completions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Q4 Financial Reports', source: 'SharePoint', size: '1.2 GB', date: 'Yesterday' },
              { name: 'HR Personnel Files', source: 'Workday API', size: '450 MB', date: '2 days ago' },
            ].map((job, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">{job.name}</div>
                    <div className="text-xs text-muted-foreground">{job.source} • {job.size}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {job.date}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
