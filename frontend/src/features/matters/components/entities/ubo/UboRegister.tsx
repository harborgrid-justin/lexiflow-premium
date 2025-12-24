
import React, { useMemo } from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../common/Table';
import { Badge } from '../../../common/Badge';
import { Button } from '../../../common/Button';
import { SearchInputBar, ActionRow, MetricTile } from '../../../common/RefactoredCommon';
import { Building, User, AlertTriangle, ShieldCheck, Network, Download, Plus } from 'lucide-react';
import { LegalEntity } from '../../../../types';
import { useTheme } from '../../../../providers/ThemeContext';
import { cn } from '@/utils/cn';
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
import { api } from '@/services/api';
import { AdaptiveLoader } from '../../../common/AdaptiveLoader';
import { ErrorState } from '../../../common/ErrorState';

interface UboRegisterProps {
  entities: LegalEntity[];
  onSelect: (e: LegalEntity) => void;
}

export const UboRegister: React.FC<UboRegisterProps> = ({ entities: legacyEntities, onSelect }) => {
  const { theme } = useTheme();
  
  // ✅ Fetch entities from backend API
  const { data: apiEntities = [], isLoading, error, refetch } = useQuery(
    queryKeys.entities.byType('Corporation'),
    () => api.legalEntities.getAll({ entityType: 'corporation' })
  );

  // ✅ Fetch entity stats from backend
  const { data: stats } = useQuery(
    queryKeys.entities.stats(),
    () => api.legalEntities.getStats()
  );

  // Use backend entities or fallback to legacy prop
  const corporations = apiEntities.length > 0 ? apiEntities : legacyEntities.filter(e => e.type === 'Corporation');

  // Calculate UBO metrics (mock for now until UBO endpoint is implemented)
  const metrics = useMemo(() => ({
    entitiesTracked: stats?.corporations || corporations.length,
    ubosIdentified: corporations.reduce((sum, corp) => sum + (corp.relationships?.length || 0), 0),
    verificationPending: corporations.filter(corp => corp.status !== 'active').length,
  }), [corporations, stats]);

  const handleExportFinCEN = () => {
    console.log('[UboRegister] Export FinCEN Report');
    
  };

  const handleAddUBO = () => {
    console.log('[UboRegister] Add UBO Entry');
    
  };

  if (isLoading) return <AdaptiveLoader contentType="list" itemCount={8} shimmer />;
  if (error) return <ErrorState title="Failed to Load UBO Register" message={String(error)} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricTile 
              label="Entities Tracked" 
              value={metrics.entitiesTracked} 
              icon={Building} 
              className="border-l-4 border-l-blue-600"
          />
          <MetricTile 
              label="UBOs Identified" 
              value={metrics.ubosIdentified} 
              icon={User} 
              className="border-l-4 border-l-purple-600"
          />
          <MetricTile 
              label="Verification Pending" 
              value={metrics.verificationPending} 
              icon={AlertTriangle} 
              trend={metrics.verificationPending > 0 ? "High Priority" : undefined}
              trendUp={false}
              className="border-l-4 border-l-amber-500"
          />
      </div>

      <ActionRow title="Beneficial Ownership Register" subtitle="Track equity holders >25% and controlling persons per CTA requirements.">
         <Button variant="outline" icon={Download} onClick={handleExportFinCEN}>Export FinCEN Report</Button>
         <Button variant="primary" icon={Plus} onClick={handleAddUBO}>Add UBO Entry</Button>
      </ActionRow>

      <TableContainer>
          <TableHeader>
              <TableHead>Legal Entity</TableHead>
              <TableHead>Beneficial Owner</TableHead>
              <TableHead>Control Type</TableHead>
              <TableHead>Ownership %</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead className="text-right">Actions</TableHead>
          </TableHeader>
          <TableBody>
              {corporations.map(corp => {
                const firstRelationship = corp.relationships?.[0];
                const ownershipPct = firstRelationship?.metadata?.ownershipPercentage as number || 0;
                const controlType = firstRelationship?.relationshipType || 'Senior Officer';
                const isVerified = corp.status === 'active';

                return (
                  <TableRow key={corp.id} onClick={() => onSelect(corp as any)} className="cursor-pointer">
                      <TableCell className={cn("font-bold", theme.text.primary)}>
                          <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-blue-500"/> 
                              {corp.fullLegalName || corp.name}
                          </div>
                      </TableCell>
                      <TableCell>
                           <div className="flex items-center gap-2">
                               <User className={cn("h-4 w-4", theme.text.tertiary)}/> 
                               {firstRelationship?.relatedEntityName || 'Not Assigned'}
                           </div>
                      </TableCell>
                      <TableCell>
                          <span className={cn("text-xs font-mono px-2 py-1 rounded border", theme.surface.highlight, theme.border.default)}>
                             {controlType}
                          </span>
                      </TableCell>
                      <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full" style={{ width: `${ownershipPct}%` }}></div>
                            </div>
                            <span className="text-xs font-bold">{ownershipPct > 0 ? `${ownershipPct}%` : '0% (Control)'}</span>
                          </div>
                      </TableCell>
                      <TableCell>
                          {isVerified ? (
                              <Badge variant="success" className="flex items-center w-fit gap-1"><ShieldCheck className="h-3 w-3"/> Verified</Badge>
                          ) : (
                              <Badge variant="warning" className="flex items-center w-fit gap-1"><AlertTriangle className="h-3 w-3"/> Pending Docs</Badge>
                          )}
                      </TableCell>
                      <TableCell className="text-right">
                          <Button size="sm" variant="ghost" icon={Network}>Graph</Button>
                      </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
      </TableContainer>
    </div>
  );
};
