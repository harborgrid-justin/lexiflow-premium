/**
 * @module components/case-list/CaseListToolbar
 * @category Case Management - Filtering
 * @description Toolbar for filtering cases by status and type with quick reset.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { ChevronDown, Download, FileSpreadsheet, FileText, Filter, RefreshCcw, SlidersHorizontal } from 'lucide-react';
import React, { useRef, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useClickOutside } from '@/hooks/useClickOutside';
import { useNotify } from '@/hooks/useNotify';
import { queryClient } from '@/hooks/useQueryHooks';
import { useTheme } from '@/providers/ThemeContext';
import { queryKeys } from '@/utils/queryKeys';

// Components
import { Button } from '@/components/ui/atoms/Button/Button';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import { CaseStatus } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface CaseListToolbarProps {
  /** Current status filter value. */
  statusFilter: string;
  /** Callback to set status filter. */
  setStatusFilter: (s: string) => void;
  /** Current type filter value. */
  typeFilter: string;
  /** Callback to set type filter. */
  setTypeFilter: (s: string) => void;
  /** Callback to reset all filters. */
  resetFilters: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CaseListToolbar: React.FC<CaseListToolbarProps> = ({
  statusFilter, setStatusFilter, typeFilter, setTypeFilter, resetFilters
}) => {
  const { theme } = useTheme();
  const { success, error: notifyError } = useNotify();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useClickOutside(exportMenuRef as React.RefObject<HTMLElement>, () => setShowExportMenu(false));

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await queryClient.invalidate(queryKeys.cases.all());
      success('Cases synced successfully');
    } catch (err: unknown) {
      notifyError('Failed to sync cases');
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      interface CaseData {
        caseNumber?: string;
        title?: string;
        status?: string;
        type?: string;
        clientName?: string;
        createdAt?: string;
      }

      const cases = (queryClient.getQueryState(['cases'])?.data as CaseData[]) || [];

      // Filter cases based on current filters
      const filteredCases = cases.filter(c => {
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        const matchesType = typeFilter === 'All' || c.type === typeFilter;
        return matchesStatus && matchesType;
      });

      // Create CSV content
      const headers = ['Case Number', 'Title', 'Status', 'Type', 'Client', 'Created Date'];
      const rows = filteredCases.map(c => [
        c.caseNumber || '',
        c.title || '',
        c.status || '',
        c.type || '',
        c.clientName || '',
        c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `cases-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up blob URL

      success(`Exported ${filteredCases.length} case(s) to CSV`);
    } catch (err: unknown) {
      notifyError('Failed to export cases');
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);
      interface CaseData {
        caseNumber?: string;
        title?: string;
        status?: string;
        type?: string;
        clientName?: string;
        createdAt?: string;
        leadAttorney?: string;
        court?: string;
        judge?: string;
      }

      const cases = (queryClient.getQueryState(['cases'])?.data as CaseData[]) || [];

      // Filter cases based on current filters
      const filteredCases = cases.filter(c => {
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        const matchesType = typeFilter === 'All' || c.type === typeFilter;
        return matchesStatus && matchesType;
      });

      // Create Excel-compatible XML structure (SpreadsheetML)
      const headers = ['Case Number', 'Title', 'Status', 'Type', 'Client', 'Created Date', 'Lead Attorney', 'Court', 'Judge'];

      let xmlContent = `<?xml version="1.0"?>\n`;
      xmlContent += `<?mso-application progid="Excel.Sheet"?>\n`;
      xmlContent += `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n`;
      xmlContent += `  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n`;
      xmlContent += `  <Worksheet ss:Name="Cases">\n`;
      xmlContent += `    <Table>\n`;

      // Header row
      xmlContent += `      <Row>\n`;
      headers.forEach(header => {
        xmlContent += `        <Cell><Data ss:Type="String">${header}</Data></Cell>\n`;
      });
      xmlContent += `      </Row>\n`;

      // Data rows
      filteredCases.forEach(c => {
        xmlContent += `      <Row>\n`;
        xmlContent += `        <Cell><Data ss:Type="String">${c.caseNumber || ''}</Data></Cell>\n`;
        xmlContent += `        <Cell><Data ss:Type="String">${c.title || ''}</Data></Cell>\n`;
        xmlContent += `        <Cell><Data ss:Type="String">${c.status || ''}</Data></Cell>\n`;
        xmlContent += `        <Cell><Data ss:Type="String">${c.type || ''}</Data></Cell>\n`;
        xmlContent += `        <Cell><Data ss:Type="String">${c.clientName || ''}</Data></Cell>\n`;
        xmlContent += `        <Cell><Data ss:Type="String">${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</Data></Cell>\n`;
        xmlContent += `        <Cell><Data ss:Type="String">${c.leadAttorney || ''}</Data></Cell>\n`;
        xmlContent += `        <Cell><Data ss:Type="String">${c.court || ''}</Data></Cell>\n`;
        xmlContent += `        <Cell><Data ss:Type="String">${c.judge || ''}</Data></Cell>\n`;
        xmlContent += `      </Row>\n`;
      });

      xmlContent += `    </Table>\n`;
      xmlContent += `  </Worksheet>\n`;
      xmlContent += `</Workbook>`;

      // Create and download file
      const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `cases-export-${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      success(`Exported ${filteredCases.length} case(s) to Excel`);
    } catch (err: unknown) {
      notifyError('Failed to export to Excel');
      console.error('Excel export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={cn("p-3 rounded-lg border shadow-sm flex flex-col md:flex-row gap-3 items-center sticky top-0 z-20", theme.surface.default, theme.border.default)}>
      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
        <div className={cn("flex items-center border rounded-md px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow", theme.surface.highlight, theme.border.default)}>
          <Filter className={cn("h-4 w-4 mr-2", theme.text.tertiary)} />
          <select
            className={cn("bg-transparent text-sm font-medium outline-none border-none pr-4 cursor-pointer", theme.text.primary)}
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            aria-label="Status Filter"
          >
            <option value="All">All Statuses</option>
            {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className={cn("flex items-center border rounded-md px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow", theme.surface.highlight, theme.border.default)}>
          <SlidersHorizontal className={cn("h-4 w-4 mr-2", theme.text.tertiary)} />
          <select
            className={cn("bg-transparent text-sm font-medium outline-none border-none pr-4 cursor-pointer", theme.text.primary)}
            value={typeFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
            aria-label="Type Filter"
          >
            <option value="All">All Types</option>
            <option value="Litigation">Litigation</option>
            <option value="M&A">M&A</option>
            <option value="IP">IP</option>
            <option value="Real Estate">Real Estate</option>
          </select>
        </div>

        {(statusFilter !== 'All' || typeFilter !== 'All') && (
          <button
            onClick={resetFilters}
            className={cn("text-xs font-bold hover:underline px-2 transition-colors whitespace-nowrap", theme.primary.text)}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="flex-1"></div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <Button
          variant="ghost"
          size="sm"
          icon={RefreshCcw}
          onClick={handleSync}
          disabled={isSyncing}
          className={theme.text.secondary}
        >
          {isSyncing ? 'Syncing...' : 'Sync'}
        </Button>

        {/* Export Dropdown */}
        <div className="relative" ref={exportMenuRef}>
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting}
            className="flex items-center gap-1"
          >
            {isExporting ? 'Exporting...' : 'Export'}
            <ChevronDown className="h-3 w-3" />
          </Button>

          {showExportMenu && !isExporting && (
            <div className={cn(
              "absolute right-0 mt-1 w-48 rounded-lg shadow-lg border z-50",
              theme.surface.default,
              theme.border.default
            )}>
              <div className="py-1">
                <button
                  onClick={handleExport}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors",
                    theme.text.primary,
                    `hover:${theme.surface.highlight}`
                  )}
                >
                  <FileText className="h-4 w-4" />
                  Export as CSV
                </button>
                <button
                  onClick={handleExportExcel}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors",
                    theme.text.primary,
                    `hover:${theme.surface.highlight}`
                  )}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export as Excel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
