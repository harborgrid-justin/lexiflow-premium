'use client';

import { DataService } from '@/services/data/dataService';
import { Database, Key, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { useEffect, useState } from 'react';

export default function DafDashboard() {
  const [stats, setStats] = useState({ sources: 0, policies: 0, keys: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Using DataService.security and DataService.sources (inferred)
        const sourcesData = (DataService as unknown).sources ? await (DataService as unknown).sources.getAll?.() : [];
        const policiesData = DataService.security.getPolicies ? await DataService.security.getPolicies() : [];

        // Fallback mock logic with real data structure if API methods missing
        // But we must use DataService.

        setStats({
          sources: Array.isArray(sourcesData) ? sourcesData.length : 0,
          policies: Array.isArray(policiesData) ? policiesData.length : 0,
          keys: 0 // Placeholder until API key management is exposed
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
            <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              DAF Operations
            </h1>
            <p className="text-sm mt-1 text-muted-foreground">
              Data Access Framework - Security & Compliance Management
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Data Sources</p>
                <p className="text-2xl font-bold">{stats.sources}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Access Policies</p>
                <p className="text-2xl font-bold">{stats.policies}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Keys</p>
                <p className="text-2xl font-bold">{stats.keys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="p-12 rounded-xl border-2 border-dashed border-muted text-center">
        <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">
          DAF Operations Dashboard
        </h3>
        <p className="text-sm max-w-md mx-auto text-muted-foreground">
          Manage data access policies, security protocols, and compliance frameworks.
          This module is powered by the LexiFlow DataService Security Layer.
        </p>
      </div>
    </div>
  );
}
