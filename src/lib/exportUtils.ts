import { format } from 'date-fns';

export interface ExportData {
  title: string;
  data: any[];
  columns: string[];
  metadata?: {
    generatedAt?: string;
    generatedBy?: string;
    period?: string;
  };
}

export function exportToCSV(exportData: ExportData): void {
  const { title, data, columns, metadata } = exportData;

  let csv = '';

  if (metadata) {
    csv += `# ${title}\n`;
    csv += `# Generated: ${metadata.generatedAt || new Date().toISOString()}\n`;
    if (metadata.period) csv += `# Period: ${metadata.period}\n`;
    csv += '\n';
  }

  csv += columns.join(',') + '\n';

  data.forEach(row => {
    const values = columns.map(col => {
      const value = row[col];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    });
    csv += values.join(',') + '\n';
  });

  downloadFile(csv, `${sanitizeFileName(title)}_${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
}

export function exportToJSON(exportData: ExportData): void {
  const { title, data, metadata } = exportData;

  const jsonData = {
    title,
    metadata: {
      generatedAt: new Date().toISOString(),
      ...metadata
    },
    data
  };

  const json = JSON.stringify(jsonData, null, 2);
  downloadFile(json, `${sanitizeFileName(title)}_${format(new Date(), 'yyyy-MM-dd')}.json`, 'application/json');
}

export function exportMetricsToExcel(exportData: ExportData): void {
  const { title, data, columns } = exportData;

  let html = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #5FB85A; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated: ${format(new Date(), 'PPpp')}</p>
        <table>
          <thead>
            <tr>
              ${columns.map(col => `<th>${col}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${columns.map(col => `<td>${row[col] ?? ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  downloadFile(html, `${sanitizeFileName(title)}_${format(new Date(), 'yyyy-MM-dd')}.xls`, 'application/vnd.ms-excel');
}

export function generateDashboardPDF(dashboardTitle: string, sections: { title: string; content: string }[]): void {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @page {
          size: A4;
          margin: 2cm;
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        h1 {
          color: #5FB85A;
          border-bottom: 3px solid #5FB85A;
          padding-bottom: 10px;
          margin-bottom: 30px;
        }
        h2 {
          color: #444;
          margin-top: 40px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .metadata {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 30px;
        }
        .section {
          page-break-inside: avoid;
          margin-bottom: 30px;
        }
        .footer {
          position: fixed;
          bottom: 0;
          width: 100%;
          text-align: center;
          font-size: 10px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <h1>${dashboardTitle}</h1>
      <div class="metadata">
        <strong>Generated:</strong> ${format(new Date(), 'PPpp')}<br>
        <strong>Organization:</strong> Egyptian Food Bank<br>
        <strong>Report Type:</strong> Executive Dashboard Export
      </div>
      ${sections.map(section => `
        <div class="section">
          <h2>${section.title}</h2>
          <div>${section.content}</div>
        </div>
      `).join('')}
      <div class="footer">
        EFB Dashboard Report - Confidential - Page <span class="page"></span>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

function downloadFile(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function prepareMetricsForExport(metrics: Record<string, any>): ExportData {
  const columns = ['Metric', 'Value', 'Change', 'Status'];
  const data = Object.entries(metrics).map(([key, value]) => ({
    Metric: formatMetricName(key),
    Value: formatValue(value),
    Change: value.change || 'N/A',
    Status: value.status || 'Normal'
  }));

  return {
    title: 'EFB Executive Metrics',
    columns,
    data,
    metadata: {
      generatedAt: new Date().toISOString(),
      generatedBy: 'EFB Dashboard',
      period: 'Current FY'
    }
  };
}

function formatMetricName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function formatValue(value: any): string {
  if (typeof value === 'number') {
    if (value > 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value > 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toFixed(2);
  }
  return String(value);
}
