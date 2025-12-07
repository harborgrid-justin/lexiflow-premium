
import React from 'react';
import { Server, HardDrive } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { VirtualGrid } from '../../common/VirtualGrid';

interface DataFile {
    name: string;
    type: string;
    records: number;
    size: string;
}

interface AdminDataRegistryProps {
  dataFiles: DataFile[];
}

export const AdminDataRegistry: React.FC<AdminDataRegistryProps> = ({ dataFiles }) => {
  const { theme } = useTheme();

  const renderRow = (file: DataFile) => (
      <div 
        key={file.name} 
        className="h-full w-full p-2"
      >
        <div className={cn("border rounded-lg p-4 transition-all group cursor-default h-full flex items-center justify-between", theme.border.default, `hover:${theme.primary.border}`)}>
            <div className="flex items-center space-x-3">
              <div className={cn("p-2 rounded transition-colors group-hover:bg-blue-50 group-hover:text-blue-600", theme.surfaceHighlight)}>
                <HardDrive className={cn("h-5 w-5 group-hover:text-blue-600", theme.text.secondary)}/>
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

  return (
    <div className="flex flex-col h-full">
      <div className={cn("p-4 border-b flex justify-between items-center", theme.surfaceHighlight, theme.border.default)}>
        <h3 className={cn("font-bold", theme.text.primary)}>System Data Registries</h3>
        <div className={cn("text-xs flex items-center gap-2", theme.text.secondary)}>
          <Server className="h-3 w-3"/>
          Production Status: Healthy
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {/* FIX: Add missing height prop */}
        <VirtualGrid
            items={dataFiles}
            itemHeight={80} 
            itemWidth={350}
            renderItem={renderRow}
            height="100%"
            gap={16}
            emptyMessage="No data registries found."
        />
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="text-sm font-bold text-yellow-800 mb-1">Data Retention Policy</h4>
          <p className="text-xs text-yellow-700">All case data is retained for 7 years post-closing. Mock data files are read-only in this environment.</p>
        </div>
      </div>
    </div>
  );
};