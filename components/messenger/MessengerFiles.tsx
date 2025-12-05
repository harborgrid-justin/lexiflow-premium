
import React from 'react';
import { SearchToolbar } from '../common/SearchToolbar';
import { FileAttachment } from '../common/FileAttachment';
import { Attachment } from '../../hooks/useSecureMessenger';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface MessengerFilesProps {
  files: Attachment[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
}

export const MessengerFiles: React.FC<MessengerFilesProps> = ({ files, searchTerm, setSearchTerm }) => {
  const { theme } = useTheme();

  return (
    <div className="w-full flex flex-col h-full">
      <div className={cn("p-4 border-b", theme.border.default)}>
        <SearchToolbar 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Filter files by name..."
            className="border-none shadow-none p-0"
        />
      </div>
      <div className="overflow-auto flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file, idx) => (
            <div key={idx} className="relative">
                <FileAttachment 
                    name={file.name}
                    size={file.size}
                    type={file.type}
                    date={file.date}
                    onDownload={() => {}}
                    onPreview={() => {}}
                />
                <p className={cn("text-[10px] mt-1 ml-1", theme.text.tertiary)}>Sent by {file.sender}</p>
            </div>
          ))}
          {files.length === 0 && <div className={cn("col-span-full text-center py-10", theme.text.tertiary)}>No files found matching your search.</div>}
        </div>
      </div>
    </div>
  );
};
