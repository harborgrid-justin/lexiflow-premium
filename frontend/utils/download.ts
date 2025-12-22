/**
 * Download utility for file exports
 */

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(data: unknown, filename: string = 'data.json'): void {
  const content = JSON.stringify(data, null, 2);
  downloadFile(content, filename, 'application/json');
}

export function downloadCSV(data: unknown[], filename: string = 'data.csv'): void {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ];
  
  const content = csvRows.join('\n');
  downloadFile(content, filename, 'text/csv');
}

export function downloadText(content: string, filename: string = 'document.txt'): void {
  downloadFile(content, filename, 'text/plain');
}

export function downloadHTML(content: string, filename: string = 'document.html'): void {
  downloadFile(content, filename, 'text/html');
}
