import { Card } from '@/components/molecules/Card/Card';
import { Button } from '@/components/atoms/Button';
import { Clock, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/cn';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
// ✅ Migrated to backend API (2025-12-21)

interface Petition {
  id: string;
  title: string;
  date: string;
}

export const PerpetuateTestimony: React.FC = () => {
  const { theme } = useTheme();

  // Use dynamic query instead of static placeholder
  const { data: petitions = [], isLoading } = useQuery<Petition[]>(
      ['discovery', 'petitions'],
      DataService.discovery.getPetitions
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className={cn("p-6 rounded-lg border bg-slate-50 flex justify-between items-center")}>
             <div>
                 <h3 className={cn("text-lg font-bold flex items-center", theme.text.primary)}>
                     <Clock className="h-5 w-5 mr-2 text-blue-600"/> Perpetuate Testimony (Rule 27)
                 </h3>
                 <p className="text-sm text-slate-600">Preserve testimony before an action is filed due to risk of loss.</p>
             </div>
             <Button variant="outline">Draft Petition</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Active Petitions">
                {isLoading ? (
                    <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-blue-600"/></div>
                ) : petitions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 italic">No active Rule 27 petitions.</div>
                ) : (
                    <div className="space-y-2">
                        {petitions.map((p) => (
                            <div key={`petition-${p.title}-${p.date}`} className="p-3 border rounded">
                                <p className="font-bold">{p.title}</p>
                                <p className="text-xs text-slate-500">{p.date}</p>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Card title="Requirements Checklist">
                <ul className={cn("space-y-2 text-sm", theme.text.secondary)}>
                    <li className="flex items-start gap-2"><div className="w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 text-[10px]">1</div> Petitioner expects to be a party to an action cognizable in US court.</li>
                    <li className="flex items-start gap-2"><div className="w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 text-[10px]">2</div> Petitioner cannot presently bring the action.</li>
                    <li className="flex items-start gap-2"><div className="w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 text-[10px]">3</div> Facts to be established & reasons for desiring to perpetuate it.</li>
                    <li className="flex items-start gap-2"><div className="w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 text-[10px]">4</div> Names/addresses of adverse parties.</li>
                </ul>
            </Card>
        </div>
    </div>
  );
};

export default PerpetuateTestimony;


