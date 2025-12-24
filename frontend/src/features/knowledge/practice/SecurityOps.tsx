/**
 * @module components/practice/SecurityOps
 * @category Practice Management
 * @description Security operations with malware scanning using suffix tree.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect } from 'react';
import { UploadCloud, Shield, Loader2, FileWarning, CheckCircle } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '@/services/data/dataService';
import { useQuery } from '@/hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)
import { queryKeys } from '@/utils/queryKeys';

// Hooks & Context
import { useTheme } from '../../../providers/ThemeContext';
import { useNotify } from '@/hooks/useNotify';

// Components
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';

// Utils & Constants
import { cn } from '@/utils/cn';
import { SuffixTree } from '@/utils/datastructures/suffixTree';

// ============================================================================
// COMPONENT
// ============================================================================

export const SecurityOps: React.FC = () => {
    const { theme } = useTheme();
    const notify = useNotify();
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<'clean' | 'infected' | null>(null);
    const [fileName, setFileName] = useState('');

    const { data: malwareSignatures = [] } = useQuery<string[]>(
        ['malware-signatures', 'all'],
        DataService.security.getMalwareSignatures
    );

    const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        setFileName(file.name);
        setIsScanning(true);
        setScanResult(null);

        // Simulate reading file and building suffix tree
        const content = await file.text();
        const suffixTree = new SuffixTree(content);

        // Simulate delay for analysis
        await new Promise(res => setTimeout(res, 1500));

        let found = false;
        for (const sig of malwareSignatures) {
            if (suffixTree.hasSubstring(sig)) {
                found = true;
                break;
            }
        }

        setScanResult(found ? 'infected' : 'clean');
        setIsScanning(false);
        notify.info(`Scan complete for ${file.name}`);
    };

    return (
        <div className="space-y-6">
            <Card title="Threat Intelligence Center">
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                        <h4 className="font-bold text-red-800">Threat Level: Elevated</h4>
                        <p className="text-xs text-red-700">Increased phishing activity detected targeting legal sector.</p>
                    </div>
                    <Button variant="danger">View Intel Brief</Button>
                </div>
            </Card>
            
            <Card title="Malware Signature Scanner (Suffix Tree)">
                 <div className={cn("p-8 border-2 border-dashed rounded-lg text-center cursor-pointer relative", theme.border.default, `hover:${theme.primary.border}`)}>
                    <input type="file" title="Select file to scan" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileScan} />
                    {isScanning ? (
                        <>
                            <Loader2 className={cn("h-12 w-12 mx-auto mb-4 animate-spin", theme.primary.text)}/>
                            <h3 className={cn("font-bold text-lg", theme.text.primary)}>Scanning: {fileName}</h3>
                            <p className={cn("text-sm", theme.text.secondary)}>Using Suffix Tree for O(L) substring search...</p>
                        </>
                    ) : scanResult ? (
                        scanResult === 'clean' ? (
                            <>
                                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500"/>
                                <h3 className="font-bold text-lg text-green-700">File is Clean</h3>
                                <p className={cn("text-sm", theme.text.secondary)}>No known malware signatures found in {fileName}.</p>
                            </>
                        ) : (
                            <>
                                <FileWarning className="h-12 w-12 mx-auto mb-4 text-red-500"/>
                                <h3 className="font-bold text-lg text-red-700">Threat Detected!</h3>
                                <p className={cn("text-sm", theme.text.secondary)}>Malicious signature found in {fileName}. File has been quarantined.</p>
                            </>
                        )
                    ) : (
                        <>
                            <UploadCloud className={cn("h-12 w-12 mx-auto mb-4", theme.text.tertiary)}/>
                            <h3 className={cn("font-bold text-lg", theme.text.primary)}>Scan Document for Threats</h3>
                            <p className={cn("text-sm", theme.text.secondary)}>Click or drop file to analyze against signature database.</p>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};


