import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react';
import { exportToCSV, exportToJSON, exportMetricsToExcel, generateDashboardPDF, ExportData } from '@/lib/exportUtils';
import { toast } from 'sonner';

interface ExportMenuProps {
  data: ExportData;
  className?: string;
}

export function ExportMenu({ data, className }: ExportMenuProps) {
  const handleExport = (format: 'csv' | 'json' | 'excel' | 'pdf') => {
    try {
      switch (format) {
        case 'csv':
          exportToCSV(data);
          toast.success('Data exported to CSV successfully');
          break;
        case 'json':
          exportToJSON(data);
          toast.success('Data exported to JSON successfully');
          break;
        case 'excel':
          exportMetricsToExcel(data);
          toast.success('Data exported to Excel successfully');
          break;
        case 'pdf':
          generateDashboardPDF(data.title, [
            {
              title: 'Overview',
              content: '<p>Dashboard metrics and key performance indicators</p>'
            }
          ]);
          toast.success('PDF report generated successfully');
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="w-4 h-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="w-4 h-4 mr-2" />
          Generate PDF Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
