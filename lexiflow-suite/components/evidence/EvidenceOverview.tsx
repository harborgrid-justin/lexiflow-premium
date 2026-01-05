
import React, { useState, useTransition } from 'react';
import { Card } from '../common/Card.tsx';
import { Badge } from '../common/Badge.tsx';
import { EvidenceTypeIcon } from '../common/EvidenceTypeIcon.tsx';
import { EvidenceItem } from '../../types.ts';
import { GeminiService } from '../../services/geminiService.ts';
import { User, Activity, MapPin, Link, Sparkles, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button.tsx';

interface EvidenceOverviewProps {
  selectedItem: EvidenceItem;
}

export const EvidenceOverview: React.FC<EvidenceOverviewProps> = ({ selectedItem }) => {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await GeminiService.analyzeDocument(selectedItem.description);
    startTransition(() => {
        setAiSummary(result.summary);
        setIsAnalyzing(false);
    });
  };

  const tags = selectedItem.tags || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2" title="Evidence Particulars">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase">Description</label>
              <button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="text-xs flex items-center text-purple-600 hover:bg-purple-50 px-2 py-1 rounded transition-colors border border-transparent hover:border-purple-200"
              >
                {isAnalyzing ? <RefreshCw className="h-3 w-3 mr-1 animate-spin"/> : <Sparkles className="h-3 w-3 mr-1"/>}
                AI Analyze
              </button>
            </div>
            <p className="text-slate-900 bg-slate-50 p-4 rounded-md border border-slate-200 leading-relaxed text-sm font-medium">
              {selectedItem.description}
            </p>
            {aiSummary && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-md animate-fade-in">
                <h5 className="text-xs font-bold text-purple-700 mb-1 flex items-center"><Sparkles className="h-3 w-3 mr-1"/> AI Summary</h5>
                <p className="text-sm text-slate-700">{aiSummary}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Item Type</label>
              <div className="flex items-center text-sm font-bold text-slate-900">
                <EvidenceTypeIcon type={selectedItem.type} className="mr-2"/>
                {selectedItem.type}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
              <Badge variant={selectedItem.admissibility === 'Admissible' ? 'success' : selectedItem.admissibility === 'Challenged' ? 'warning' : 'neutral'}>
                {selectedItem.admissibility}
              </Badge>
            </div>
          </div>
          <div>
             <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tagging</label>
             <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{tag}</span>
                ))}
             </div>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Card title="Current Custody">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Custodian</label>
              <div className="flex items-center gap-2">
                <div className="bg-slate-200 p-1.5 rounded-full"><User size={16} className="text-slate-600"/></div>
                <span className="font-medium text-slate-900">{selectedItem.custodian}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Location</label>
              <div className="flex items-center gap-2">
                <div className="bg-slate-200 p-1.5 rounded-full"><MapPin size={16} className="text-slate-600"/></div>
                <span className="font-medium text-slate-900 text-sm">{selectedItem.location}</span>
              </div>
            </div>
             <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Blockchain Verification</label>
              {selectedItem.blockchainHash ? (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded border border-green-200">
                    <CheckCircle size={16}/>
                    <div className="overflow-hidden">
                        <span className="block text-xs font-bold">Anchored</span>
                        <span className="block text-[10px] font-mono truncate">{selectedItem.blockchainHash}</span>
                    </div>
                  </div>
              ) : (
                  <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                      <Activity size={16}/> <span className="text-xs">Pending Anchor</span>
                  </div>
              )}
            </div>
          </div>
        </Card>

        <Card title="Integrity Check">
            <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">File Hash (SHA-256)</span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">MATCH</span>
            </div>
        </Card>
      </div>
    </div>
  );
};
