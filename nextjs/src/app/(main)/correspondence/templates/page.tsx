/**
 * Correspondence Templates Page
 * Manage standardized legal document templates.
 */

import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Input } from '@/components/ui/shadcn/input';
import { Copy, FileText, MoreHorizontal, Plus, Search } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Correspondence Templates | LexiFlow',
  description: 'Manage legal document templates',
};

export default function TemplatesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">Standardized templates for letters, emails, and memos.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> New Template
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates..." className="pl-9" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {['Demand Letter', 'Representation Agreement', 'status Update Email', 'Conflict Waiver', 'Notice of Appearance', 'Closing Letter'].map((title, i) => (
          <Card key={i} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              <CardTitle className="text-base mb-2">{title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-3">
                Standard form {title.toLowerCase()} compliant with firm branding and latest regulations.
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="secondary" className="w-full">
                <Copy className="h-4 w-4 mr-2" /> Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
