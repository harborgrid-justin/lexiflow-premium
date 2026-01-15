/**
 * @module components/enterprise/analytics/ReportExport
 * @category Enterprise Analytics
 * @description Report export functionality for analytics dashboards.
 *
 * Features:
 * - Multiple export formats (PDF, CSV, Excel, JSON)
 * - Customizable export options
 * - Progress indication
 * - Download management
 * - Theme-aware styling
 * - Error handling
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useCallback, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from "@/hooks/useTheme";
import { DEFAULT_TOKENS } from "@/lib/theme/tokens";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ExportFormat = 'pdf' | 'csv' | 'excel' | 'json';

export interface ExportOptions {
  /** Export format */
  format: ExportFormat;
  /** Report title */
  title?: string;
  /** Include charts/visualizations */
  includeCharts?: boolean;
  /** Include raw data */
  includeData?: boolean;
  /** Include summary statistics */
  includeSummary?: boolean;
  /** Date range for report */
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface ReportExportProps {
  /** Callback to generate export data */
  onExport: (options: ExportOptions) => Promise<Blob | string>;
  /** Available export formats */
  formats?: ExportFormat[];
  /** Default export options */
  defaultOptions?: Partial<ExportOptions>;
  /** Report name/title */
  reportName?: string;
  /** Whether export is disabled */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Show as dropdown menu */
  showAsDropdown?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const formatLabels: Record<ExportFormat, string> = {
  pdf: 'PDF Document',
  csv: 'CSV Spreadsheet',
  excel: 'Excel Workbook',
  json: 'JSON Data'
};

const formatIcons: Record<ExportFormat, string> = {
  pdf: '📄',
  csv: '📊',
  excel: '📈',
  json: '{ }'
};

const formatExtensions: Record<ExportFormat, string> = {
  pdf: '.pdf',
  csv: '.csv',
  excel: '.xlsx',
  json: '.json'
};

const formatMimeTypes: Record<ExportFormat, string> = {
  pdf: 'application/pdf',
  csv: 'text/csv',
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  json: 'application/json'
};

// ============================================================================
// COMPONENT
// ============================================================================

export const ReportExport: React.FC<ReportExportProps> = ({
  onExport,
  formats = ['pdf', 'csv', 'excel', 'json'],
  defaultOptions,
  reportName = 'analytics-report',
  disabled = false,
  className = '',
  showAsDropdown = true
}) => {
  const { theme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    includeData: true,
    includeSummary: true,
    ...defaultOptions
  });

  // Handle export
  const handleExport = useCallback(async (format: ExportFormat, options?: Partial<ExportOptions>) => {
    setIsExporting(true);
    setError(null);
    setExportProgress('Preparing export...');

    try {
      const finalOptions: ExportOptions = {
        ...exportOptions,
        ...options,
        format
      };

      setExportProgress('Generating report...');
      const result = await onExport(finalOptions);

      setExportProgress('Downloading...');

      // Create blob and download
      let blob: Blob;
      if (typeof result === 'string') {
        blob = new Blob([result], { type: formatMimeTypes[format] });
      } else {
        blob = result;
      }

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${reportName}-${timestamp}${formatExtensions[format]}`;

      // Create download link (guard for SSR)
      if (typeof document === 'undefined') return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportProgress('Export complete!');
      setTimeout(() => {
        setExportProgress('');
        setShowOptions(false);
      }, 2000);
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Failed to export report');
      setExportProgress('');
    } finally {
      setIsExporting(false);
    }
  }, [exportOptions, onExport, reportName]);

  // Handle quick export (single click)
  const handleQuickExport = useCallback((format: ExportFormat) => {
    handleExport(format);
  }, [handleExport]);

  // Styles
  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 500,
    cursor: disabled || isExporting ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: disabled || isExporting ? 0.6 : 1,
    backgroundColor: DEFAULT_TOKENS.colors.primary,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block'
  };

  const dropdownContentStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    backgroundColor: DEFAULT_TOKENS.colors.surface,
    border: `1px solid ${DEFAULT_TOKENS.colors.border}`,
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    minWidth: '280px',
    padding: '12px',
    zIndex: 1000
  };

  const formatButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: DEFAULT_TOKENS.colors.text,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    textAlign: 'left'
  };

  const optionStyle: React.CSSProperties = {
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: DEFAULT_TOKENS.colors.text
  };

  const checkboxStyle: React.CSSProperties = {
    marginRight: '8px',
    cursor: 'pointer'
  };

  // Dropdown view
  if (showAsDropdown) {
    return (
      <div className={className} style={dropdownStyle}>
        <button
          onClick={() => setShowOptions(!showOptions)}
          style={buttonStyle}
          disabled={disabled || isExporting}
        >
          <span>📥</span>
          <span>{isExporting ? exportProgress || 'Exporting...' : 'Export Report'}</span>
        </button>

        {showOptions && !isExporting && (
          <div style={dropdownContentStyle}>
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: DEFAULT_TOKENS.colors.text }}>
                Export Options
              </h4>

              <label style={optionStyle}>
                <input
                  type="checkbox"
                  checked={exportOptions.includeCharts}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeCharts: e.target.checked })}
                  style={checkboxStyle}
                />
                Include Charts
              </label>

              <label style={optionStyle}>
                <input
                  type="checkbox"
                  checked={exportOptions.includeData}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeData: e.target.checked })}
                  style={checkboxStyle}
                />
                Include Raw Data
              </label>

              <label style={optionStyle}>
                <input
                  type="checkbox"
                  checked={exportOptions.includeSummary}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeSummary: e.target.checked })}
                  style={checkboxStyle}
                />
                Include Summary
              </label>
            </div>

            <div style={{ borderTop: `1px solid ${DEFAULT_TOKENS.colors.border}`, paddingTop: '12px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: DEFAULT_TOKENS.colors.textMuted }}>
                Select Format
              </h4>
              {formats.map(format => (
                <button
                  key={format}
                  onClick={() => handleQuickExport(format)}
                  style={formatButtonStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.surface?.highlight || '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{formatIcons[format]}</span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{formatLabels[format]}</div>
                    <div style={{ fontSize: '12px', color: theme.text?.secondary || '#64748b' }}>
                      {formatExtensions[format]}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: theme.status?.error?.bg || '#fef2f2',
                  color: theme.status?.error?.text || '#991b1b',
                  fontSize: '12px'
                }}
              >
                {error}
              </div>
            )}
          </div>
        )}

        {isExporting && exportProgress && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              padding: '12px 16px',
              backgroundColor: theme.surface?.raised || '#ffffff',
              border: `1px solid ${theme.border?.default || '#e2e8f0'}`,
              borderRadius: '6px',
              fontSize: '14px',
              color: theme.text?.primary || '#1e293b',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            {exportProgress}
          </div>
        )}
      </div>
    );
  }

  // Button list view
  return (
    <div className={className} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {formats.map(format => (
        <button
          key={format}
          onClick={() => handleQuickExport(format)}
          style={buttonStyle}
          disabled={disabled || isExporting}
        >
          <span>{formatIcons[format]}</span>
          <span>Export {formatLabels[format]}</span>
        </button>
      ))}

      {error && (
        <div
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: theme.status?.error?.bg || '#fef2f2',
            color: theme.status?.error?.text || '#991b1b',
            fontSize: '12px'
          }}
        >
          {error}
        </div>
      )}

      {isExporting && exportProgress && (
        <div
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: theme.status?.info?.bg || '#eff6ff',
            color: theme.status?.info?.text || '#1e3a8a',
            fontSize: '12px'
          }}
        >
          {exportProgress}
        </div>
      )}
    </div>
  );
};

export default ReportExport;
