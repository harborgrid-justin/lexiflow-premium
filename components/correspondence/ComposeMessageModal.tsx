
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, TextArea } from '../common/Inputs';
import { UserSelect } from '../common/UserSelect';
import { Send, Paperclip, Wand2 } from 'lucide-react';
import { CommunicationItem, CommunicationType, UserId } from '../../types';
import { MOCK_USERS } from '../../data/models/user';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { GeminiService } from '../../services/geminiService';
import { DataService } from '../../services/dataService';

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (item: CommunicationItem) => void;
  initialData?: Partial<CommunicationItem>;
}

export const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({ isOpen, onClose, onSend, initialData }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<Partial<CommunicationItem>>({
    type: 'Email',
    direction: 'Outbound',
    isPrivileged: false,
    status: 'Draft'
  });
  const [cases, setCases] = useState<any[]>([]);
  const [isDrafting, setIsDrafting] = useState(false);
  const [body, setBody] = useState('');

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
      const draft = await GeminiService.generateDraft(
          `Draft a formal ${formData.type} to ${formData.recipient} regarding ${formData.subject}. Tone: Professional Legal.`,
          'Communication'
      );
      setBody(draft);
      setIsDrafting(false);
  };

  const handleSend = () => {
      if (!formData.subject || !formData.recipient || !formData.caseId) return;
      
      const newMessage: CommunicationItem = {
          id: `comm-${Date.now()}`,
          caseId: formData.caseId,
          userId: 'current-user' as UserId, // Replace with auth context
          subject: formData.subject,
          date: new Date().toISOString().split('T')[0],
          type: formData.type as CommunicationType,
          direction: 'Outbound',
          sender: 'Me (Attorney)',
          recipient: formData.recipient,
          preview: body.substring(0, 150) + '...',
          hasAttachment: false, // TODO: File attachment logic
          status: 'Sent',
          isPrivileged: formData.isPrivileged || false
      };
      
      onSend(newMessage);
      setFormData({ type: 'Email', direction: 'Outbound', isPrivileged: false, status: 'Draft' });
      setBody('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compose Correspondence" size="lg">
        <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Type</label>
                    <select 
                        className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default, theme.text.primary)}
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
                        className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default, theme.text.primary)}
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
                    className={cn("w-full p-4 border rounded-lg text-sm font-serif h-48 resize-none outline-none focus:ring-2 focus:ring-blue-500", theme.surface, theme.border.default, theme.text.primary)}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Type your message here..."
                />
            </div>

            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                    <Button size="sm" variant="ghost" icon={Paperclip}>Attach File</Button>
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
                    <Button variant="primary" icon={Send} onClick={handleSend}>Send</Button>
                </div>
            </div>
        </div>
    </Modal>
  );
};