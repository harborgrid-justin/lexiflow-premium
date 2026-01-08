/**
 * Discovery Production Page
 * Manage document productions, bates stamping, and export packages.
 */

import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Input } from '@/components/ui/shadcn/input';
import { Separator } from '@/components/ui/shadcn/separator';
import { Download, FileArchive, Plus, Search } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discovery Production | LexiFlow',
  description: 'Manage document productions and exports',
};

export default function DiscoveryProductionPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Production</h1>
          <p className="text-muted-foreground">Manage and export document productions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Production
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search productions..." className="pl-9" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder Production Cards */}
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vol. 00{i} - Initial Disclosure</CardTitle>
              <FileArchive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,24{i} Docs</div>
              <p className="text-xs text-muted-foreground">Produced on Dec {10 + i}, 2025</p>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm" className="w-full">
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
