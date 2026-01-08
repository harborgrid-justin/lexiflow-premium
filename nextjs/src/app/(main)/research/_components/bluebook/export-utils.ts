/**
 * @module research/bluebook/export-utils
 * @category Legal Research - Citation Formatting
 * @description Export utilities for Table of Authorities and citation exports
 */

import {
  FormattingResult,
  BluebookCitationType,
  TableOfAuthorities,
  TOAEntry
} from './types';
import { BluebookFormatter } from './citation-utils';

// =============================================================================
// TABLE OF AUTHORITIES GENERATION
// =============================================================================

/**
 * Generate a Table of Authorities from formatting results
 */
export function generateTableOfAuthorities(results: FormattingResult[]): string {
  const validCitations = results.filter(r => r.isValid && r.citation);

  const groupedByType = validCitations.reduce((acc, result) => {
    const type = result.citation?.type || BluebookCitationType.UNKNOWN;
    if (!acc[type]) acc[type] = [];
    acc[type].push(result);
    return acc;
  }, {} as Record<string, FormattingResult[]>);

  let toa = '# TABLE OF AUTHORITIES\n\n';

  // Define order of citation types
  const typeOrder: BluebookCitationType[] = [
    BluebookCitationType.CASE,
    BluebookCitationType.CONSTITUTION,
    BluebookCitationType.STATUTE,
    BluebookCitationType.REGULATION,
    BluebookCitationType.BOOK,
    BluebookCitationType.LAW_REVIEW,
    BluebookCitationType.JOURNAL,
    BluebookCitationType.WEB_RESOURCE
  ];

  const typeLabels: Record<BluebookCitationType, string> = {
    [BluebookCitationType.CASE]: 'CASES',
    [BluebookCitationType.CONSTITUTION]: 'CONSTITUTIONAL PROVISIONS',
    [BluebookCitationType.STATUTE]: 'STATUTES',
    [BluebookCitationType.REGULATION]: 'REGULATIONS',
    [BluebookCitationType.BOOK]: 'BOOKS AND TREATISES',
    [BluebookCitationType.LAW_REVIEW]: 'LAW REVIEW ARTICLES',
    [BluebookCitationType.JOURNAL]: 'JOURNAL ARTICLES',
    [BluebookCitationType.WEB_RESOURCE]: 'OTHER AUTHORITIES',
    [BluebookCitationType.UNKNOWN]: 'OTHER'
  };

  for (const type of typeOrder) {
    const citations = groupedByType[type];
    if (!citations || citations.length === 0) continue;

    toa += `## ${typeLabels[type] || type}\n\n`;

    citations
      .sort((a, b) => {
        const textA = BluebookFormatter.stripFormatting(a.formatted);
        const textB = BluebookFormatter.stripFormatting(b.formatted);
        return textA.localeCompare(textB);
      })
      .forEach((result, idx) => {
        const cleanText = BluebookFormatter.stripFormatting(result.formatted);
        toa += `${idx + 1}. ${cleanText}\n`;
      });

    toa += '\n';
  }

  return toa;
}

/**
 * Generate structured Table of Authorities object
 */
export function createTableOfAuthorities(results: FormattingResult[]): TableOfAuthorities {
  const toa: TableOfAuthorities = {
    cases: [],
    statutes: [],
    regulations: [],
    constitutions: [],
    secondary: []
  };

  const validCitations = results.filter(r => r.isValid && r.citation);

  validCitations.forEach(result => {
    const citation = BluebookFormatter.stripFormatting(result.formatted);
    const type = result.citation?.type;

    const entry: TOAEntry = { citation, pages: [1] };

    switch (type) {
      case BluebookCitationType.CASE:
        if (!toa.cases.find(c => c.citation === citation)) {
          toa.cases.push(entry);
        }
        break;
      case BluebookCitationType.STATUTE:
        if (!toa.statutes.find(s => s.citation === citation)) {
          toa.statutes.push(entry);
        }
        break;
      case BluebookCitationType.REGULATION:
        if (!toa.regulations.find(r => r.citation === citation)) {
          toa.regulations.push(entry);
        }
        break;
      case BluebookCitationType.CONSTITUTION:
        if (!toa.constitutions.find(c => c.citation === citation)) {
          toa.constitutions.push(entry);
        }
        break;
      default:
        if (!toa.secondary.find(s => s.citation === citation)) {
          toa.secondary.push(entry);
        }
    }
  });

  // Sort each category alphabetically
  toa.cases.sort((a, b) => a.citation.localeCompare(b.citation));
  toa.statutes.sort((a, b) => a.citation.localeCompare(b.citation));
  toa.regulations.sort((a, b) => a.citation.localeCompare(b.citation));
  toa.constitutions.sort((a, b) => a.citation.localeCompare(b.citation));
  toa.secondary.sort((a, b) => a.citation.localeCompare(b.citation));

  return toa;
}

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

/**
 * Export citations to plain text
 */
export function exportToText(results: FormattingResult[]): void {
  const text = results
    .filter(r => r.isValid)
    .map(r => BluebookFormatter.stripFormatting(r.formatted))
    .join('\n\n');

  downloadFile(text, 'citations.txt', 'text/plain');
}

/**
 * Export citations to HTML
 */
export function exportToHTML(results: FormattingResult[]): void {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Formatted Citations - Bluebook Format</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', Georgia, serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      color: #1a1a1a;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 24px;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 12px;
    }
    .citation {
      margin-bottom: 1.5em;
      padding: 12px 16px;
      border-left: 3px solid #e5e7eb;
      background: #f9fafb;
    }
    .citation.valid { border-left-color: #22c55e; }
    .citation.invalid {
      border-left-color: #ef4444;
      background: #fef2f2;
    }
    .type {
      color: #6b7280;
      font-size: 0.75em;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
      display: block;
    }
    .formatted { font-size: 14px; }
    .formatted em { font-style: italic; }
    .small-caps { font-variant: small-caps; }
    .meta {
      font-size: 0.75em;
      color: #9ca3af;
      margin-top: 8px;
    }
    .stats {
      background: #f1f5f9;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      display: flex;
      gap: 24px;
    }
    .stat { text-align: center; }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
    }
    .stat-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
    }
    @media print {
      body { max-width: none; margin: 0; padding: 20px; }
      .stats { display: none; }
    }
  </style>
</head>
<body>
  <h1>Formatted Legal Citations</h1>

  <div class="stats">
    <div class="stat">
      <div class="stat-value">${results.length}</div>
      <div class="stat-label">Total</div>
    </div>
    <div class="stat">
      <div class="stat-value">${results.filter(r => r.isValid).length}</div>
      <div class="stat-label">Valid</div>
    </div>
    <div class="stat">
      <div class="stat-value">${results.filter(r => !r.isValid).length}</div>
      <div class="stat-label">Errors</div>
    </div>
  </div>

  ${results.map(r => `
    <div class="citation ${r.isValid ? 'valid' : 'invalid'}">
      <span class="type">${r.citation?.type || 'Unknown'}</span>
      <div class="formatted">${r.formatted}</div>
      ${r.original !== BluebookFormatter.stripFormatting(r.formatted)
        ? `<div class="meta">Original: ${r.original}</div>`
        : ''
      }
    </div>
  `).join('')}

  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
    Generated by LexiFlow Bluebook Formatter - ${new Date().toLocaleDateString()}
  </footer>
</body>
</html>
  `.trim();

  downloadFile(html, 'citations.html', 'text/html');
}

/**
 * Export citations to JSON
 */
export function exportToJSON(results: FormattingResult[]): void {
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalCitations: results.length,
    validCitations: results.filter(r => r.isValid).length,
    citations: results.map(r => ({
      id: r.id,
      original: r.original,
      formatted: BluebookFormatter.stripFormatting(r.formatted),
      formattedHtml: r.formatted,
      type: r.citation?.type || 'UNKNOWN',
      isValid: r.isValid,
      citation: r.citation
    }))
  };

  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, 'citations.json', 'application/json');
}

/**
 * Export Table of Authorities to text
 */
export function exportTOAToText(results: FormattingResult[]): void {
  const toa = generateTableOfAuthorities(results);
  downloadFile(toa, 'table-of-authorities.txt', 'text/plain');
}

/**
 * Export Table of Authorities to HTML
 */
export function exportTOAToHTML(results: FormattingResult[]): void {
  const toaData = createTableOfAuthorities(results);

  const renderSection = (title: string, entries: TOAEntry[]): string => {
    if (entries.length === 0) return '';
    return `
      <section>
        <h2>${title}</h2>
        <ul>
          ${entries.map(e => `<li>${e.citation}</li>`).join('\n          ')}
        </ul>
      </section>
    `;
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Table of Authorities</title>
  <style>
    body {
      font-family: 'Times New Roman', Georgia, serif;
      line-height: 1.8;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
    }
    h1 {
      text-align: center;
      font-size: 18px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 32px;
    }
    h2 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #000;
      padding-bottom: 4px;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    li {
      margin-bottom: 8px;
      padding-left: 24px;
      text-indent: -24px;
      font-size: 14px;
    }
    @media print {
      body { max-width: none; margin: 0; }
    }
  </style>
</head>
<body>
  <h1>Table of Authorities</h1>

  ${renderSection('Cases', toaData.cases)}
  ${renderSection('Constitutional Provisions', toaData.constitutions)}
  ${renderSection('Statutes', toaData.statutes)}
  ${renderSection('Regulations', toaData.regulations)}
  ${renderSection('Other Authorities', toaData.secondary)}
</body>
</html>
  `.trim();

  downloadFile(html, 'table-of-authorities.html', 'text/html');
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Download file to user's device
 */
function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Open Table of Authorities in new window
 */
export function openTOAInWindow(results: FormattingResult[]): void {
  if (results.length === 0) return;

  const toa = generateTableOfAuthorities(results);
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Table of Authorities</title>
      <style>
        body {
          font-family: 'Times New Roman', serif;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.6;
        }
        h1, h2 {
          font-weight: normal;
        }
        pre {
          white-space: pre-wrap;
          font-family: inherit;
        }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <pre>${toa}</pre>
      <script>
        // Auto-print option
        if (window.location.search.includes('print=true')) {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

/**
 * Copy Table of Authorities to clipboard
 */
export async function copyTOAToClipboard(results: FormattingResult[]): Promise<boolean> {
  if (results.length === 0) return false;

  const toa = generateTableOfAuthorities(results);

  try {
    await navigator.clipboard.writeText(toa);
    return true;
  } catch {
    return false;
  }
}
