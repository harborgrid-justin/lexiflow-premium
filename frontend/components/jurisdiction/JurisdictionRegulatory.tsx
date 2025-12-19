
import React from 'react';
import { Card } from '../common/Card';
import { Scale, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/data/dataService';
import { useQuery } from '../../services/infrastructure/queryClient';

export const JurisdictionRegulatory: React.FC = () => {
  const { theme } = useTheme();

  // Performance Engine: useQuery
  const { data: rawBodies = [], isLoading } = useQuery<any[]>(
      ['jurisdiction', 'regulatory'],
      DataService.jurisdiction.getRegulatoryBodies
  );

  // Defensive array validation
  const bodies = Array.isArray(rawBodies) ? rawBodies : [];

  if (isLoading) return <AdaptiveLoader contentType="list" itemCount={8} shimmer />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Administrative Bodies">
        <div className="space-y-4">
          {bodies.map((body, i) => (
             <div key={i} className={cn("flex items-start p-4 border rounded-lg", theme.surface.highlight, theme.border.default)}>
                <Scale className={cn("h-6 w-6 mr-3 mt-1", body.iconColor)}/>
                <div>
                    <h4 className={cn("font-bold", theme.text.primary)}>{body.name}</h4>
                    <p className={cn("text-sm", theme.text.secondary)}>{body.desc}</p>
                    <div className={cn("mt-2 text-xs font-mono border px-2 py-1 rounded inline-block", theme.surface.default, theme.border.default, theme.text.tertiary)}>
                        Ref: {body.ref}
                    </div>
                </div>
             </div>
          ))}
        </div>
      </Card>

      <Card title="Recent Regulatory Actions">
        <div className="space-y-4">
          <div className={cn("flex items-center text-sm p-3 rounded border", theme.status.warning.bg, theme.status.warning.border, theme.status.warning.text)}>
            <AlertTriangle className="h-4 w-4 mr-2"/>
            <span>FTC Proposed Rule on Non-Competes (Pending)</span>
          </div>
          <div className={cn("flex items-center text-sm p-3 rounded border", theme.primary.light, theme.primary.border, theme.primary.text)}>
            <FileText className="h-4 w-4 mr-2"/>
            <span>SEC Climate Disclosure Guidelines (Adopted)</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

