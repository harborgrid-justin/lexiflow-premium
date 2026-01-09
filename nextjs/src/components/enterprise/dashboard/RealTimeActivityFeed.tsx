'use client';

import { DataService } from '@/services/data/dataService';
import { Activity, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';

// Redundant but kept for file structure consistency, implemented with real data
export function RealTimeActivityFeed() {
    const [activities, setActivities] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
             setLoading(true);
             try {
                // Use DataService to get generic recent activity
                // e.g. from CRM or Cases
                const crm = DataService.crm as unknown;
                const recents = crm.getRecentActivities ? await crm.getRecentActivities() : [];
                setActivities(recents);
             } catch(e) {
                 console.error(e);
             } finally {
                 setLoading(false);
             }
        }
        load();
    }, []);

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <Card className="h-full">
             <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Enterprise Live Feed</CardTitle>
             </CardHeader>
             <CardContent>
                 <div className="space-y-4">
                     {activities.length === 0 && <p className="text-muted-foreground">No recent enterprise activity.</p>}
                     {activities.map((a: unknown, i) => (
                         <div key={i} className="flex justify-between items-center border-b pb-2">
                             <span>{a.description || 'System Update'}</span>
                             <span className="text-xs text-muted-foreground">{a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : 'Just now'}</span>
                         </div>
                     ))}
                 </div>
             </CardContent>
        </Card>
    );
}

export default RealTimeActivityFeed;
