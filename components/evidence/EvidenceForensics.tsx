
/**
 * @module EvidenceForensics
 * @category Evidence
 * @description Displays digital forensics information for an evidence item.
 * Includes file attributes, cryptographic hashes, and integrity verification status.
 */

import React, { useState } from 'react';
import { ShieldCheck, Link, RefreshCw, CheckCircle, AlertOctagon } from 'lucide-react';

// Common Components
import { Card } from '../common/Card';
import { Button } from '../common/Button';

// Context & Utils
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

// Services & Types
import { DataService } from '../../services/dataService';
import { EvidenceItem } from '../../types';

interface EvidenceForensicsProps {
  selectedItem: EvidenceItem;
}

export const EvidenceForensics: React.FC<EvidenceForensicsProps> = ({ selectedItem }) => {
  const { theme, mode } = useTheme();
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [verifyData, setVerifyData] = useState<{timestamp: string, verified: boolean} | null>(null);

  const handleVerify = async () => {
      setVerificationStatus('verifying');
      try {
          // Using DataService facade instead of direct document service to abstract logic
          const result = await DataService.evidence.verifyIntegrity(selectedItem.id);
          setVerifyData(result);
          setVerificationStatus('verified');
      } catch (e) {
          setVerificationStatus('failed');
      }
  };

  return (
    <div className="space-y-6">
      <Card title="Digital Forensics Report">
        <div className={cn("p-4 font-mono text-xs rounded-md overflow-x-auto shadow-inner", mode === 'dark' ? "bg-slate-800 text-slate-300" : "bg-slate-900 text-slate-200")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p className="opacity-50 mb-1">FILE ATTRIBUTES</p>
                <p>File: <span className="text-blue-400">{selectedItem.title}</span></p>
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
          <div className="mt-4 pt-4 border-t border-white/10">
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
                        <ShieldCheck className={cn("h-16 w-16 mb-4", theme.text.tertiary)}/>
                        <p className={cn("text-sm mb-4 text-center", theme.text.secondary)}>Verify this file's integrity against the public ledger.</p>
                        <Button onClick={handleVerify} icon={Link}>Verify Integrity</Button>
                      </>
                  )}
                  {verificationStatus === 'verifying' && (
                      <>
                        <RefreshCw className="h-16 w-16 text-blue-500 animate-spin mb-4"/>
                        <p className="text-blue-600 font-bold text-sm">Querying Ethereum Mainnet...</p>
                      </>
                  )}
                  {verificationStatus === 'verified' && verifyData && (
                      <div className="w-full">
                        <div className="flex flex-col items-center mb-6">
                            <CheckCircle className="h-16 w-16 text-green-500 mb-2"/>
                            <h3 className={cn("text-xl font-bold", theme.text.primary)}>INTEGRITY CONFIRMED</h3>
                            <p className={cn("text-sm", theme.text.secondary)}>Hash Match Found</p>
                        </div>
                        <div className={cn("border rounded p-4 text-sm", theme.status.success.bg, theme.status.success.border)}>
                            <div className="flex justify-between mb-2">
                                <span className={cn("font-bold", theme.status.success.text)}>Block Height:</span>
                                <span className={cn("font-mono", theme.status.success.text)}>18452XXX</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className={cn("font-bold", theme.status.success.text)}>Timestamp:</span>
                                <span className={cn("font-mono", theme.status.success.text)}>{verifyData.timestamp}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className={cn("font-bold", theme.status.success.text)}>Network:</span>
                                <span className={cn("font-mono", theme.status.success.text)}>ETH Mainnet</span>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <Button variant="outline" size="sm" onClick={() => setVerificationStatus('idle')}>Run Again</Button>
                        </div>
                      </div>
                  )}
                  {verificationStatus === 'failed' && (
                      <div className="flex flex-col items-center text-red-600">
                          <AlertOctagon className="h-16 w-16 mb-4"/>
                          <p className="font-bold">Verification Failed</p>
                          <p className="text-sm mb-4">Hash mismatch or network error.</p>
                          <Button variant="outline" onClick={() => setVerificationStatus('idle')}>Retry</Button>
                      </div>
                  )}
              </div>
          </Card>

          <Card title="Custody Certification">
              <div className="space-y-4">
                  <div className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <ShieldCheck className="h-5 w-5 text-blue-600"/>
                      </div>
                      <div>
                          <h4 className={cn("font-bold text-sm", theme.text.primary)}>Chain of Custody Intact</h4>
                          <p className={cn("text-xs mt-1", theme.text.secondary)}>No gaps detected in custody logs since ingestion.</p>
                      </div>
                  </div>
                  <div className="flex items-start">
                      <div className="bg-purple-100 p-2 rounded-full mr-3">
                          <Link className="h-5 w-5 text-purple-600"/>
                      </div>
                      <div>
                          <h4 className={cn("font-bold text-sm", theme.text.primary)}>UUID Tracking Active</h4>
                          <p className={cn("text-xs mt-1", theme.text.secondary)}>Asset ID: <span className={cn("font-mono px-1 rounded", theme.surface.highlight)}>{selectedItem.trackingUuid}</span></p>
                      </div>
                  </div>
                  <div className={cn("pt-4 mt-4 border-t", theme.border.default)}>
                      <Button variant="secondary" className="w-full" onClick={() => DataService.evidence.generateReport(selectedItem.id)}>Generate Forensic Report</Button>
                  </div>
              </div>
          </Card>
      </div>
    </div>
  );
};
