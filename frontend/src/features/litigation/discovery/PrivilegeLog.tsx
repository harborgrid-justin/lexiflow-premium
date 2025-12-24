/**
 * PrivilegeLog.tsx
 * 
 * FRCP 26(b)(5) privilege log for documenting withheld documents
 * claiming attorney-client or work product privilege.
 * 
 * @module components/discovery/PrivilegeLog
 * @category Discovery - Privilege
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect } from 'react';
import { Wand2, Plus, Shield, Mail } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { AdaptiveLoader } from '../../common/AdaptiveLoader';

// Hooks & Context
import { useTheme } from '../../../context/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useNotify } from '@/hooks/useNotify';

// Services & Utils
import { DataService } from '@/services/data/dataService';
import { cn } from '@/utils/cn';
import { discoveryQueryKeys } from '@/services/infrastructure/queryKeys';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { PrivilegeLogEntry } from '../../../types';

export const PrivilegeLog: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  
  const { data: logItems = [], isLoading } = useQuery<PrivilegeLogEntry[]>(
      discoveryQueryKeys.discovery.privilege.all,
      DataService.discovery.getPrivilegeLog
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
      'mod+shift+p': () => {
          notify.info('Add new privilege log entry (to be implemented)');
      }
  });

  if (isLoading) return <AdaptiveLoader contentType="table" itemCount={8} shimmer />;

  return (
    <div className="animate-fade-in space-y-4">
      <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg border gap-4", theme.surface.highlight, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold", theme.text.primary)}>Privilege Log (FRCP 26(b)(5))</h3>
          <p className={cn("text-sm", theme.text.secondary)}>Index of withheld documents claiming Attorney-Client or Work Product privilege.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Button variant="outline" icon={Wand2} className="flex-1 md:flex-none">AI Scan</Button>
           <Button variant="primary" icon={Plus} className="flex-1 md:flex-none">Manual Entry</Button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <TableContainer responsive="card">
          <TableHeader>
            <TableHead>Doc ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Privilege Claim</TableHead>
            <TableHead>Author/Recipient</TableHead>
            <TableHead>Description (Rule 26)</TableHead>
          </TableHeader>
          <TableBody>
            {logItems.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className={cn("font-mono text-xs", theme.text.secondary)}>{item.id}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell><Badge variant="warning">{item.basis}</Badge></TableCell>
                <TableCell>
                  <div className="text-xs">
                    <p><span className={theme.text.secondary}>From:</span> <span className={theme.text.primary}>{item.author}</span></p>
                    <p><span className={theme.text.secondary}>To:</span> <span className={theme.text.primary}>{item.recipient}</span></p>
                  </div>
                </TableCell>
                <TableCell className={cn("max-w-xs truncate", theme.text.secondary)} title={item.desc}>{item.desc}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {logItems.map(item => (
          <div key={item.id} className={cn("p-4 rounded-lg shadow-sm border", theme.surface.default, theme.border.default)}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-500"/>
                <span className={cn("font-mono text-xs font-bold", theme.text.primary)}>{item.id}</span>
              </div>
              <Badge variant="warning">{item.basis}</Badge>
            </div>
            
            <div className={cn("text-sm mb-3 p-2 rounded border", theme.text.primary, theme.surface.highlight, theme.border.default)}>
              {item.desc}
            </div>

            <div className={cn("grid grid-cols-2 gap-4 text-xs", theme.text.secondary)}>
              <div>
                <span className="block font-medium opacity-70">Date</span>
                {item.date}
              </div>
              <div>
                <span className="block font-medium opacity-70">Type</span>
                {item.type}
              </div>
            </div>

            <div className={cn("flex items-start gap-2 pt-3 border-t text-xs mt-2", theme.border.default, theme.text.secondary)}>
              <Mail className={cn("h-3.5 w-3.5 mt-0.5", theme.text.tertiary)}/>
              <div className="flex-1">
                <p><strong>From:</strong> {item.author}</p>
                <p><strong>To:</strong> {item.recipient}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrivilegeLog;
