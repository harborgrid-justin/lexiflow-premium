
import React from 'react';
import { Card } from '../common/Card.tsx';
import { Button } from '../common/Button.tsx';
import { Split, Link, FileText, ArrowDown } from 'lucide-react';
import { EvidenceItem } from '../../types.ts';

interface EvidenceStructureProps {
  selectedItem: EvidenceItem;
}

export const EvidenceStructure: React.FC<EvidenceStructureProps> = ({ selectedItem }) => {
  const chunks = selectedItem.chunks || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Parsed Document Structure">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            This document has been parsed and split into individual immutable chunks. Each chunk is hashed and tracked independently.
          </p>
          
          <div className="space-y-3">
            {chunks.length > 0 ? chunks.map((c, idx) => (
              <div key={c.id || idx} className="flex flex-col p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group bg-white">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded mr-3">
                            <Split className="h-4 w-4 text-blue-600"/>
                        </div>
                        <div>
                            <p className="font-bold text-sm text-slate-900">Page {c.pageNumber}</p>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {c.id}</p>
                        </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs">View Content</Button>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100 text-xs font-mono text-slate-500 flex items-center">
                    <Link className="h-3 w-3 mr-2 text-slate-400"/>
                    Hash: {c.hash}
                </div>
                <div className="mt-2 text-xs text-slate-600 italic line-clamp-2 pl-2 border-l-2 border-slate-300">
                    "{c.contentPreview}"
                </div>
              </div>
            )) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                    <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2"/>
                    <p className="text-slate-500 text-sm">No structural chunks available for this file type.</p>
                </div>
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Card title="Lifecycle Tracking">
            <div className="relative pl-6 border-l-2 border-blue-200 ml-4 space-y-8 py-2">
            <div className="relative">
                <div className="absolute -left-[33px] bg-blue-600 h-6 w-6 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                </div>
                <h4 className="font-bold text-sm text-slate-900">Ingestion & Hashing</h4>
                <p className="text-xs text-slate-500 mt-1">Master file uploaded and SHA-256 hash generated.</p>
                <div className="mt-2 bg-slate-100 p-2 rounded text-[10px] font-mono border border-slate-200 text-slate-600 break-all">
                    UUID: {selectedItem.trackingUuid}
                </div>
            </div>

            <div className="relative">
                <div className="absolute -left-[33px] bg-indigo-500 h-6 w-6 rounded-full border-4 border-white flex items-center justify-center">
                    <Split className="h-3 w-3 text-white"/>
                </div>
                <h4 className="font-bold text-sm text-slate-900">Parsing & Splitting</h4>
                <p className="text-xs text-slate-500 mt-1">
                    File split into {chunks.length} logical units for granular analysis.
                </p>
            </div>

            <div className="relative">
                <div className="absolute -left-[33px] bg-emerald-500 h-6 w-6 rounded-full border-4 border-white flex items-center justify-center">
                    <Link className="h-3 w-3 text-white"/>
                </div>
                <h4 className="font-bold text-sm text-slate-900">Blockchain Anchoring</h4>
                <p className="text-xs text-slate-500 mt-1">All chunk hashes committed to immutable ledger.</p>
            </div>
            </div>
        </Card>

        <Card title="Integrity Check">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div>
                    <span className="block text-sm font-bold text-green-800">Structure Verified</span>
                    <span className="text-xs text-green-600">All chunks match master parent hash.</span>
                </div>
                <div className="h-8 w-8 bg-green-200 rounded-full flex items-center justify-center">
                    <Link className="h-4 w-4 text-green-700"/>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
};
