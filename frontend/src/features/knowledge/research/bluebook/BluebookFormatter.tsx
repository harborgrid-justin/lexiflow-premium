/**
 * @module components/research/BluebookFormatter
 * @category Legal Research - Citation Formatting
 * @description Enterprise Bluebook citation formatter with batch processing, validation, and export
 */

import { useNotify } from '@/hooks/useNotify';
import { BluebookFormatter as Formatter } from '@/services/features/bluebook/bluebookFormatter';
import { BluebookParser } from '@/services/features/bluebook/bluebookParser';
import { CitationFormat, ExportFormat } from '@/types/bluebook';
import { BookOpen } from 'lucide-react';
import { useCallback, useDeferredValue, useState } from 'react';
import { exportToHTML, exportToJSON, exportToText, generateTableOfAuthorities } from './exportUtils';
import { HelpSection } from './HelpSection';
import { InputSection } from './InputSection';
import { ResultsSection } from './ResultsSection';
import { StatsBar } from './StatsBar';
import type { FilterOptions, FormatOptions, FormattingResult } from './types';
import { useFilteredResults } from './useFilteredResults';
import { useFormattingStats } from './useFormattingStats';

const SAMPLE_CITATIONS = `Brown v. Board of Education, 347 U.S. 483 (1954)
42 U.S.C. § 1983 (2018)
U.S. Const. art. I, § 8
21 C.F.R. § 314.126 (2022)`;

export const BluebookFormatter: React.FC = () => {
  const notify = useNotify();

  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<FormattingResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formatOptions, setFormatOptions] = useState<FormatOptions>({
    format: CitationFormat.FULL,
    italicizeCaseNames: true,
    useSmallCaps: true
  });
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'ALL',
    showOnlyErrors: false
  });

  // Defer filter updates for better UX
  const deferredFilters = useDeferredValue(filters);

  const stats = useFormattingStats(results);
  const filteredResults = useFilteredResults(results, deferredFilters);

  const handleFormat = useCallback(async () => {
    if (!inputText.trim()) {
      notify.warning('Please enter citations to format');
      return;
    }

    setIsProcessing(true);
    try {
      const lines = inputText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const newResults: FormattingResult[] = lines.map(line => {
        const citation = BluebookParser.parse(line);
        const formatted = citation
          ? Formatter.format(citation, {
            italicizeCaseNames: formatOptions.italicizeCaseNames,
            useSmallCaps: formatOptions.useSmallCaps,
            format: formatOptions.format.toLowerCase() as "full" | "short"
          })
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
  }, [inputText, formatOptions, notify]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setInputText(e.target?.result as string || '');
    reader.readAsText(file);
  }, []);

  const handleAddSamples = useCallback(() => {
    setInputText(prev => prev ? `${prev}\n${SAMPLE_CITATIONS}` : SAMPLE_CITATIONS);
  }, []);

  const handleCopy = useCallback((formatted: string) => {
    navigator.clipboard.writeText(Formatter.stripFormatting(formatted));
    notify.success('Citation copied to clipboard');
  }, [notify]);

  const handleCopyAll = useCallback(() => {
    const text = results.map(r => Formatter.stripFormatting(r.formatted)).join('\n\n');
    navigator.clipboard.writeText(text);
    notify.success(`Copied ${results.length} citations`);
  }, [results, notify]);

  const handleToggleDetails = useCallback((id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, showDetails: !r.showDetails } : r));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleGenerateTOA = useCallback(() => {
    if (results.length === 0) {
      notify.warning('No citations available');
      return;
    }
    const toa = generateTableOfAuthorities(results);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>Table of Authorities</title></head><body><pre>${toa}</pre></body></html>`);
    }
  }, [results, notify]);

  const handleExport = useCallback((format: ExportFormat) => {
    if (results.length === 0) {
      notify.warning('No citations to export');
      return;
    }
    switch (format) {
      case ExportFormat.PLAIN_TEXT: exportToText(results); break;
      case ExportFormat.HTML: exportToHTML(results); break;
      case ExportFormat.JSON: exportToJSON(results); break;
    }
    notify.success(`Exported ${results.length} citations`);
  }, [results, notify]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Bluebook Citation Formatter</h1>
          <p className="text-slate-600">Format legal citations according to The Bluebook (21st ed.)</p>
        </div>
      </div>

      <StatsBar stats={stats} />

      <InputSection
        inputText={inputText}
        onInputChange={setInputText}
        onFileUpload={handleFileUpload}
        onAddSamples={handleAddSamples}
        onClearAll={() => setInputText('')}
        onFormat={handleFormat}
        isProcessing={isProcessing}
        formatOptions={formatOptions}
        onFormatOptionsChange={setFormatOptions}
      />

      <ResultsSection
        results={results}
        filteredResults={filteredResults}
        filters={filters}
        onFiltersChange={setFilters}
        onCopy={handleCopy}
        onCopyAll={handleCopyAll}
        onToggleDetails={handleToggleDetails}
        onRemove={handleRemove}
        onGenerateTOA={handleGenerateTOA}
        onExport={handleExport}
      />

      <HelpSection />
    </div>
  );
};
