/**
 * CRM Client Detail Page
 * Detailed view of a client including cases, contacts, and billing status.
 *
 * Server Component with real data fetching.
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/shadcn/avatar';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Briefcase, Calendar, DollarSign, Edit, Mail, MapPin, Phone } from 'lucide-react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Client Details | LexiFlow',
  description: 'View client profile and history',
};

interface ClientPageProps {
  params: Promise<{ id: string }>;
}

interface Client {
  id: string;
  name: string;
  status: string;
  type: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  since: string;
  outstandingBalance: number;
  trustBalance: number;
  cases: {
    id: string;
    title: string;
    docketNumber: string;
    type: string;
  }[];
}

export default async function ClientDetailPage({ params }: ClientPageProps) {
  const { id } = await params;
  let client: Client;

  try {
    client = await apiFetch<Client>(API_ENDPOINTS.CLIENTS.DETAIL(id));
  } catch (error) {
    console.error("Failed to fetch client:", error);
    // In production, we might want to show a fallback or notFound
    // For now, let's assume if it fails, it's not found
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback className="text-2xl">{client.name?.substring(0, 2).toUpperCase() || 'CX'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{client.name}</h1>
              <Badge>{client.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                <span>{client.type}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{client.city}, {client.state}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Client since {client.since ? new Date(client.since).getFullYear() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
        <Button>
          <Edit className="h-4 w-4 mr-2" /> Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Contact Info & Stats */}
        <div className="col-span-12 md:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase">Outstanding Balance</span>
                <div className="text-2xl font-bold flex items-center text-red-600">
                  <DollarSign className="h-5 w-5" /> {client.outstandingBalance?.toLocaleString() || "0.00"}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase">Trust Balance</span>
                <div className="text-2xl font-bold flex items-center text-green-600">
                  <DollarSign className="h-5 w-5" /> {client.trustBalance?.toLocaleString() || "0.00"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabs */}
        <div className="col-span-12 md:col-span-8">
          <Tabs defaultValue="cases">
            <TabsList>
              <TabsTrigger value="cases">Active Cases</TabsTrigger>
              <TabsTrigger value="billing">Invoices</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="cases" className="mt-4">
              <div className="grid gap-4">
                {client.cases && client.cases.length > 0 ? client.cases.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg">{c.title}</div>
                        <div className="text-sm text-muted-foreground">Case #{c.docketNumber} • {c.type}</div>
                      </div>
                      <Button variant="outline" size="sm">View Case</Button>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center p-4 text-muted-foreground">No active cases found.</div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="billing" className="mt-4">
              <div className="text-sm text-muted-foreground">Billing history for ID: {id}</div>
            </TabsContent>
            <TabsContent value="notes" className="mt-4">
              <div className="text-sm text-muted-foreground">Notes for ID: {id}</div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
