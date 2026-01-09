'use client';

import { Activity, Database, FileText, Link, Lock, Server, Shield, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { Badge } from '@/components/ui/shadcn/badge';
import { Switch } from '@/components/ui/shadcn/switch';
import { Label } from '@/components/ui/shadcn/label';

// Mock Sub-components
const AdminHierarchy = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-medium">Organization Hierarchy</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-blue-500" size={20} />
            <h4 className="font-medium">Headquarters</h4>
          </div>
          <div className="pl-8 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
              <span>Legal Department</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
              <span>HR Department</span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminSecurity = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-emerald-500" size={24} />
            <h3 className="text-lg font-medium">Security Score</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-600">98/100</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="text-blue-500" size={24} />
            <h3 className="text-lg font-medium">Active Sessions</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">42</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-amber-500" size={24} />
            <h3 className="text-lg font-medium">Failed Logins</h3>
          </div>
          <p className="text-3xl font-bold text-amber-600">3</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const AdminDatabase = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-medium">Database Management</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
          <div className="flex items-center gap-3 mb-4">
            <Server className="text-blue-500" size={24} />
            <div>
              <h4 className="font-medium">Primary Database</h4>
              <p className="text-sm text-muted-foreground">PostgreSQL 15.4</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="text-emerald-600 font-medium">Healthy</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Size</span>
              <span className="font-medium">4.2 GB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Connections</span>
              <span className="font-medium">128</span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminLogs = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-medium">System Logs</CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>User</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell className="text-muted-foreground">2024-01-02 10:{30 + i}:00</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                  INFO
                </Badge>
              </TableCell>
              <TableCell>User login successful</TableCell>
              <TableCell className="text-muted-foreground">admin@lexiflow.com</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

const AdminIntegrations = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-medium">Integrations</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['Google Drive', 'Microsoft 365', 'Slack', 'Zoom', 'QuickBooks'].map((app) => (
          <div key={app} className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Link size={20} className="text-muted-foreground" />
              </div>
              <Label htmlFor={`toggle-${app}`} className="font-medium cursor-pointer">{app}</Label>
            </div>
            <Switch id={`toggle-${app}`} />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function AdminPanel({ initialHealth, initialUsersCount }: { initialHealth?: any; initialUsersCount?: number }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground">System settings, security audits, and data management.</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="hierarchy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hierarchy" className="flex items-center gap-2">
            <Users size={16} />
            Hierarchy
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield size={16} />
            Security
          </TabsTrigger>
          <TabsTrigger value="db" className="flex items-center gap-2">
            <Database size={16} />
            Database
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText size={16} />
            Logs
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link size={16} />
            Integrations
          </TabsTrigger>
        </TabsList>

        <div className="min-h-[400px]">
          <TabsContent value="hierarchy">
            <AdminHierarchy />
          </TabsContent>
          <TabsContent value="security">
            <AdminSecurity />
          </TabsContent>
          <TabsContent value="db">
            <AdminDatabase />
          </TabsContent>
          <TabsContent value="logs">
            <AdminLogs />
          </TabsContent>
          <TabsContent value="integrations">
            <AdminIntegrations />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
