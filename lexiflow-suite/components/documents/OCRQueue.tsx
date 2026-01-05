
import React from 'react';
import { Card } from '../common/Card.tsx';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { Badge } from '../common/Badge.tsx';
import { RefreshCw, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar.tsx';

export const OCRQueue: React.FC = () => {
    const jobs = [
        { id: 'OCR-991', file: 'Production_Vol1.pdf', pages: 450, status: 'Processing', progress: 65 },
        { id: 'OCR-992', file: 'Contract_Scan.pdf', pages: 12, status: 'Completed', progress: 100 },
        { id: 'OCR-993', file: 'Handwritten_Notes.jpg', pages: 5, status: 'Failed', progress: 0 },
    ];

    return (
        <Card title="OCR Processing Queue">
            <TableContainer className="border-0 shadow-none">
                <TableHeader>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead>Page Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                </TableHeader>
                <TableBody>
                    {jobs.map(job => (
                        <TableRow key={job.id}>
                            <TableCell className="font-mono text-xs">{job.id}</TableCell>
                            <TableCell className="flex items-center gap-2 font-medium">
                                <FileText size={14} className="text-slate-400"/> {job.file}
                            </TableCell>
                            <TableCell>{job.pages}</TableCell>
                            <TableCell>
                                {job.status === 'Processing' && <Badge variant="info">Processing</Badge>}
                                {job.status === 'Completed' && <Badge variant="success">Done</Badge>}
                                {job.status === 'Failed' && <Badge variant="error">Failed</Badge>}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 w-32">
                                    <div className="flex-1">
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${job.status === 'Failed' ? 'bg-red-500' : 'bg-blue-600'}`} style={{width: `${job.progress}%`}}></div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono">{job.progress}%</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </TableContainer>
        </Card>
    );
};
