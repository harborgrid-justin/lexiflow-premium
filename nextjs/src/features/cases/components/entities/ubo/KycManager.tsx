import React from 'react';
import { Card } from '@/components/ui/molecules/Card';
import { Button } from '@/components/ui/atoms/Button';
import { FileIcon } from '@/components/ui/atoms/FileIcon/FileIcon';
import { Badge } from '@/components/ui/atoms/Badge';
import { UploadCloud, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { LegalEntity } from '@/types';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';

interface KycManagerProps {
  entities: LegalEntity[];
}

export const KycManager: React.FC<KycManagerProps> = ({ entities }) => {
  const { theme } = useTheme();

  // Filter entities that need KYC (e.g. Clients, High Risk)
  const pendingKyc = entities.filter(e => e.riskScore > 30).slice(0, 6);

  return (
    <div className="space-y-6">
        <div className={cn("p-6 rounded-lg border bg-blue-50 border-blue-100 flex justify-between items-center")}>
            <div>
                <h3 className="text-lg font-bold text-blue-900">Due Diligence Vault</h3>
                <p className="text-sm text-blue-700">Secure storage for Passports, Articles of Incorporation, and Proof of Address.</p>
            </div>
            <Button variant="primary" icon={UploadCloud}>Upload Documents</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingKyc.map(entity => (
                <Card key={entity.id} noPadding className="flex flex-col">
                    <div className="p-4 border-b flex justify-between items-start">
                        <div>
                            <h4 className={cn("font-bold text-sm", theme.text.primary)}>{entity.name}</h4>
                            <p className={cn("text-xs", theme.text.secondary)}>{entity.type}</p>
                        </div>
                        <Badge variant="warning">Incomplete</Badge>
                    </div>
                    <div className="p-4 space-y-3 flex-1">
                        <div className="flex items-center justify-between text-sm p-2 rounded border border-dashed border-slate-300">
                            <div className="flex items-center gap-2 text-slate-500">
                                <FileIcon type="pdf" className="h-4 w-4"/>
                                <span>Govt ID / Passport</span>
                            </div>
                            <Clock className="h-4 w-4 text-amber-500"/>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 rounded bg-green-50 border border-green-100">
                            <div className="flex items-center gap-2 text-green-800">
                                <FileIcon type="pdf" className="h-4 w-4 text-green-600"/>
                                <span>Proof of Address</span>
                            </div>
                            <CheckCircle className="h-4 w-4 text-green-600"/>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 rounded bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-700">
                                <FileIcon type="pdf" className="h-4 w-4 text-slate-500"/>
                                <span>Risk Assessment</span>
                            </div>
                            <span className="text-xs font-mono font-bold">{entity.riskScore}/100</span>
                        </div>
                    </div>
                    <div className="p-3 border-t bg-slate-50 flex justify-end">
                        <Button size="sm" variant="outline">Request Info</Button>
                    </div>
                </Card>
            ))}

            <div className={cn("border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-slate-400", theme.border.default)}>
                <AlertCircle className="h-12 w-12 mb-2 opacity-20"/>
                <p className="text-sm font-medium">All other entities verified</p>
            </div>
        </div>
    </div>
  );
};
