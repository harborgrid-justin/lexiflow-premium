
import React from 'react';
import { Server, HardDrive } from 'lucide-react';

interface AdminDataRegistryProps {
  dataFiles: Array<{ name: string; type: string; records: number; size: string }>;
}

export const AdminDataRegistry: React.FC<AdminDataRegistryProps> = ({ dataFiles }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">System Data Registries</h3>
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Server className="h-3 w-3"/>
          Production Status: Healthy
        </div>
      </div>
      <div className="p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataFiles.map((file, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-sm transition-all group cursor-default">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-slate-100 p-2 rounded group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <HardDrive className="h-5 w-5 text-slate-600 group-hover:text-blue-600"/>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{file.name}</h4>
                  <p className="text-xs text-slate-500">{file.type}</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 border-t pt-2">
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
