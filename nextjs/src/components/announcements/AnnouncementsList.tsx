'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/shadcn/card';
import { Megaphone, Loader2 } from 'lucide-react';
import { DataService } from '@/services/data/dataService';
import { Badge } from '@/components/ui/shadcn/badge';

interface Announcement {
   id: string;
   title: string;
   priority: 'Critical' | 'Normal' | 'Info';
   date: string;
}

interface ApiMessage {
   id: string;
   subject?: string;
   message?: string;
   priority?: string;
   createdAt: string;
}

export const AnnouncementsList = () => {
   const [announcements, setAnnouncements] = useState<Announcement[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchAnnouncements = async () => {
         try {
            // Mapping to communication or general admin notifications
            // Use type assertion for the service response
            const data = await DataService.communication.getAll({ type: 'announcement' }) as unknown as ApiMessage[];

            // Fallback/Transform
            const mapped = (Array.isArray(data) ? data : []).map((d) => ({
               id: d.id,
               title: d.subject || d.message || 'Announcement',
               priority: (d.priority === 'Critical' || d.priority === 'Info' ? d.priority : 'Normal') as 'Critical' | 'Normal' | 'Info',
               date: d.createdAt
            }));

            // If empty, mock one for display purposes if demo mode
            if (mapped.length === 0) {
               // Optional: keep empty or add a system welcome message
            }

            setAnnouncements(mapped);
         } catch (e) {
            console.error("Failed to fetch announcements", e);
         } finally {
            setLoading(false);
         }
      };
      fetchAnnouncements();
   }, []);

   return (
      <Card className="h-full">
         <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
               <Megaphone className="w-5 h-5 text-purple-500" />
               Firm Announcements
            </CardTitle>
         </CardHeader>
         <CardContent>
            <div className="space-y-3">
               {loading ? (
                  <div className="flex justify-center p-4">
                     <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
                  </div>
               ) : announcements.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">No active announcements.</div>
               ) : (
                  announcements.map(a => (
                     <div key={a.id} className="flex gap-3 items-start border-b pb-3 last:border-0 last:pb-0">
                        <Badge variant={a.priority === 'Critical' ? 'destructive' : 'secondary'} className="mt-0.5" >
                           {a.priority}
                        </Badge>
                        <div>
                           <p className="text-sm font-medium leading-none mb-1">{a.title}</p>
                           <p className="text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString()}</p>
                        </div>
                     </div>
                  ))
               )
               }
            </div>
         </CardContent>
      </Card>
   );
};
