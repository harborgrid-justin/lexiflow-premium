
import React from 'react';
import { Server, HardDrive } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface AdminDataRegistryProps {
  dataFiles: Array<{ name: string; type: string; records: number; size: string }>;
}

export const AdminDataRegistry: React.FC<AdminDataRegistryProps> = ({ dataFiles }) => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col h-full">
      <div className={cn("p-4 border-b flex justify-between items-center", theme.surfaceHighlight, theme.border.default)}>
        <h3 className={cn("font-bold", theme.text.primary)}>System Data Registries</h3>
        <div className={cn("text-xs flex items-center gap-2", theme.text.secondary)}>
          <Server className="h-3 w-3"/>
          Production Status: Healthy
        </div>
      </div>
      <div className="p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataFiles.map((file, idx) => (
            <div key={idx} className={cn("border rounded-lg p-4 transition-all group cursor-default hover:shadow-sm", theme.border.default, `hover:${theme.primary.border}`)}>
              <div className="flex items-center space-x-3 mb-3">
                <div className={cn("p-2 rounded transition-colors group-hover:bg-blue-50 group-hover:text-blue-600", theme.surfaceHighlight)}>
                  <HardDrive className={cn("h-5 w-5 group-hover:text-blue-600", theme.text.secondary)}/>
                </div>
                <div>
                  <h4 className={cn("font-bold text-sm", theme.text.primary)}>{file.name}</h4>
                  <p className={cn("text-xs", theme.text.secondary)}>{file.type}</p>
                </div>
              </div>
              <div className={cn("flex justify-between items-center text-xs border-t pt-2", theme.text.secondary, theme.border.light)}>
                <span>Records: {file.records}</span>
                <span className="font-mono">{file.size}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="text-sm font-bold text-yellow-800 mb-1">Data Retention Policy</h4>
          <p className="text-xs text-yellow-700">All case data is retained for 7 years post-closing. Mock data files are read-only in this environment.</p>
        </div>
      </div>
    </div>
  );
};
