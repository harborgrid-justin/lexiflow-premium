/**
 * Correspondence Threads Page
 * View and manage email/letter threads and conversation history.
 */

import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Input } from '@/components/ui/shadcn/input';
import { Separator } from '@/components/ui/shadcn/separator';
import { ChevronRight, Mail, MessageSquare, Search, User } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Message Threads | LexiFlow',
  description: 'View correspondence history and threads',
};

export default function CorrespondenceThreadsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Message Threads</h1>
          <p className="text-muted-foreground">Track communication history across all matters.</p>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search threads, subjects, or participants..." className="pl-9" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {i % 2 === 0 ? (
                    <Mail className="h-5 w-5 text-blue-500" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Re: Settlement Proposal - Smith v. Jones</span>
                      <Badge variant="outline" className="text-xs">25-1229</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {i === 1 ? 'Just now' : `${i} hrs ago`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>John Doe, Jane Smith (Opposing Counsel)</span>
                  </div>
                  <p className="text-sm line-clamp-2 text-muted-foreground mt-2">
                    Please see the attached revised settlement agreement reflecting the changes discussed in our teleconference yesterday. We believe this accurately captures the terms...
                  </p>
                </div>
                <div className="flex items-center self-center">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
