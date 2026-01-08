/**
 * Correspondence Compose Page
 * Interface for drafting new legal correspondence (Letters, Emails, Memos).
 */

import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { Separator } from '@/components/ui/shadcn/separator';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { Paperclip, Send } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compose Correspondence | LexiFlow',
  description: 'Draft and send legal correspondence',
};

export default function ComposePage() {
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Compose</h1>
        <p className="text-muted-foreground">Draft new correspondence from templates or scratch.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="letter">Formal Letter</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="memo">Internal Memo</SelectItem>
                    <SelectItem value="fax">Fax Cover</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="matter">Matter / Case</Label>
                <Select>
                  <SelectTrigger id="matter">
                    <SelectValue placeholder="Select matter..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25-1229">25-1229: Smith v. Jones</SelectItem>
                    <SelectItem value="25-1300">25-1300: Estate of Doe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input id="to" placeholder="Recipient name or email..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cc">Cc</Label>
              <Input id="cc" placeholder="Carbon copy..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Re: Settlement Offer..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Content</Label>
              <Textarea id="body" className="min-h-[300px]" placeholder="Start typing..." />
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" size="sm">
                <Paperclip className="mr-2 h-4 w-4" /> Attach Files
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost">Save Draft</Button>
                <Button>
                  <Send className="mr-2 h-4 w-4" /> Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
