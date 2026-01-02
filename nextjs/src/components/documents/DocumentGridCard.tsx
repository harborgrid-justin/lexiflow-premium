'use client';

import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { FileIcon } from '@/components/ui/atoms/FileIcon/FileIcon';
import { cn } from '@/lib/utils';
import { LegalDocument } from '@/types/documents';
import React from 'react';

interface DocumentGridCardProps {
  doc: LegalDocument;
  isSelected: boolean;
  onToggleSelection: (id: string, e: React.MouseEvent) => void;
  onPreview: (doc: LegalDocument) => void;
}

export function DocumentGridCard({ doc, isSelected, onToggleSelection, onPreview }: DocumentGridCardProps) {
  return (
    <div
      onClick={(e: React.MouseEvent) => {
        if (e.ctrlKey || e.metaKey) onToggleSelection(doc.id, e);
        else onPreview(doc);
      }}
      className={cn(
        "h-full w-full border rounded-lg p-4 flex flex-col items-center justify-between cursor-pointer transition-all hover:shadow-md relative group",
        "bg-white dark:bg-slate-800",
        "border-slate-200 dark:border-slate-700",
        isSelected
          ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
      )}
    >
      <div className="absolute top-2 left-2 z-10" onClick={e => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onToggleSelection(doc.id, e as any)}
          className="rounded text-blue-600 cursor-pointer w-4 h-4"
        />
      </div>

      <div className="flex-1 flex items-center justify-center w-full">
        <FileIcon type={doc.type} className="h-16 w-16 opacity-80" />
      </div>

      <div className="w-full text-center mt-3">
        <h4
          className="text-xs font-bold truncate px-1 text-slate-900 dark:text-slate-100"
          title={doc.title}
        >
          {doc.title}
        </h4>
        <div className="flex justify-center items-center gap-2 mt-1">
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {doc.fileSize ? String(doc.fileSize) : '24KB'}
          </span>
          <Badge variant="neutral" className="text-[9px] px-1 py-0">
            {doc.status || 'Active'}
          </Badge>
        </div>
      </div>
    </div>
  );
}
