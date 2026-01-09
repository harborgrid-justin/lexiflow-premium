'use client';

import { Badge } from '@/components/ui/shadcn/badge';
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { FileIcon } from '@/components/ui/atoms/FileIcon/FileIcon';
import { cn } from '@/lib/utils';
import { LegalDocument } from '@/types/documents';
import React from 'react';

interface DocumentGridCardProps {
  doc: LegalDocument;
  isSelected: boolean;
  onToggleSelection: (id: string, e?: React.MouseEvent) => void;
  onPreview: (doc: LegalDocument) => void;
}

export function DocumentGridCard({ doc, isSelected, onToggleSelection, onPreview }: DocumentGridCardProps) {
  return (
    <Card
      onClick={(e: React.MouseEvent) => {
        if (e.ctrlKey || e.metaKey) onToggleSelection(doc.id, e);
        else onPreview(doc);
      }}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md relative group border",
        isSelected && "ring-2 ring-primary bg-accent/20 border-primary"
      )}
    >
      <CardContent className="p-4 flex flex-col items-center justify-between h-full min-h-40">
        <div className="absolute top-2 left-2 z-10" onClick={e => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(doc.id)}
          />
        </div>

        <div className="flex-1 flex items-center justify-center w-full py-2">
          <FileIcon type={doc.type} className="h-16 w-16 opacity-80" />
        </div>

        <div className="w-full text-center mt-3 space-y-1">
          <h4
            className="text-xs font-semibold truncate text-foreground"
            title={doc.title}
          >
            {doc.title}
          </h4>
          <div className="flex justify-center items-center gap-2">
            <span className="text-[10px] text-muted-foreground">
              {doc.fileSize ? String(doc.fileSize) : '24KB'}
            </span>
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-normal">
              {doc.status || 'Active'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
