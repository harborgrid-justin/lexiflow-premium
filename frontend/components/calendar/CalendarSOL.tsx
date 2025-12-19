/**
 * @module components/calendar/CalendarSOL
 * @category Calendar
 * @description Statute of limitations tracker with critical alerts.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { AlertTriangle, ShieldAlert, MapPin, Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/data/dataService';
import { useQuery } from '../../hooks/useQueryHooks';

// Components
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';

// ============================================================================
// COMPONENT
// ============================================================================

export const CalendarSOL: React.FC = () => {
  // Enterprise Data Access
  const { data: solData = [], isLoading } = useQuery<any[]>(
      ['calendar', 'sol'],
      DataService.calendar.getSOL
  );

  // Ensure solData is always an array
  const safeData = Array.isArray(solData) ? solData : [];

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-red-600"/></div>;

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <ShieldAlert className="h-12 w-12 text-red-600 mx-auto mb-3"/>
        <h3 className="text-lg font-bold text-red-900">Statute of Limitations Watch</h3>
        <p className="text-red-700 max-w-lg mx-auto text-sm">Critical dates for filing complaints. Missing these dates will result in malpractice liability. Dates are calculated based on cause of action and jurisdiction.</p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <TableContainer>
            <TableHeader>
            <TableHead>Expiration Date</TableHead>
            <TableHead>Potential Matter</TableHead>
            <TableHead>Cause of Action</TableHead>
            <TableHead>Jurisdiction</TableHead>
            <TableHead>Days Left</TableHead>
            </TableHeader>
            <TableBody>
            {safeData.map((row, i) => (
                <TableRow key={i} className={row.critical ? 'bg-red-50/50' : ''}>
                    <TableCell className={`font-bold ${row.critical ? 'text-red-700' : 'text-slate-700'}`}>{row.date}</TableCell>
                    <TableCell className="font-medium text-slate-900">{row.matter}</TableCell>
                    <TableCell>{row.cause}</TableCell>
                    <TableCell>{row.jurisdiction}</TableCell>
                    <TableCell>
                        <span className={`${row.critical ? 'text-red-600 font-bold' : 'text-slate-500'} flex items-center`}>
                            {row.critical && <AlertTriangle className="h-3 w-3 mr-1"/>}
                            {row.daysLeft} Days
                        </span>
                    </TableCell>
                </TableRow>
            ))}
            {safeData.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">No SOL alerts active.</TableCell></TableRow>
            )}
            </TableBody>
        </TableContainer>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {safeData.map((row, i) => (
            <div key={i} className={`p-4 rounded-lg border shadow-sm ${row.critical ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-lg font-bold ${row.critical ? 'text-red-700' : 'text-slate-700'}`}>{row.date}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${row.critical ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                        {row.daysLeft} Days Left
                    </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{row.matter}</h4>
                <p className="text-xs text-slate-600 mb-3">{row.cause}</p>
                <div className="flex items-center text-xs text-slate-500 border-t pt-2 border-slate-200/50">
                    <MapPin className="h-3 w-3 mr-1"/> {row.jurisdiction}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

