'use client';

import { BookOpen, FileText, Plus, Upload } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';

// Mock sub-components
const CitationLibrary = () => (
  <Card>
    <CardHeader>
      <CardTitle>Citation Library</CardTitle>
      <CardDescription>View and manage your saved legal citations.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
        <BookOpen className="h-10 w-10 mb-3 opacity-50" />
        <p>No citations found in library</p>
        <Button variant="outline" className="mt-4">Import Citations</Button>
      </div>
    </CardContent>
  </Card>
);

const BriefAnalyzer = () => (
  <Card>
    <CardHeader>
      <CardTitle>Brief Analyzer</CardTitle>
      <CardDescription>Upload a legal brief to extract and validate citations.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
        <Upload className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-1">Upload Brief</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          Drag and drop your PDF or DOCX file here, or click to browse.
          We&apos;ll analyze formatting and validity.
        </p>
        <Button>
          Select File
        </Button>
      </div>
    </CardContent>
  </Card>
);

export function CitationManager() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Tabs defaultValue="library" className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b px-6 py-4 bg-background z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Citation Manager</h1>
              <p className="text-muted-foreground">Manage legal citations and analyze briefs with Bluebook formatting.</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Citation
            </Button>
          </div>

          <TabsList>
            <TabsTrigger value="library" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Citation Library
            </TabsTrigger>
            <TabsTrigger value="analyzer" className="gap-2">
              <FileText className="w-4 h-4" />
              Brief Analyzer
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-muted/10">
          <TabsContent value="library" className="mt-0 space-y-4">
            <CitationLibrary />
          </TabsContent>
          <TabsContent value="analyzer" className="mt-0 space-y-4">
            <BriefAnalyzer />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
