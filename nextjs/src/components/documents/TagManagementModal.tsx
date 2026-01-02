'use client';

import { Button } from '@/components/ui/atoms/Button/Button';
import { Modal } from '@/components/ui/molecules/Modal/Modal';
import { cn } from '@/lib/utils';
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
    <Modal isOpen={true} onClose={onClose} title="Manage Document Tags" size="sm">
      <div className="p-6">
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase mb-2 text-gray-500 dark:text-gray-400">Current Tags</label>
          <div className="flex flex-wrap gap-2">
            {(!document.tags || document.tags.length === 0) && (
              <span className="text-sm italic text-gray-400 dark:text-gray-500">No tags assigned.</span>
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

        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase mb-2 text-gray-500 dark:text-gray-400">Add New Tag</label>
          <div className="flex gap-2">
            <input
              className={cn(
                "flex-1 px-3 py-2 border rounded-md text-sm outline-none transition-all",
                "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
                "focus:ring-2 focus:ring-blue-500"
              )}
              placeholder="Type new tag name..."
              value={newTagInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); }}
            />
            <Button size="sm" onClick={handleAddTag} disabled={!newTagInput.trim()}>Add</Button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase mb-2 text-gray-500 dark:text-gray-400">Suggested / Recent</label>
          <div className="flex flex-wrap gap-2">
            {allTags.filter(t => !document.tags?.includes(t)).slice(0, 8).map(t => (
              <button
                key={t}
                onClick={() => onAddTag(document.id, t)}
                className={cn(
                  "text-xs px-2 py-1 border rounded flex items-center transition-colors",
                  "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400",
                  "hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <Plus className="h-3 w-3 mr-1" /> {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
