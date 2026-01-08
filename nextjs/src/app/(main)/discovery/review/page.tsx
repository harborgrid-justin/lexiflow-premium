/**
 * Discovery Review Page
 * Document review interface with tagging, redaction, and privilege logging.
 */

import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { CheckCircle, Eye, Flag, ShieldAlert } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Document Review | LexiFlow',
  description: 'Review, tag, and redact documents',
};

export default function DiscoveryReviewPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Document Review</h1>
          <p className="text-sm text-muted-foreground">Case: Smith v. Jones (25-1229)</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-8">Batch: 001 (In Progress)</Badge>
          <Button size="sm">Complete Batch</Button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-12 gap-4">
        {/* Document List / Grid */}
        <div className="col-span-3 border-r pr-4">
          <div className="mb-4 font-semibold">Documents (45/100)</div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex cursor-pointer items-center justify-between rounded-md border p-2 hover:bg-muted">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">DOC-000{i}.pdf</span>
                  <span className="text-xs text-muted-foreground">Email • 1.2 MB</span>
                </div>
                {i % 2 === 0 && <CheckCircle className="h-4 w-4 text-green-500" />}
              </div>
            ))}
          </div>
        </div>

        {/* Viewer Area */}
        <div className="col-span-6 flex items-center justify-center rounded-md border bg-muted/20">
          <div className="text-center text-muted-foreground">
            <Eye className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>Select a document to preview</p>
            <p className="text-xs">(Viewer Integration Placeholder)</p>
          </div>
        </div>

        {/* Coding Panel */}
        <div className="col-span-3 pl-4">
          <Tabs defaultValue="coding">
            <TabsList className="w-full">
              <TabsTrigger value="coding" className="flex-1">Coding</TabsTrigger>
              <TabsTrigger value="metadata" className="flex-1">Metadata</TabsTrigger>
            </TabsList>
            <TabsContent value="coding" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Relevance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Responsive
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Flag className="mr-2 h-4 w-4 text-slate-500" /> Non-Responsive
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Privilege</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <ShieldAlert className="mr-2 h-4 w-4 text-red-500" /> Attorney-Client
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ShieldAlert className="mr-2 h-4 w-4 text-orange-500" /> Work Product
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="metadata">
              <div className="text-sm text-muted-foreground">Metadata fields will appear here.</div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
