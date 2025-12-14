
import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, TextArea } from '../common/Inputs';
import { UserSelect } from '../common/UserSelect';
import { Send, Paperclip, Wand2, X } from 'lucide-react';
import { CommunicationItem, CommunicationType, UserId } from '../../types';
import { MOCK_USERS } from '../../data/models/user';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useBlobRegistry } from '../../hooks/useBlobRegistry';
import { useNotify } from '../../hooks/useNotify';
import { validateCommunicationItemSafe } from '../../services/validation/correspondenceSchemas';
import { CommunicationStatus } from '../../types/enums';

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (item: CommunicationItem) => void;
  initialData?: Partial<CommunicationItem>;
}

export const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({ isOpen, onClose, onSend, initialData }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const { registerBlob, getBlob, removeBlob } = useBlobRegistry();
  const [formData, setFormData] = useState<Partial<CommunicationItem>>({
    type: 'Email',
    direction: 'Outbound',
    isPrivileged: false,
    status: CommunicationStatus.DRAFT
  });
  const [cases, setCases] = useState<any[]>([]);
  const [isDrafting, setIsDrafting] = useState(false);
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<Array<{id: string; name: string; size: number}>>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Auto-save draft every 2 seconds
  useAutoSave(
    () => {
      if (body && formData.subject && isOpen) {
        // Save draft to IndexedDB
        const draftKey = `draft_communication_${formData.caseId || 'new'}`;
        localStorage.setItem(draftKey, JSON.stringify({ formData, body, attachments }));
      }
    },
    [body, formData, attachments, isOpen],
    2000
  );

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 's',
      cmd: true,
      callback: (e) => {
        e.preventDefault();
        if (isOpen) {
          handleSend();
        }
      },
      description: 'Send message'
    },
    {
      key: 'Escape',
      callback: () => {
        if (isOpen) onClose();
      },
      description: 'Close modal'
    }
  ], isOpen);

  useEffect(() => {
      const loadCases = async () => {
          const data = await DataService.cases.getAll();
          setCases(data);
      };
      loadCases();
  }, []);

  // Effect to load initial data when modal opens
  useEffect(() => {
      if (isOpen && initialData) {
          setFormData(prev => ({
              ...prev,
              ...initialData,
              // Ensure defaults are preserved if not in initialData
              type: initialData.type || prev.type,
              direction: 'Outbound'
          }));
          if (initialData.preview) {
              setBody(`\n\n--- Original Message ---\n${initialData.preview}`);
          }
      } else if (isOpen && !initialData) {
          // Reset if opening fresh
          setFormData({
            type: 'Email',
            direction: 'Outbound',
            isPrivileged: false,
            status: 'Draft'
          });
          setBody('');
      }
  }, [isOpen, initialData]);

  const handleAIDraft = async () => {
      if (!formData.subject || !formData.recipient) return;
      setIsDrafting(true);
      try {
          // Lazy load GeminiService only when needed
          const { GeminiService } = await import('../../services/geminiService');
          const draft = await GeminiService.generateDraft(
              `Draft a formal ${formData.type} to ${formData.recipient} regarding ${formData.subject}. Tone: Professional Legal.`,
              'Communication'
          );
          setBody(draft);
      } catch (error) {
          notify.error('Failed to generate draft');
          console.error('AI draft error:', error);
      } finally {
          setIsDrafting(false);
      }
  };

  const handleAttachmentUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      for (const file of Array.from(files)) {
          if (file.size > 25 * 1024 * 1024) { // 25MB limit
              notify.error(`File ${file.name} exceeds 25MB limit`);
              continue;
          }

          const blobId = await registerBlob(file, 'correspondence');
          setAttachments(prev => [...prev, {
              id: blobId,
              name: file.name,
              size: file.size
          }]);
      }
      event.target.value = ''; // Reset input
  }, [registerBlob, notify]);

  const handleRemoveAttachment = useCallback((attachmentId: string) => {
      removeBlob(attachmentId);
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  }, [removeBlob]);

  const handleSend = () => {
      if (!formData.subject || !formData.recipient || !formData.caseId) {
          setValidationErrors({
              subject: !formData.subject ? 'Subject is required' : '',
              recipient: !formData.recipient ? 'Recipient is required' : '',
              caseId: !formData.caseId ? 'Case is required' : ''
          });
          notify.error('Please fill in all required fields');
          return;
      }
      
      const newMessage: CommunicationItem = {
          id: `comm-${Date.now()}`,
          caseId: formData.caseId,
          userId: 'current-user' as UserId,
          subject: formData.subject,
          date: new Date().toISOString().split('T')[0],
          type: formData.type as CommunicationType,
          direction: 'Outbound',
          sender: 'Me (Attorney)',
          recipient: formData.recipient,
          preview: body.substring(0, 150) + (body.length > 150 ? '...' : ''),
          hasAttachment: attachments.length > 0,
          attachmentIds: attachments.map(a => a.id),
          status: CommunicationStatus.SENT,
          isPrivileged: formData.isPrivileged || false
      };

      // Validate with Zod schema
      const validation = validateCommunicationItemSafe(newMessage);
      if (!validation.success) {
          const errors: Record<string, string> = {};
          validation.error.errors.forEach(err => {
              errors[err.path[0] as string] = err.message;
          });
          setValidationErrors(errors);
          notify.error('Validation failed. Please check your input.');
          return;
      }
      
      onSend(newMessage);
      setFormData({ type: 'Email', direction: 'Outbound', isPrivileged: false, status: CommunicationStatus.DRAFT });
      setBody('');
      setAttachments([]);
      setValidationErrors({});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compose Correspondence" size="lg">
        <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Type</label>
                    <select 
                        className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value as CommunicationType})}
                    >
                        <option value="Email">Email</option>
                        <option value="Letter">Formal Letter</option>
                        <option value="Fax">Fax</option>
                        <option value="Memo">Internal Memo</option>
                    </select>
                </div>
                <div>
                    <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Matter Reference</label>
                    <select 
                        className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
                        value={formData.caseId || ''}
                        onChange={(e) => setFormData({...formData, caseId: e.target.value})}
                    >
                        <option value="">Select Case...</option>
                        {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
            </div>

            <Input 
                label="Recipient" 
                placeholder="e.g. Opposing Counsel, Client" 
                value={formData.recipient || ''} 
                onChange={(e) => setFormData({...formData, recipient: e.target.value})}
            />

            <Input 
                label="Subject" 
                placeholder="Subject line..." 
                value={formData.subject || ''} 
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />

            <div className="relative">
                <div className="flex justify-between items-center mb-2">
                    <label className={cn("block text-xs font-semibold uppercase", theme.text.secondary)}>Message Body</label>
                    <Button size="xs" variant="ghost" icon={Wand2} onClick={handleAIDraft} disabled={isDrafting}>
                        {isDrafting ? 'Drafting...' : 'AI Assist'}
                    </Button>
                </div>
                <textarea 
                    className={cn("w-full p-4 border rounded-lg text-sm font-serif h-48 resize-none outline-none focus:ring-2 focus:ring-blue-500", theme.surface.default, theme.border.default, theme.text.primary)}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Type your message here..."
                />
            </div>

            {/* Attachments Display */}
            {attachments.length > 0 && (
                <div className="space-y-2">
                    <label className={cn("block text-xs font-semibold uppercase", theme.text.secondary)}>Attachments ({attachments.length})</label>
                    <div className="space-y-1">
                        {attachments.map(att => (
                            <div key={att.id} className={cn("flex items-center justify-between p-2 border rounded", theme.border.default, theme.surface.default)}>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Paperclip className="h-3 w-3 text-slate-400 shrink-0"/>
                                    <span className="text-sm truncate">{att.name}</span>
                                    <span className="text-xs text-slate-400">({(att.size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <button 
                                    onClick={() => handleRemoveAttachment(att.id)}
                                    className="p-1 hover:bg-slate-100 rounded"
                                >
                                    <X className="h-3 w-3 text-slate-400"/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                    <label>
                        <input 
                            type="file" 
                            multiple 
                            onChange={handleAttachmentUpload}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        />
                        <Button size="sm" variant="ghost" icon={Paperclip} as="span">Attach File</Button>
                    </label>
                    <label className="flex items-center text-sm cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="mr-2 rounded text-blue-600" 
                            checked={formData.isPrivileged} 
                            onChange={(e) => setFormData({...formData, isPrivileged: e.target.checked})}
                        />
                        Mark Privileged
                    </label>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" icon={Send} onClick={handleSend}>Send (⌘S)</Button>
                </div>
            </div>
        </div>
    </Modal>
  );
};