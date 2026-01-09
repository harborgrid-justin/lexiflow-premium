'use client';

import { DataService } from '@/services/data/dataService';
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

type DiscoveryView =
  | 'dashboard' | 'requests' | 'depositions' | 'examinations'
  | 'custodians' | 'esi' | 'productions' | 'interviews'
  | 'privilege' | 'holds' | 'collections' | 'processing'
  | 'review' | 'timeline' | 'plan' | 'doc_viewer' | 'response' | 'production_wizard';

interface DiscoveryPlatformProps {
  initialTab?: DiscoveryView;
  caseId?: string;
}

const DiscoveryDashboard = ({ onNavigate }: { onNavigate: (view: DiscoveryView) => void }) => {
  const [stats, setStats] = useState({ requests: 0, deadlines: 0, holds: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Use DataService to fetch all discovery items
        // The service returns a generic list, so we filter by type
        const allDiscoveryItems = await DataService.discovery.getAll();

        // Safety check for array
        const items = Array.isArray(allDiscoveryItems) ? allDiscoveryItems : [];

        // Filter for specific categories (assuming 'type' or similar property exists)
        // If specific types are not yet strictly defined, we fallback to defaults
        const requests = items.filter((i: any) => i.type === 'Request' || i.category === 'Request');
        const deadlines = items.filter((i: any) => i.dueDate && new Date(i.dueDate) > new Date());
        const holds = items.filter((i: any) => i.status === 'Active' && (i.type === 'LegalHold' || i.isHold));

        setStats({
          requests: requests.length,
          deadlines: deadlines.length,
          holds: holds.length
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Discovery Dashboard</h2>
        <Button onClick={() => onNavigate('requests')}>View All Requests</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Pending Requests</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.requests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Upcoming Deadlines</h3>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.deadlines}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Active Holds</h3>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.holds}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const PlaceholderComponent = ({ title }: { title: string }) => (
  <div className="p-6 flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg border-muted">
    <h3 className="text-xl font-semibold text-muted-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground mt-2">Component under construction or loading data...</p>
  </div>
);

export default function DiscoveryPlatform({ initialTab = 'dashboard', caseId }: DiscoveryPlatformProps) {
  const [activeTab, setActiveTab] = useState<DiscoveryView>(initialTab);
  const [contextId, setContextId] = useState<string | null>(null);

  const handleNavigate = (targetView: DiscoveryView, id?: string) => {
    if (id) setContextId(id);
    setActiveTab(targetView);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DiscoveryDashboard onNavigate={handleNavigate} />;
      default: return <PlaceholderComponent title={`Discovery: ${activeTab}${contextId ? ` / ${contextId}` : ''}`} />;
    }
  };

  return (
    <div className="p-6">
      {renderContent()}
    </div>
  );
}
