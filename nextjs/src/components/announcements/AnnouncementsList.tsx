import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/shadcn/card';
import { Bell, Megaphone } from 'lucide-react';
import { DataService } from '@/services/data/dataService';
import { Badge } from '@/components/ui/shadcn/badge';

interface Announcement {
   id: string;
   title: string;
   priority: 'Critical' | 'Normal' | 'Info';
   date: string;
}

export const AnnouncementsList: React.FC = () => {
   const [announcements, setAnnouncements] = useState<Announcement[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchAnnouncements = async () => {
         try {
            // Mapping to communication or general admin notifications
            const data = await DataService.communication.getAll({ type: 'announcement' });

            // Fallback/Transform
            const mapped = (data.length > 0 ? data : []).map((d: unknown) => ({
               id: d.id,
               title: d.subject || d.message,
               priority: d.priority || 'Normal',
               date: d.createdAt
            }));

            setAnnouncements(mapped);
         } catch (e) {
            console.error(e);
         } finally {
            setLoading(false);
         }
      };
      fetchAnnouncements();
   }, []);

   return (
      <Card>
         <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
               <Megaphone className="w-5 h-5 text-purple-500" />
               Firm Announcements
            </CardTitle>
         </CardHeader>
         <CardContent>
            <div className="space-y-3">
               {loading ? <div className="text-sm text-muted-foreground">Loading...</div> :
                  announcements.length === 0 ? <div className="text-sm text-muted-foreground">No active announcements.</div> :
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
               }
            </div>
         </CardContent>
      </Card>
   );
};
