
import { Download, FileText, ImageIcon, Search } from 'lucide-react';
import React, { useDeferredValue, useMemo } from 'react';
import { Attachment } from '../../hooks/useSecureMessenger.ts';

interface MessengerFilesProps {
  files: Attachment[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
}

export const MessengerFiles: React.FC<MessengerFilesProps> = ({ files, searchTerm, setSearchTerm }) => {
  // Guideline 4: Defer search term
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const filteredFiles = useMemo(() => {
    return files.filter(f => f.name.toLowerCase().includes(deferredSearchTerm.toLowerCase()));
  }, [files, deferredSearchTerm]);

  return (
    <div className="w-full flex flex-col">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Shared Documents & Media</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Filter files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-auto flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file, idx) => (
            <div key={idx} style={{ borderColor: 'var(--color-border)' }} className="flex items-start p-4 border rounded-lg hover:bg-slate-50 transition-colors group">
              <div className={`p-3 rounded-lg mr-4 ${file.type === 'image' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                {file.type === 'image' ? <ImageIcon className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-slate-900 truncate">{file.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{file.size} • {new Date(file.date || '').toLocaleDateString()}</p>
                <p className="text-xs text-slate-400 mt-0.5">Sent by {file.sender}</p>
              </div>
              <button style={{ color: 'var(--color-textMuted)', borderColor: 'transparent' }} className="p-2 hover:text-blue-600 rounded-full hover:bg-white opacity-0 group-hover:opacity-100 transition-all shadow-sm border hover:border-slate-200">
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
          {filteredFiles.length === 0 && <div className="col-span-full text-center py-10 text-slate-400">No files found matching your search.</div>}
        </div>
      </div>
    </div>
  );
};
