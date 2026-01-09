'use client';

import { Button } from '@/components/ui/shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/shadcn/dialog";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { LegalDocument } from '@/types/documents';
import { Plus, X } from 'lucide-react';
import React, { useState } from 'react';

interface TagManagementModalProps {
  document: LegalDocument;
  onClose: () => void;
  onAddTag: (docId: string, tag: string) => void;
  onRemoveTag: (docId: string, tag: string) => void;
  allTags: string[];
}

export function TagManagementModal({
  document, onClose, onAddTag, onRemoveTag, allTags
}: TagManagementModalProps) {
  const [newTagInput, setNewTagInput] = useState('');

  const handleAddTag = () => {
    if (newTagInput) {
      onAddTag(document.id, newTagInput);
      setNewTagInput('');
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Document Tags</DialogTitle>
          <DialogDescription>Add or remove tags for {document.title || 'this document'}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Current Tags</Label>
            <div className="flex flex-wrap gap-2">
              {(!document.tags || document.tags.length === 0) && (
                <span className="text-sm italic text-muted-foreground">No tags assigned.</span>
              )}
              {document.tags?.map(tag => (
                <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-sm border bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                  {tag}
                  <button onClick={() => onRemoveTag(document.id, tag)} className="ml-2 hover:opacity-75 text-blue-600 dark:text-blue-400">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Add New Tag</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Type new tag name..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); }}
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddTag} disabled={!newTagInput.trim()}>Add</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Suggested / Recent</Label>
            <div className="flex flex-wrap gap-2">
              {allTags.filter(t => !document.tags?.includes(t)).slice(0, 8).map(t => (
                <Button
                  key={t}
                  variant="outline"
                  size="sm"
                  onClick={() => onAddTag(document.id, t)}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" /> {t}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
