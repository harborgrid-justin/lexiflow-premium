import { VirtualList } from '@/components/organisms/VirtualList/VirtualList';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useQuery } from '@/hooks/backend';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/utils/cn';
import { HardDrive, Loader2, Server } from 'lucide-react';
import React from 'react';

interface DataFile {
  name: string;
  type: string;
  records: number;
  size: string;
}

export const AdminDataRegistry: React.FC = () => {
  const { theme } = useTheme();

  const { data: dataFiles = [], isLoading } = useQuery<DataFile[]>(
    ['admin', 'registry'],
    DataService.catalog.getRegistryInfo
  );

  const renderItem = (file: DataFile) => (
    <div
      key={file.name}
      className="h-full w-full p-2"
      style={{ height: 80 }}
    >
      <div className={cn("border rounded-lg p-4 transition-all group cursor-default h-full flex items-center justify-between", theme.border.default, `hover:${theme.primary.border}`)}>
        <div className="flex items-center space-x-3">
          <div className={cn("p-2 rounded transition-colors group-hover:bg-blue-50 group-hover:text-blue-600", theme.surface.highlight)}>
            <HardDrive className={cn("h-5 w-5 group-hover:text-blue-600", theme.text.secondary)} />
          </div>
          <div>
            <h4 className={cn("font-bold text-sm", theme.text.primary)}>{file.name}</h4>
            <p className={cn("text-xs", theme.text.secondary)}>{file.type}</p>
          </div>
        </div>
        <div className={cn("flex flex-col text-right text-xs", theme.text.secondary)}>
          <span>Records: {file.records.toLocaleString()}</span>
          <span className="font-mono">{file.size}</span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className={cn("animate-spin h-6 w-6", theme.primary.text)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className={cn("p-4 border-b flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
        <h3 className={cn("font-bold", theme.text.primary)}>System Data Registries</h3>
        <div className={cn("text-xs flex items-center gap-2", theme.text.secondary)}>
          <Server className="h-3 w-3" />
          Production Status: Healthy
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <VirtualList
          items={dataFiles}
          itemHeight={96} // item height (80) + gap (16)
          renderItem={renderItem}
          height="100%"
          emptyMessage="No data registries found."
        />
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="text-sm font-bold text-yellow-800 mb-1">Data Retention Policy</h4>
          <p className="text-xs text-yellow-700">All case data is retained for 7 years post-closing per regulatory requirements. Consult your data retention policy for your jurisdiction.</p>
        </div>
      </div>
    </div>
  );
};
