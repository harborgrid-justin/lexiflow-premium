/**
 * LegalHolds.tsx
 *
 * Legal hold management for litigation preservation obligations.
 * Tracks custodians, scope, and compliance with FRCP 37(e) requirements.
 *
 * @module components/discovery/LegalHolds
 * @category Discovery - Preservation
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { AlertCircle, Plus, User, Building2, Calendar } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms/Table/Table';
import { AdaptiveLoader } from '@/components/ui/molecules/AdaptiveLoader/AdaptiveLoader';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useQuery, useMutation, queryClient } from '@/hooks/useQueryHooks';
import { useNotify } from '@/hooks/useNotify';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// Services & Utils
import { DataService } from '@/services/data/dataService';
import { cn } from '@/utils/cn';
// ✅ Migrated to backend API (2025-12-21)
import { discoveryQueryKeys } from '@/services/infrastructure/queryKeys';
import { LegalHoldStatusEnum } from '@/types/enums';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { LegalHold } from '@/types';

export const LegalHolds: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();

  const { data: holds = [], isLoading } = useQuery<LegalHold[]>(
      discoveryQueryKeys.discovery.holds.all,
      DataService.discovery.getLegalHolds
  );

  // Optimistic mutation with retry logic
  const { mutate: acknowledgeHold } = useMutation(
      async (holdId: string) => {
          return DataService.discovery.acknowledgeHold(holdId);
      },
      {
          // Optimistic update
          onMutate: async (holdId) => {
              // Cancel outgoing queries
              await queryClient.cancelQueries(discoveryQueryKeys.discovery.holds.all);

              // Snapshot previous value
              const previousHolds = queryClient.getQueryState<LegalHold[]>(discoveryQueryKeys.discovery.holds.all)?.data;

              // Optimistically update
              if (previousHolds) {
                  queryClient.setQueryData<LegalHold[]>(
                      discoveryQueryKeys.discovery.holds.all,
                      previousHolds.map((h: LegalHold) =>
                          h.id === holdId
                              ? { ...h, status: LegalHoldStatusEnum.ACKNOWLEDGED }
                              : h
                      )
                  );
              }

              return { previousHolds };
          },
          onError: (_, __, context) => {
              // Rollback on error
              if (context?.previousHolds) {
                  queryClient.setQueryData(
                      discoveryQueryKeys.discovery.holds.all,
                      context.previousHolds
                  );
              }
              notify.error('Failed to acknowledge legal hold. Please try again.');
          },
          onSuccess: () => {
              notify.success('Legal hold acknowledged successfully');
          },
          invalidateKeys: [
              discoveryQueryKeys.discovery.holds.all,
              discoveryQueryKeys.discovery.holds.byStatus(LegalHoldStatusEnum.ACKNOWLEDGED)
          ]
      }
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
      'mod+h': () => {
          // Open new hold form
          notify.info('New legal hold form (to be implemented)');
      },
      'mod+a': () => {
          // View all holds
          notify.info('Viewing all legal holds');
      }
  });

  if (isLoading) return <AdaptiveLoader contentType="table" itemCount={8} shimmer />;

  return (
    <div className="animate-fade-in space-y-4">
       <div className={cn("border p-4 rounded-lg mb-4 flex gap-3", theme.status.warning.bg, theme.status.warning.border)}>
          <AlertCircle className={cn("h-6 w-6 shrink-0", theme.status.warning.text)}/>
          <div>
            <h4 className={cn("font-bold text-sm", theme.status.warning.text)}>Spoliation Warning</h4>
            <p className={cn("text-xs mt-1", theme.status.warning.text)}>Ensure all custodians are notified. Failure to preserve evidence may result in adverse inference sanctions (FRCP 37(e)).</p>
          </div>
       </div>

       <div className="flex justify-between items-center mb-2">
         <h3 className={cn("font-bold", theme.text.primary)}>Active Custodians</h3>
         <Button variant="primary" icon={Plus}>Issue New Hold</Button>
       </div>

       {/* Desktop View */}
       <div className="hidden md:block">
         <TableContainer responsive="card">
            <TableHeader>
              <TableHead>Custodian</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Date Issued</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableHeader>
            <TableBody>
              {holds.map((hold) => (
                 <TableRow key={hold.id}>
                    <TableCell className={cn("font-medium", theme.text.primary)}>{hold.custodian}</TableCell>
                    <TableCell>{hold.dept}</TableCell>
                    <TableCell>{hold.issued}</TableCell>
                    <TableCell>
                      {hold.status === 'Acknowledged'
                        ? <Badge variant="success">Acknowledged</Badge>
                        : <Badge variant="warning">Pending Ack</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      {hold.status === LegalHoldStatusEnum.PENDING ? (
                        <Button variant="ghost" size="sm" onClick={() => acknowledgeHold(hold.id)}>Acknowledge</Button>
                      ) : (
                        <Button variant="ghost" size="sm">Remind</Button>
                      )}
                    </TableCell>
                 </TableRow>
              ))}
            </TableBody>
         </TableContainer>
       </div>

       {/* Mobile Card View */}
       <div className="md:hidden space-y-4">
         {holds.map(hold => (
           <div key={hold.id} className={cn("p-4 rounded-lg shadow-sm border", theme.surface.default, theme.border.default)}>
             <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500"/>
                  <span className={cn("font-bold", theme.text.primary)}>{hold.custodian}</span>
                </div>
                {hold.status === 'Acknowledged'
                  ? <Badge variant="success">Ack</Badge>
                  : <Badge variant="warning">Pending</Badge>
                }
             </div>

             <div className={cn("grid grid-cols-2 gap-4 text-xs mb-4", theme.text.secondary)}>
               <div className="flex items-center gap-1">
                 <Building2 className={cn("h-3 w-3", theme.text.tertiary)}/>
                 {hold.dept}
               </div>
               <div className="flex items-center gap-1">
                 <Calendar className={cn("h-3 w-3", theme.text.tertiary)}/>
                 Issued: {hold.issued}
               </div>
             </div>

             <div className="flex gap-2">
               <Button size="sm" variant="outline" className="flex-1">View Notice</Button>
               {hold.status === 'Pending' && <Button size="sm" variant="ghost" className="flex-1 text-blue-600">Resend</Button>}
             </div>
           </div>
         ))}
       </div>
    </div>
  );
};

export default LegalHolds;

