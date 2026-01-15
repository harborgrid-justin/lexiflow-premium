import { SearchToolbar } from '@/components/organisms/SearchToolbar';
import { EmptyState } from '@/components/molecules/EmptyState/EmptyState';
import { FileAttachment } from '@/components/molecules/FileAttachment/FileAttachment';
import { Attachment } from '@/hooks/useSecureMessenger';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { FolderOpen } from 'lucide-react';

interface MessengerFilesProps {
  files: Attachment[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
}

export const MessengerFiles = ({ files, searchTerm, setSearchTerm }: MessengerFilesProps) => {
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
        {files.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No files found"
            description="No files match your search criteria. Try adjusting your filters."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, idx) => (
              <div key={idx} className="relative">
                <FileAttachment
                  name={file.name}
                  size={typeof file.size === 'number' ? String(file.size) : file.size}
                  type={file.type}
                  date={file.date}
                  onDownload={() => { }}
                  onPreview={() => { }}
                />
                <p className={cn("text-[10px] mt-1 ml-1", theme.text.tertiary)}>Sent by {file.sender}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
