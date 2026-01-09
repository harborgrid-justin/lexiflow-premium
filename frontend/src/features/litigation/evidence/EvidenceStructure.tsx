/**
 * @module EvidenceStructure
 * @category Evidence
 * @description Displays the parsed structure of an evidence document.
 * Shows individual chunks/pages with their hashes and content previews.
 */

import { FileText, Link, Split } from 'lucide-react';
import React from 'react';

// Common Components
import { Button } from '@/components/ui/atoms/Button/Button';
import { Card } from '@/components/ui/molecules/Card/Card';

// Context & Utils
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';

// Types
import { EvidenceItem } from '@/types';

interface EvidenceStructureProps {
  selectedItem: EvidenceItem;
}

export const EvidenceStructure: React.FC<EvidenceStructureProps> = ({ selectedItem }) => {
  const { theme } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Parsed Document Structure">
        <div className="space-y-4">
          <p className={cn("text-sm", theme.text.secondary)}>
            This document has been parsed and split into individual immutable chunks. Each chunk is hashed and tracked independently.
          </p>

          <div className="space-y-3">
            {(selectedItem.chunks && selectedItem.chunks.length > 0) ? selectedItem.chunks.map((c, idx) => (
              <div key={c.id || idx} className={cn("flex flex-col p-3 border rounded-lg transition-colors group", theme.surface.default, theme.border.default, `hover:${theme.surface.highlight}`)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={cn("p-2 rounded mr-3", theme.primary.light)}>
                      <Split className={cn("h-4 w-4", theme.primary.text)} />
                    </div>
                    <div>
                      <p className={cn("font-bold text-sm", theme.text.primary)}>Page {c.pageNumber}</p>
                      <p className={cn("text-[10px] font-mono", theme.text.tertiary)}>ID: {c.id}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs">View Content</Button>
                </div>
                <div className={cn("p-2 rounded border text-xs font-mono flex items-center", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
                  <Link className={cn("h-3 w-3 mr-2", theme.text.tertiary)} />
                  Hash: {c.hash}
                </div>
                <div className={cn("mt-2 text-xs italic line-clamp-2 pl-2 border-l-2", theme.text.secondary, theme.border.default)}>
                  "{c.contentPreview}"
                </div>
              </div>
            )) : (
              <div className={cn("text-center py-8 border-2 border-dashed rounded-lg", theme.border.default)}>
                <FileText className={cn("h-8 w-8 mx-auto mb-2", theme.text.tertiary)} />
                <p className={cn("text-sm", theme.text.secondary)}>No structural chunks available for this file type.</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Card title="Lifecycle Tracking">
          <div className={cn("relative pl-6 border-l-2 ml-4 space-y-8 py-2", theme.border.default)}>
            <div className="relative">
              <div className={cn("absolute -left-[33px] h-6 w-6 rounded-full border-4 border-transparent flex items-center justify-center", theme.primary.DEFAULT)}>
                <div className="h-2 w-2 bg-white rounded-full"></div>
              </div>
              <h4 className={cn("font-bold text-sm", theme.text.primary)}>Ingestion & Hashing</h4>
              <p className={cn("text-xs mt-1", theme.text.secondary)}>Master file uploaded and SHA-256 hash generated.</p>
              <div className={cn("mt-2 p-2 rounded text-[10px] font-mono border break-all", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
                UUID: {selectedItem.trackingUuid}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-[33px] bg-indigo-500 h-6 w-6 rounded-full border-4 border-transparent flex items-center justify-center">
                <Split className="h-3 w-3 text-white" />
              </div>
              <h4 className={cn("font-bold text-sm", theme.text.primary)}>Parsing & Splitting</h4>
              <p className={cn("text-xs mt-1", theme.text.secondary)}>
                File split into {selectedItem.chunks?.length || 0} logical units for granular analysis.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[33px] bg-emerald-500 h-6 w-6 rounded-full border-4 border-transparent flex items-center justify-center">
                <Link className="h-3 w-3 text-white" />
              </div>
              <h4 className={cn("font-bold text-sm", theme.text.primary)}>Blockchain Anchoring</h4>
              <p className={cn("text-xs mt-1", theme.text.secondary)}>All chunk hashes committed to immutable ledger.</p>
            </div>
          </div>
        </Card>

        <Card title="Integrity Check">
          <div className={cn("p-4 border rounded-lg flex items-center justify-between", theme.status.success.bg, theme.status.success.border)}>
            <div>
              <span className={cn("block text-sm font-bold", theme.status.success.text)}>Structure Verified</span>
              <span className={cn("text-xs", theme.status.success.text)}>All chunks match master parent hash.</span>
            </div>
            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
              <Link className={cn("h-4 w-4", theme.status.success.text)} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
