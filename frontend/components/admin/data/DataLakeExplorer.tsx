
import React, { useState } from 'react';
import { Folder, File, HardDrive, Search, Download, MoreHorizontal, FileText, Image, Film, UploadCloud, ChevronRight, Home, Loader2 } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { SearchToolbar } from '../../common/SearchToolbar';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { useWindow } from '../../../context/WindowContext';
import { DocumentPreviewPanel } from '../../documents/viewer/DocumentPreviewPanel';
import { DataService } from '../../../services/dataService';
import { useQuery } from '../../../services/queryClient';
import { DataLakeItem } from '../../../types';

export const DataLakeExplorer: React.FC = () => {
    const { theme } = useTheme();
    const { openWindow } = useWindow();
    const [currentPath, setCurrentPath] = useState<string[]>(['root']);
    const [selection, setSelection] = useState<string[]>([]);
    
    const currentFolderId = currentPath[currentPath.length - 1];

    const { data: items = [], isLoading } = useQuery<DataLakeItem[]>(
        ['lake', currentFolderId],
        () => DataService.catalog.getDataLakeItems(currentFolderId)
    );

    const handleNavigate = (folderId: string) => {
        setCurrentPath([...currentPath, folderId]);
        setSelection([]);
    };

    const handleBreadcrumb = (index: number) => {
        setCurrentPath(currentPath.slice(0, index + 1));
        setSelection([]);
    };

    const getFileIcon = (format?: string, type?: string) => {
        if (type === 'folder') return <Folder className="h-5 w-5 text-blue-500 fill-blue-100" />;
        if (format === 'JSON' || format === 'CSV') return <FileText className="h-5 w-5 text-green-600" />;
        if (format === 'Parquet') return <DatabaseIcon className="h-5 w-5 text-purple-600" />;
        return <File className="h-5 w-5 text-slate-500" />;
    };

    const handleFileClick = (file: DataLakeItem) => {
        if (file.type === 'folder') {
            handleNavigate(file.name);
        } else {
            // Preview logic
             openWindow(
                `preview-${file.id}`,
                `Preview: ${file.name}`,
                <div className={cn("h-full", theme.surface.default)}>
                    <DocumentPreviewPanel 
                        document={{
                            id: file.id,
                            title: file.name,
                            type: file.format || 'File',
                            content: `Preview of raw data object: ${file.name}`,
                            uploadDate: file.modified,
                            lastModified: file.modified,
                            tags: [file.tier, 'Data Lake'],
                            versions: [],
                            caseId: 'System' as any
                        }}
                        onViewHistory={() => {}}
                        isOrbital={true}
                    />
                </div>
            );
        }
    };

    if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className={cn("animate-spin", theme.primary.text)}/></div>;

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className={cn("p-4 border-b flex justify-between items-center", theme.surface.default, theme.border.default)}>
                <div>
                    <h3 className={cn("text-lg font-bold flex items-center gap-2", theme.text.primary)}>
                        <HardDrive className="h-5 w-5 text-indigo-600"/> Data Lake Storage
                    </h3>
                    <p className={cn("text-xs", theme.text.secondary)}>S3 Compatible Object Store • us-east-1</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={Download} disabled={selection.length === 0}>Download</Button>
                    <Button variant="primary" icon={UploadCloud}>Upload Object</Button>
                </div>
            </div>

            <div className={cn("p-2 border-b flex items-center gap-2 text-sm", theme.surface.highlight, theme.border.default)}>
                <button onClick={() => handleBreadcrumb(0)} className={cn("p-1 rounded", theme.text.secondary, `hover:${theme.surface.default}`)}><Home className="h-4 w-4"/></button>
                {currentPath.slice(1).map((folder, i) => (
                    <React.Fragment key={folder}>
                        <ChevronRight className="h-4 w-4 text-slate-400"/>
                        <button 
                            onClick={() => handleBreadcrumb(i + 1)}
                            className={cn("px-2 py-0.5 rounded font-medium", i === currentPath.length - 2 ? theme.text.primary : theme.text.secondary, `hover:${theme.surface.default}`)}
                        >
                            {folder}
                        </button>
                    </React.Fragment>
                ))}
            </div>

            <div className="flex-1 overflow-auto p-4">
                <Card noPadding className="h-full flex flex-col">
                    <TableContainer className="border-0 shadow-none rounded-none flex-1">
                        <TableHeader>
                            <TableHead className="w-10"><input type="checkbox"/></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Storage Tier</TableHead>
                            <TableHead>Last Modified</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 && (
                                <TableRow><TableCell colSpan={7} className={cn("text-center py-12", theme.text.tertiary)}>Folder is empty</TableCell></TableRow>
                            )}
                            {items.map(item => (
                                <TableRow key={item.id} className={cn("cursor-pointer", `hover:${theme.surface.highlight}`)} onClick={() => handleFileClick(item)}>
                                    <TableCell onClick={e => e.stopPropagation()}>
                                        <input 
                                            type="checkbox" 
                                            checked={selection.includes(item.id)}
                                            onChange={(e) => {
                                                if(e.target.checked) setSelection([...selection, item.id]);
                                                else setSelection(selection.filter(id => id !== item.id));
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(item.format, item.type)}
                                            <span className={cn("font-medium", theme.text.primary)}>{item.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{item.size || '-'}</TableCell>
                                    <TableCell>{item.format || 'Folder'}</TableCell>
                                    <TableCell>
                                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", 
                                            item.tier === 'Hot' ? cn(theme.status.error.bg, theme.status.error.text, theme.status.error.border) :
                                            item.tier === 'Cool' ? cn(theme.status.info.bg, theme.status.info.text, theme.status.info.border) :
                                            cn(theme.surface.highlight, theme.text.secondary, theme.border.default)
                                        )}>{item.tier}</span>
                                    </TableCell>
                                    <TableCell className={cn("text-xs", theme.text.secondary)}>{item.modified}</TableCell>
                                    <TableCell className="text-right">
                                        <button className={cn("p-1 rounded", theme.text.tertiary, `hover:${theme.surface.highlight}`)} onClick={e => e.stopPropagation()}>
                                            <MoreHorizontal className="h-4 w-4"/>
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableContainer>
                </Card>
            </div>
        </div>
    );
};

export default DataLakeExplorer;

const DatabaseIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
);
