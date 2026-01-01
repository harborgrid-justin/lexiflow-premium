import type { FormattingResult } from './types';

export const exportToText = (results: FormattingResult[]): void => {
  const text = results
    .filter(r => r.isValid)
    .map(r => r.formatted.replace(/<[^>]*>/g, ''))
    .join('\n\n');

  downloadFile(text, 'citations.txt', 'text/plain');
};

export const exportToHTML = (results: FormattingResult[]): void => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Formatted Citations</title>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; }
    .citation { margin-bottom: 1em; }
    .citation.invalid { color: #dc2626; }
    .type { color: #6b7280; font-size: 0.875em; }
  </style>
</head>
<body>
  <h1>Formatted Citations</h1>
  ${results.map(r => `
    <div class="citation ${r.isValid ? '' : 'invalid'}">
      <span class="type">[${r.citation?.type || 'Unknown'}]</span>
      <div>${r.formatted}</div>
    </div>
  `).join('')}
</body>
</html>
  `.trim();

  downloadFile(html, 'citations.html', 'text/html');
};

export const exportToJSON = (results: FormattingResult[]): void => {
  const json = JSON.stringify(results, null, 2);
  downloadFile(json, 'citations.json', 'application/json');
};

export const generateTableOfAuthorities = (results: FormattingResult[]): string => {
  const validCitations = results.filter(r => r.isValid && r.citation);
  
  const groupedByType = validCitations.reduce((acc, result) => {
    const type = result.citation?.type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(result);
    return acc;
  }, {} as Record<string, FormattingResult[]>);

  let toa = '# TABLE OF AUTHORITIES\n\n';

  Object.entries(groupedByType)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([type, citations]) => {
      toa += `## ${type.toUpperCase()}\n\n`;
      citations
        .sort((a, b) => {
          const textA = a.formatted.replace(/<[^>]*>/g, '');
          const textB = b.formatted.replace(/<[^>]*>/g, '');
          return textA.localeCompare(textB);
        })
        .forEach((result, idx) => {
          const cleanText = result.formatted.replace(/<[^>]*>/g, '');
          toa += `${idx + 1}. ${cleanText}\n`;
        });
      toa += '\n';
    });

  return toa;
};

const downloadFile = (content: string, filename: string, type: string): void => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
