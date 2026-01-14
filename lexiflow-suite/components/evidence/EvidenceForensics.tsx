
import { AlertOctagon, CheckCircle, Link, RefreshCw, ShieldCheck } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { DocumentService } from '../../services/documents.ts';
import { EvidenceItem } from '../../types.ts';
import { Button } from '../common/Button.tsx';
import { Card } from '../common/Card.tsx';

interface EvidenceForensicsProps {
    selectedItem: EvidenceItem;
}

export const EvidenceForensics: React.FC<EvidenceForensicsProps> = ({ selectedItem }) => {
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
    const [verifyData, setVerifyData] = useState<{ timestamp: string, block: number } | null>(null);

    // Guideline 3: Transition for verification UI state
    const [isPending, startTransition] = useTransition();

    const handleVerify = async () => {
        setVerificationStatus('verifying');
        try {
            const result = await DocumentService.verifyIntegrity(selectedItem.blockchainHash || '');
            startTransition(() => {
                setVerifyData(result);
                setVerificationStatus('verified');
            });
        } catch (e) {
            startTransition(() => {
                setVerificationStatus('failed');
            });
        }
    };

    const handleRetry = () => {
        startTransition(() => {
            setVerificationStatus('idle');
        });
    };

    return (
        <div className={`space-y-6 transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
            <Card title="Digital Forensics Report">
                <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs rounded-md overflow-x-auto shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="opacity-50 mb-1">FILE ATTRIBUTES</p>
                            <p>File: <span className="text-blue-300">{selectedItem.title}</span></p>
                            <p>Size: {selectedItem.fileSize || '2,405 KB'}</p>
                            <p>Type: {selectedItem.fileType || 'application/pdf'}</p>
                        </div>
                        <div>
                            <p className="opacity-50 mb-1">CRYPTOGRAPHIC HASHES</p>
                            <p>MD5: 5d41402abc4b2a76b9719d911017c592</p>
                            <p>SHA1: 7b502c3a1f48bb8615d947119951b689a9416597</p>
                            <p>SHA256: {selectedItem.blockchainHash ? selectedItem.blockchainHash.substring(0, 32) + '...' : 'Pending'}</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <p className="opacity-50 mb-1">METADATA EXTRACTION</p>
                        <p>-- Author: h.smith@techcorp.com</p>
                        <p>-- Created: 2023-11-14 14:30:22 UTC</p>
                        <p>-- Modified: 2023-11-15 09:12:00 UTC</p>
                        <p>-- Software: Microsoft Word for Office 365</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Blockchain Anchor Verification">
                    <div className="flex flex-col items-center justify-center py-6">
                        {verificationStatus === 'idle' && (
                            <>
                                <ShieldCheck className="h-16 w-16 text-slate-200 mb-4" />
                                <p className="text-slate-500 text-sm mb-4 text-center">Verify this file's integrity against the public ledger.</p>
                                <Button onClick={handleVerify} icon={Link}>Verify Integrity</Button>
                            </>
                        )}
                        {verificationStatus === 'verifying' && (
                            <>
                                <RefreshCw className="h-16 w-16 text-blue-500 animate-spin mb-4" />
                                <p className="text-blue-600 font-bold text-sm">Querying Ethereum Mainnet...</p>
                            </>
                        )}
                        {verificationStatus === 'verified' && verifyData && (
                            <div className="w-full">
                                <div className="flex flex-col items-center mb-6">
                                    <CheckCircle className="h-16 w-16 text-green-500 mb-2" />
                                    <h3 className="text-xl font-bold text-slate-900">INTEGRITY CONFIRMED</h3>
                                    <p className="text-sm text-slate-500">Hash Match Found</p>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded p-4 text-sm">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-green-800 font-bold">Block Height:</span>
                                        <span className="font-mono text-green-700">{verifyData.block}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-green-800 font-bold">Timestamp:</span>
                                        <span className="font-mono text-green-700">{verifyData.timestamp}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-green-800 font-bold">Network:</span>
                                        <span className="font-mono text-green-700">ETH Mainnet</span>
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <Button variant="outline" size="sm" onClick={handleRetry}>Run Again</Button>
                                </div>
                            </div>
                        )}
                        {verificationStatus === 'failed' && (
                            <div className="flex flex-col items-center text-red-600">
                                <AlertOctagon className="h-16 w-16 mb-4" />
                                <p className="font-bold">Verification Failed</p>
                                <p className="text-sm mb-4">Hash mismatch or network error.</p>
                                <Button variant="outline" onClick={handleRetry}>Retry</Button>
                            </div>
                        )}
                    </div>
                </Card>

                <Card title="Custody Certification">
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                                <ShieldCheck className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">Chain of Custody Intact</h4>
                                <p className="text-xs text-slate-500 mt-1">No gaps detected in custody logs since ingestion.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="bg-purple-100 p-2 rounded-full mr-3">
                                <Link className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">UUID Tracking Active</h4>
                                <p className="text-xs text-slate-500 mt-1">Asset ID: <span className="font-mono bg-slate-100 px-1 rounded">{selectedItem.trackingUuid}</span></p>
                            </div>
                        </div>
                        <div className="pt-4 mt-4 border-t border-slate-100">
                            <Button variant="secondary" className="w-full">Download Forensic Certificate</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
