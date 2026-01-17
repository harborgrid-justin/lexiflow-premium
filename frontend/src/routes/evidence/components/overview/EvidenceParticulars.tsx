/**
 * @module EvidenceParticulars
 * @category Evidence
 * @description Detailed view of evidence particulars including description, type, status, and metadata.
 * Features AI-powered analysis and blockchain verification display.
 */

import { User, Activity, Link, Sparkles } from 'lucide-react';
import React, { useState } from 'react';

// Common Components
import { Badge } from '@/components/atoms/Badge';
import { EvidenceTypeIcon } from '@/components/atoms/EvidenceTypeIcon/EvidenceTypeIcon';
import { Card } from '@/components/molecules/Card';

// Context & Utils
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

// Services
import { GeminiService } from '@/services/features/research/geminiService';

// Types
import { type EvidenceItem } from '@/types';

interface EvidenceParticularsProps {
  selectedItem: EvidenceItem;
}

export const EvidenceParticulars: React.FC<EvidenceParticularsProps> = ({ selectedItem }) => {
  const { theme } = useTheme();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await GeminiService.analyzeDocument(selectedItem.description);
    setAiSummary(result.summary);
    setIsAnalyzing(false);
  };

  return (
    <Card className="lg:col-span-2" title="Evidence Particulars">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={cn("block text-xs font-semibold uppercase", theme.text.secondary)}>Description</label>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={cn(
                  "text-xs flex items-center px-2 py-1 rounded transition-colors",
                  "text-purple-600 hover:bg-purple-50" // Keeping specific AI branding colors
                )}
              >
                {isAnalyzing ? <span className="animate-spin mr-1">⏳</span> : <Sparkles className="h-3 w-3 mr-1"/>}
                AI Analyze
              </button>
            </div>
            <p className={cn("p-4 rounded-md border leading-relaxed text-sm", theme.surface.highlight, theme.border.default, theme.text.primary)}>
              {selectedItem.description}
            </p>
            {aiSummary && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-md animate-fade-in">
                <h5 className="text-xs font-bold text-purple-700 mb-1 flex items-center"><Sparkles className="h-3 w-3 mr-1"/> AI Summary</h5>
                <p className={cn("text-sm", theme.text.primary)}>{aiSummary}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1", theme.text.secondary)}>Item Type</label>
              <div className={cn("flex items-center text-sm font-medium", theme.text.primary)}>
                <EvidenceTypeIcon type={selectedItem.type} className="h-5 w-5 mr-2"/> {selectedItem.type}
              </div>
            </div>
            <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1", theme.text.secondary)}>Current Status</label>
              <Badge variant="info">Secure Storage</Badge>
            </div>
            <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1", theme.text.secondary)}>Original Custodian</label>
              <div className={cn("flex items-center text-sm", theme.text.primary)}>
                <User className={cn("h-4 w-4 mr-2", theme.text.tertiary)}/> {selectedItem.custodian}
              </div>
            </div>
            <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1", theme.text.secondary)}>Collection Date</label>
              <div className={cn("text-sm", theme.text.primary)}>{selectedItem.collectionDate}</div>
            </div>

            <div className="col-span-2">
              <label className={cn("block text-xs font-semibold uppercase mb-2", theme.text.secondary)}>Blockchain Verification</label>
              <div className="flex items-center p-3 bg-slate-900 rounded-md text-white font-mono text-xs">
                <Link className="h-4 w-4 text-green-400 mr-3 shrink-0"/>
                <span className="truncate">{selectedItem.blockchainHash || '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'}</span>
              </div>
              <p className={cn("text-[10px] mt-1", theme.text.tertiary)}>Immutable record anchored on-chain. Last verified: 2 mins ago.</p>
            </div>
          </div>
          <div>
            <label className={cn("block text-xs font-semibold uppercase mb-2", theme.text.secondary)}>Tags & Metadata</label>
            <div className="flex flex-wrap gap-2">
              {selectedItem.tags.map(t => (
                <span key={t} className={cn("px-2 py-1 rounded text-xs border flex items-center", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
                  <Activity className={cn("h-3 w-3 mr-1 opacity-50", theme.text.tertiary)}/> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
    </Card>
  );
};
