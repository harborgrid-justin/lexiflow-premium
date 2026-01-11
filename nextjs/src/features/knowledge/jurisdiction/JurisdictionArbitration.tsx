import { Button } from '@/components/ui/atoms/Button/Button';
import { AdaptiveLoader } from '@/components/ui/molecules/AdaptiveLoader/AdaptiveLoader';
import { Card } from '@/components/ui/molecules/Card/Card';
import { useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from '@/providers';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/utils/cn';
import { CheckCircle } from 'lucide-react';
import React from 'react';

export const JurisdictionArbitration: React.FC = () => {
  const { theme } = useTheme();

  // Performance Engine: useQuery
  const { data: rawProviders = [], isLoading } = useQuery<unknown[]>(
    ['jurisdiction', 'arbitration'],
    DataService.jurisdiction.getArbitrationProviders
  );

  // Defensive array validation
  const providers = Array.isArray(rawProviders) ? rawProviders : [];

  if (isLoading) return <AdaptiveLoader contentType="list" itemCount={8} shimmer />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2" title="ADR Providers">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((prov: unknown) => (
            <div key={`provider-${(prov as { name: string }).name}`} className={cn("p-4 border rounded-lg transition-colors cursor-pointer group", theme.surface.default, theme.border.default, `hover:${theme.primary.border}`)}>

              <h4 className={cn("font-bold text-lg mb-1", theme.text.primary)}>{(prov as { name: string }).name}</h4>
              <p className={cn("text-xs uppercase tracking-wide", theme.text.secondary)}>{(prov as { fullName: string }).fullName}</p>
              <ul className={cn("mt-3 space-y-1 text-sm", theme.text.secondary)}>
                {(prov as { rules: string[] }).rules.map((rule: string, idx: number) => (
                  <li key={idx} className="flex items-center"><CheckCircle className={cn("h-3 w-3 mr-2", theme.status.success.text)} /> {rule}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Panel Selection">
        <div className="space-y-4">
          <p className={cn("text-sm", theme.text.secondary)}>Manage preferred arbitrators and strike lists.</p>
          <div className={cn("p-3 rounded text-sm font-medium border", theme.surface.highlight, theme.text.primary, theme.border.default)}>
            <span className={cn("block text-xs uppercase mb-1", theme.text.tertiary)}>Pending Selection</span>
            TechCorp v. StartUp Inc (AAA Case #4492)
          </div>
          <Button variant="primary" className="w-full">View Arbitrator Profiles</Button>
        </div>
      </Card>
    </div>
  );
};
