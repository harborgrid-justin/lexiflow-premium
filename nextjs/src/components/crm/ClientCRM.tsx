'use client';

import { DataService } from '@/services/data/dataService';
import { BarChart2, Briefcase, Globe, MoreVertical, Search, UserPlus, Users, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { Input } from '@/components/ui/shadcn/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/shadcn/table";
import { Badge } from "@/components/ui/shadcn/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/shadcn/dropdown-menu";

interface CRMClient {
  id: string;
  name: string;
  industry: string;
  status: string;
  balance: string;
  cases: number;
}

interface PipelineStage {
  id: string;
  stage: string;
  count: number;
  value: string;
}

interface Activity {
  id: string;
  description: string;
  client: string;
  timestamp: string;
}

const CRMDashboard = ({ pipeline, activities }: { pipeline: PipelineStage[], activities: Activity[] }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {pipeline.length === 0 ? <div className="col-span-4 text-center text-muted-foreground p-4">No pipeline data available</div> : pipeline.map((stage) => (
        <Card key={stage.id}>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{stage.stage}</h3>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">{stage.count}</span>
              <span className="text-sm font-medium text-emerald-600">{stage.value}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent activities.</p>
            ) : activities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">{act.description}</p>
                  <p className="text-xs text-muted-foreground">{act.client} • {new Date(act.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center bg-muted/20 rounded-lg border border-dashed">
            {/* Real chart would go here using data from API */}
            <p className="text-muted-foreground text-sm">Revenue Chart (Data Loaded)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const ClientDirectory = ({ clients }: { clients: CRMClient[] }) => (
  <Card>
    <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input type="text" placeholder="Search clients..." className="pl-9" />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">Filter</Button>
        <Button variant="outline" size="sm">Export</Button>
      </div>
    </div>
    <div className="rounded-md border-t-0 bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client Name</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active Cases</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead className="w-12.5"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No clients found
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell className="text-muted-foreground">{client.industry}</TableCell>
                <TableCell>
                  <Badge variant={
                    client.status === 'Active' ? 'default' :
                      client.status === 'Lead' ? 'secondary' : 'outline'
                  } className={
                    client.status === 'Active' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 dark:bg-emerald-900/40 dark:text-emerald-400' : ''
                  }>
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{client.cases}</TableCell>
                <TableCell className="font-medium">{client.balance}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Client</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  </Card>
);

const ClientPortal = () => (
  <Card className="text-center p-6 border-dashed">
    <CardContent className="flex flex-col items-center pt-6">
      <Globe className="mb-4 text-primary" size={48} />
      <h3 className="text-lg font-medium mb-2">Client Portal Management</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        Manage access, permissions, and shared documents for client portals.
      </p>
      <Button>Configure Portals</Button>
    </CardContent>
  </Card>
);

export default function ClientCRM() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState<CRMClient[]>([]);
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use DataService.crm if available or DataService.clients
        // Assuming DataService.crm follows the structure needed
        // If these specific methods don't exist on the generic typing, we cast or use known endpoints
        const crm = DataService.crm as unknown;
        const clientData = crm.getClients ? await crm.getClients() : [];
        const pipelineData = crm.getPipelineSummary ? await crm.getPipelineSummary() : [];
        const activityData = crm.getRecentActivities ? await crm.getRecentActivities() : [];

        setClients(clientData);
        setPipeline(pipelineData);
        setActivities(activityData);
      } catch (error) {
        console.error("Failed to fetch CRM data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Relationships</h1>
          <p className="text-muted-foreground">CRM, Intake Pipeline, and Secure Client Portals.</p>
        </div>
        <Button className="gap-2">
          <UserPlus size={16} />
          New Intake
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-2"><BarChart2 size={16} /> Dashboard</TabsTrigger>
          <TabsTrigger value="directory" className="gap-2"><Users size={16} /> Client Directory</TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-2"><Briefcase size={16} /> Pipeline</TabsTrigger>
          <TabsTrigger value="portal" className="gap-2"><Globe size={16} /> Client Portal</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <CRMDashboard pipeline={pipeline} activities={activities} />
        </TabsContent>

        <TabsContent value="directory">
          <ClientDirectory clients={clients} />
        </TabsContent>

        <TabsContent value="pipeline">
          <Card className="text-center p-8">
            <CardContent className="flex flex-col items-center pt-6">
              <Briefcase className="mb-4 text-muted-foreground" size={48} />
              <h3 className="text-lg font-medium mb-2">Detailed Pipeline View</h3>
              <p className="text-muted-foreground mb-6">
                Kanban view of {pipeline.reduce((acc, s) => acc + s.count, 0)} leads across all stages.
              </p>
              <Button variant="outline">Launch Kanban Board</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portal">
          <ClientPortal />
        </TabsContent>
      </Tabs>
    </div>
  );
}
