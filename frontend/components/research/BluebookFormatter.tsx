/**
 * @module components/research/BluebookFormatter
 * @category Legal Research - Citation Formatting
 * @description Enterprise Bluebook citation formatter with batch processing, validation, and export
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useMemo, useCallback } from 'react';
import {
  BookOpen, Upload, Download, CheckCircle, AlertCircle, Copy, Trash2,
  FileText, Plus, Wand2, Settings, Eye, EyeOff, Filter, ArrowRight,
  Table, FileDown, Loader2, Info, AlertTriangle, CheckCircle2
} from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useNotify } from '../../hooks/useNotify';

// Services & Utils
import { BluebookParser } from '../../services/bluebook/bluebookParser';
import { BluebookFormatter as Formatter } from '../../services/bluebook/bluebookFormatter';
import {
  BluebookCitation,
  BluebookCitationType,
  CitationFormat,
  ValidationSeverity,
  ExportFormat
} from '../../types/bluebook';
import { cn } from '../../utils/cn';
import { downloadFile } from '../../utils/download';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface FormattingResult {
  id: string;
  original: string;
  citation: BluebookCitation | null;
  formatted: string;
  isValid: boolean;
  showDetails: boolean;
}

interface FormatStats {
  total: number;
  valid: number;
  warnings: number;
  errors: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const BluebookFormatter: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();

  // State
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<FormattingResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formatStyle, setFormatStyle] = useState<CitationFormat>(CitationFormat.FULL);
  const [filterType, setFilterType] = useState<BluebookCitationType | 'ALL'>('ALL');
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [italicizeCaseNames, setItalicizeCaseNames] = useState(true);
  const [useSmallCaps, setUseSmallCaps] = useState(true);

  // Compute statistics
  const stats = useMemo<FormatStats>(() => {
    const total = results.length;
    const valid = results.filter(r => r.isValid).length;
    const warnings = results.filter(r =>
      r.citation?.validationErrors.some(e => e.severity === ValidationSeverity.WARNING)
    ).length;
    const errors = results.filter(r => !r.isValid).length;

    return { total, valid, warnings, errors };
  }, [results]);

  // Filter results
  const filteredResults = useMemo(() => {
    let filtered = results;

    if (filterType !== 'ALL') {
      filtered = filtered.filter(r => r.citation?.type === filterType);
    }

    if (showOnlyErrors) {
      filtered = filtered.filter(r => !r.isValid);
    }

    return filtered;
  }, [results, filterType, showOnlyErrors]);

  /**
   * Process citations from input
   */
  const handleFormat = useCallback(async () => {
    if (!inputText.trim()) {
      notify.warning('Please enter citations to format');
      return;
    }

    setIsProcessing(true);

    try {
      // Split input into lines
      const lines = inputText
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      // Parse each citation
      const newResults: FormattingResult[] = lines.map(line => {
        const citation = BluebookParser.parse(line);
        const formatted = citation
          ? Formatter.format(citation, { italicizeCaseNames, useSmallCaps, format: formatStyle })
          : line;

        return {
          id: Math.random().toString(36).substr(2, 9),
          original: line,
          citation,
          formatted,
          isValid: citation?.isValid || false,
          showDetails: false
        };
      });

      setResults(newResults);
      
      const validCount = newResults.filter(r => r.isValid).length;
      notify.success(`Processed ${newResults.length} citations (${validCount} valid)`);
    } catch (error) {
      console.error('Formatting error:', error);
      notify.error('Failed to process citations');
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, formatStyle, italicizeCaseNames, useSmallCaps, notify]);

  /**
   * Handle file upload
   */
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  }, []);

  /**
   * Copy formatted citation to clipboard
   */
  const handleCopy = useCallback((formatted: string) => {
    const plainText = Formatter.stripFormatting(formatted);
    navigator.clipboard.writeText(plainText);
    notify.success('Citation copied to clipboard');
  }, [notify]);

  /**
   * Copy all formatted citations
   */
  const handleCopyAll = useCallback(() => {
    const allFormatted = results
      .map(r => Formatter.stripFormatting(r.formatted))
      .join('\n\n');
    
    navigator.clipboard.writeText(allFormatted);
    notify.success(`Copied ${results.length} citations to clipboard`);
  }, [results, notify]);

  /**
   * Export citations
   */
  const handleExport = useCallback((format: ExportFormat) => {
    if (results.length === 0) {
      notify.warning('No citations to export');
      return;
    }

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case ExportFormat.PLAIN_TEXT:
        content = results.map(r => Formatter.stripFormatting(r.formatted)).join('\n\n');
        filename = 'citations.txt';
        mimeType = 'text/plain';
        break;

      case ExportFormat.HTML:
        content = `<!DOCTYPE html>
<html>
<head>
  <title>Bluebook Citations</title>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; }
    .citation { margin-bottom: 20px; padding: 15px; border-left: 3px solid #3b82f6; background: #f8fafc; }
    .citation-type { font-size: 0.85em; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
    .citation-text { font-size: 1em; }
    .error { border-left-color: #ef4444; background: #fef2f2; }
    em { font-style: italic; }
    .small-caps { font-variant: small-caps; }
  </style>
</head>
<body>
  <h1>Bluebook Citations</h1>
  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  <p><strong>Total Citations:</strong> ${results.length} | <strong>Valid:</strong> ${stats.valid} | <strong>Errors:</strong> ${stats.errors}</p>
  <hr />
  ${results.map(r => `
    <div class="citation ${!r.isValid ? 'error' : ''}">
      <div class="citation-type">${r.citation?.type || 'Unknown'}</div>
      <div class="citation-text">${r.formatted}</div>
      ${!r.isValid ? `<div style="color: #ef4444; margin-top: 10px; font-size: 0.9em;">⚠ ${r.citation?.validationErrors[0]?.message || 'Invalid format'}</div>` : ''}
    </div>
  `).join('\n')}
</body>
</html>`;
        filename = 'citations.html';
        mimeType = 'text/html';
        break;

      case ExportFormat.JSON:
        content = JSON.stringify({
          generated: new Date().toISOString(),
          stats,
          citations: results.map(r => ({
            original: r.original,
            formatted: Formatter.stripFormatting(r.formatted),
            type: r.citation?.type,
            isValid: r.isValid,
            errors: r.citation?.validationErrors
          }))
        }, null, 2);
        filename = 'citations.json';
        mimeType = 'application/json';
        break;

      default:
        notify.error('Export format not supported');
        return;
    }

    downloadFile(content, filename, mimeType);
    notify.success(`Exported ${results.length} citations as ${format}`);
  }, [results, stats, notify]);

  /**
   * Generate table of authorities
   */
  const handleGenerateTOA = useCallback(() => {
    if (results.length === 0) {
      notify.warning('No citations available');
      return;
    }

    const validCitations = results
      .filter(r => r.citation)
      .map(r => r.citation!);

    const toa = Formatter.createTableOfAuthorities(validCitations);
    
    // Open in new window
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Table of Authorities</title>
          <style>
            body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 40px auto; padding: 20px; }
            h1 { text-align: center; text-transform: uppercase; }
            h3 { margin-top: 30px; border-bottom: 2px solid #000; padding-bottom: 5px; }
            ul { list-style: none; padding: 0; }
            li { margin-bottom: 10px; text-indent: -30px; padding-left: 30px; }
            em { font-style: italic; }
            .small-caps { font-variant: small-caps; }
          </style>
        </head>
        <body>
          <h1>Table of Authorities</h1>
          ${toa}
        </body>
        </html>
      `);
      win.document.close();
    }

    notify.success('Table of Authorities generated');
  }, [results, notify]);

  /**
   * Toggle result details
   */
  const toggleDetails = useCallback((id: string) => {
    setResults(prev => prev.map(r =>
      r.id === id ? { ...r, showDetails: !r.showDetails } : r
    ));
  }, []);

  /**
   * Remove result
   */
  const removeResult = useCallback((id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  }, []);

  /**
   * Clear all results
   */
  const handleClear = useCallback(() => {
    setResults([]);
    setInputText('');
  }, []);

  /**
   * Add sample citations
   */
  const handleAddSamples = useCallback(() => {
    const samples = [
      'Brown v. Board of Education, 347 U.S. 483 (1954)',
      'Miranda v. Arizona, 384 U.S. 436 (1966)',
      '42 U.S.C. § 1983 (2018)',
      'U.S. Const. amend. XIV, § 1',
      '29 C.F.R. § 1614.101 (2020)',
      'Erwin Chemerinsky, Constitutional Law (6th ed. 2020)',
      'John Doe, The Future of Legal Citations, 100 Harv. L. Rev. 250 (2020)'
    ];
    
    setInputText(samples.join('\n'));
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className={cn("text-center")}>
        <h1 className={cn("text-3xl font-bold flex items-center justify-center gap-3", theme.text.primary)}>
          <BookOpen className="h-8 w-8 text-blue-600" />
          Bluebook Auto-Formatter
        </h1>
        <p className={cn("mt-2", theme.text.secondary)}>
          Enterprise citation formatting with validation, batch processing, and export capabilities
        </p>
      </div>

      {/* Stats Bar */}
      {results.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className={cn("text-xs uppercase", theme.text.tertiary)}>Total</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
            <div className={cn("text-xs uppercase", theme.text.tertiary)}>Valid</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.warnings}</div>
            <div className={cn("text-xs uppercase", theme.text.tertiary)}>Warnings</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
            <div className={cn("text-xs uppercase", theme.text.tertiary)}>Errors</div>
          </Card>
        </div>
      )}

      {/* Input Section */}
      <Card title="Input Citations" subtitle="Enter citations (one per line) or upload a file">
        <div className="space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter citations here, one per line...

Example:
Brown v. Board of Education, 347 U.S. 483 (1954)
42 U.S.C. § 1983 (2018)
U.S. Const. amend. XIV, § 1"
            className={cn(
              "w-full h-64 p-4 rounded-lg border resize-none font-mono text-sm",
              theme.surface.default,
              theme.border.default,
              theme.text.primary,
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              icon={Wand2}
              onClick={handleFormat}
              disabled={!inputText.trim() || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Format Citations'}
            </Button>

            <label>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button variant="outline" icon={Upload} as="span">
                Upload File
              </Button>
            </label>

            <Button variant="outline" icon={Plus} onClick={handleAddSamples}>
              Add Samples
            </Button>

            {results.length > 0 && (
              <Button variant="outline" icon={Trash2} onClick={handleClear}>
                Clear All
              </Button>
            )}
          </div>

          {/* Format Options */}
          <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4 text-slate-500" />
              <h4 className={cn("font-bold text-sm", theme.text.primary)}>Format Options</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={italicizeCaseNames}
                  onChange={(e) => setItalicizeCaseNames(e.target.checked)}
                  className="rounded"
                />
                <span className={cn("text-sm", theme.text.secondary)}>Italicize Case Names</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useSmallCaps}
                  onChange={(e) => setUseSmallCaps(e.target.checked)}
                  className="rounded"
                />
                <span className={cn("text-sm", theme.text.secondary)}>Use Small Caps</span>
              </label>

              <div>
                <label className={cn("text-xs uppercase font-bold mb-1 block", theme.text.tertiary)}>
                  Citation Format
                </label>
                <select
                  value={formatStyle}
                  onChange={(e) => setFormatStyle(e.target.value as CitationFormat)}
                  className={cn(
                    "w-full px-3 py-1.5 rounded border text-sm",
                    theme.surface.default,
                    theme.border.default,
                    theme.text.primary
                  )}
                >
                  <option value={CitationFormat.FULL}>Full Citation</option>
                  <option value={CitationFormat.SHORT_FORM}>Short Form</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Section */}
      {results.length > 0 && (
        <Card
          title="Formatted Citations"
          subtitle={`${filteredResults.length} of ${results.length} citations`}
        >
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className={cn(
                  "px-3 py-1.5 rounded border text-sm",
                  theme.surface.default,
                  theme.border.default
                )}
              >
                <option value="ALL">All Types</option>
                <option value={BluebookCitationType.CASE}>Cases Only</option>
                <option value={BluebookCitationType.STATUTE}>Statutes Only</option>
                <option value={BluebookCitationType.CONSTITUTION}>Constitution Only</option>
                <option value={BluebookCitationType.REGULATION}>Regulations Only</option>
                <option value={BluebookCitationType.BOOK}>Books Only</option>
              </select>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyErrors}
                  onChange={(e) => setShowOnlyErrors(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-slate-600">Errors Only</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" icon={Copy} size="sm" onClick={handleCopyAll}>
                Copy All
              </Button>
              
              <Button variant="outline" icon={Table} size="sm" onClick={handleGenerateTOA}>
                Table of Authorities
              </Button>

              <div className="relative group">
                <Button variant="outline" icon={FileDown} size="sm">
                  Export
                </Button>
                <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10">
                  <div className={cn("py-1 rounded-lg border shadow-lg", theme.surface.default, theme.border.default)}>
                    <button
                      onClick={() => handleExport(ExportFormat.PLAIN_TEXT)}
                      className={cn("w-full px-4 py-2 text-left text-sm hover:bg-slate-100", theme.text.primary)}
                    >
                      Plain Text
                    </button>
                    <button
                      onClick={() => handleExport(ExportFormat.HTML)}
                      className={cn("w-full px-4 py-2 text-left text-sm hover:bg-slate-100", theme.text.primary)}
                    >
                      HTML
                    </button>
                    <button
                      onClick={() => handleExport(ExportFormat.JSON)}
                      className={cn("w-full px-4 py-2 text-left text-sm hover:bg-slate-100", theme.text.primary)}
                    >
                      JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-3">
            {filteredResults.map((result) => (
              <div
                key={result.id}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  theme.surface.default,
                  result.isValid ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Type Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      {result.isValid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      )}
                      <Badge variant="secondary" size="sm">
                        {result.citation?.type || 'Unknown'}
                      </Badge>
                    </div>

                    {/* Formatted Citation */}
                    <div
                      className={cn("text-sm mb-2", theme.text.primary)}
                      dangerouslySetInnerHTML={{ __html: result.formatted }}
                    />

                    {/* Original (if different) */}
                    {result.formatted !== result.original && (
                      <div className={cn("text-xs italic", theme.text.tertiary)}>
                        Original: {result.original}
                      </div>
                    )}

                    {/* Validation Errors */}
                    {result.citation && result.citation.validationErrors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {result.citation.validationErrors.map((error, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "text-xs p-2 rounded",
                              error.severity === ValidationSeverity.ERROR
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            )}
                          >
                            <strong>{error.code}:</strong> {error.message}
                            {error.suggestion && (
                              <div className="mt-1 text-[10px]">💡 {error.suggestion}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCopy(result.formatted)}
                      className={cn(
                        "p-2 rounded hover:bg-slate-100 transition-colors",
                        theme.text.secondary
                      )}
                      title="Copy"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleDetails(result.id)}
                      className={cn(
                        "p-2 rounded hover:bg-slate-100 transition-colors",
                        theme.text.secondary
                      )}
                      title={result.showDetails ? "Hide Details" : "Show Details"}
                    >
                      {result.showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => removeResult(result.id)}
                      className="p-2 rounded hover:bg-red-100 text-red-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Detailed Info */}
                {result.showDetails && result.citation && (
                  <div className={cn("mt-3 pt-3 border-t text-xs", theme.border.default)}>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <strong className={cn(theme.text.tertiary)}>Type:</strong>
                        <span className={cn("ml-2", theme.text.secondary)}>
                          {result.citation.type}
                        </span>
                      </div>
                      {result.citation.metadata && (
                        <>
                          <div>
                            <strong className={cn(theme.text.tertiary)}>Created:</strong>
                            <span className={cn("ml-2", theme.text.secondary)}>
                              {new Date(result.citation.metadata.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredResults.length === 0 && (
              <div className="text-center py-12">
                <Info className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className={cn("text-sm", theme.text.secondary)}>
                  {showOnlyErrors ? 'No errors found' : 'No citations match the current filter'}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Help Section */}
      <Card title="Quick Reference" className="text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className={cn("font-bold mb-2", theme.text.primary)}>Supported Citation Types:</h4>
            <ul className={cn("space-y-1 text-xs", theme.text.secondary)}>
              <li>• Cases (Rule 10)</li>
              <li>• Statutes (Rule 12)</li>
              <li>• Constitutional Provisions (Rule 11)</li>
              <li>• Regulations (Rule 14)</li>
              <li>• Books & Treatises (Rule 15)</li>
              <li>• Law Reviews & Journals (Rule 16)</li>
              <li>• Web Resources (Rule 18.2)</li>
            </ul>
          </div>
          <div>
            <h4 className={cn("font-bold mb-2", theme.text.primary)}>Example Formats:</h4>
            <ul className={cn("space-y-1 text-xs font-mono", theme.text.secondary)}>
              <li>Brown v. Board, 347 U.S. 483 (1954)</li>
              <li>42 U.S.C. § 1983 (2018)</li>
              <li>U.S. Const. amend. XIV, § 1</li>
              <li>29 C.F.R. § 1614.101 (2020)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BluebookFormatter;
