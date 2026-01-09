'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { Clock, FileText, LayoutTemplate } from 'lucide-react';
import { DocumentExplorer } from './DocumentExplorer';
import { DocumentTemplates } from './DocumentTemplates';
import { RecentFiles } from './RecentFiles';

export function DocumentManager() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Tabs defaultValue="browse" className="w-full h-full flex flex-col">
        <div className="border-b px-4">
          <TabsList className="w-full justify-start h-12 bg-transparent p-0">
            <TabsTrigger value="browse" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 gap-2">
              <FileText className="w-4 h-4" />
              Browse Files
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 gap-2">
              <Clock className="w-4 h-4" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 gap-2">
              <LayoutTemplate className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden p-4">
          <TabsContent value="browse" className="h-full mt-0 border-0 p-0">
            <DocumentExplorer />
          </TabsContent>
          <TabsContent value="recent" className="h-full mt-0 border-0 p-0">
            <RecentFiles />
          </TabsContent>
          <TabsContent value="templates" className="h-full mt-0 border-0 p-0">
            <DocumentTemplates />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
