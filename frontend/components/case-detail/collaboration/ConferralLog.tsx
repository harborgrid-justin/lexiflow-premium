/**
 * ConferralLog.tsx
 * 
 * Good faith conferral tracking for FRCP compliance with method documentation,
 * result tracking, and chronological session history.
 * 
 * @module components/case-detail/collaboration/ConferralLog
 * @category Case Management - Collaboration
 */

// External Dependencies
import React, { useState, useCallback } from 'react';
import { Phone, Mail, Users, Video, Plus, CheckCircle, Loader2 } from 'lucide-react';

// Internal Dependencies - Components
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { Input, TextArea } from '../../common/Inputs';
import { Modal } from '../../common/Modal';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../../context/ThemeContext';
import { useToast } from '../../../context/ToastContext';
import { useQuery, useMutation, queryClient } from '../../../hooks/useQueryHooks';
import { useModalState } from '../../../hooks';
import { getTodayString } from '../../../utils/dateUtils';

// Internal Dependencies - Services & Utils
import { DataService } from '../../../services/data/dataService';
// ✅ Migrated to backend API (2025-12-21)
import { cn } from '../../../utils/cn';

// Types & Interfaces
import { ConferralSession, ConferralResult, ConferralMethod, UUID, CaseId, UserId } from '../../../types';

interface ConferralLogProps {
  caseId: string;
}

export const ConferralLog: React.FC<ConferralLogProps> = ({ caseId }) => {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSession, setNewSession] = useState<Partial<ConferralSession>>({
    method: 'Phone',
    result: 'Pending',
    date: getTodayString()
  });

  // Enterprise Data Access
  const { data: sessions = [], isLoading } = useQuery<ConferralSession[]>(
      ['conferrals', caseId],
      () => DataService.collaboration.getConferrals(caseId)
  );

  const { mutate: addSession } = useMutation(
      DataService.collaboration.addConferral,
      {
          invalidateKeys: [['conferrals', caseId]],
          onSuccess: () => {
              setIsModalOpen(false);
              setNewSession({ method: 'Phone', result: 'Pending', date: new Date().toISOString().split('T')[0] });
              addToast('Conferral session logged successfully', 'success');
          },
          onError: (error: Error) => {
              const errorMsg = error instanceof Error ? error.message : 'Unknown error';
              addToast(`Failed to log conferral session: ${errorMsg}`, 'error');
              console.error('Conferral save error:', error);
          }
      }
  );

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Email': return <Mail className="h-4 w-4"/>;
      case 'Phone': return <Phone className="h-4 w-4"/>;
      case 'Video Conference': return <Video className="h-4 w-4"/>;
      default: return <Users className="h-4 w-4"/>;
    }
  };

  const getResultBadge = (result: ConferralResult) => {
    switch (result) {
      case 'Agreed': return <Badge variant="success">Agreed</Badge>;
      case 'Impasse': return <Badge variant="error">Impasse</Badge>;
      case 'Partial Agreement': return <Badge variant="warning">Partial</Badge>;
      default: return <Badge variant="neutral">Pending</Badge>;
    }
  };

  const handleSave = () => {
    const session: ConferralSession = {
      id: `conf-${Date.now()}` as UUID,
      caseId: caseId as CaseId,
      topic: newSession.topic || 'General Conferral',
      date: newSession.date || new Date().toISOString().split('T')[0],
      method: newSession.method as ConferralMethod,
      participants: newSession.participants || [],
      notes: newSession.notes || '',
      result: (newSession.result || 'Pending') as ConferralResult,
      nextSteps: newSession.nextSteps
    };
    addSession(session);
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className={cn("animate-spin", theme.text.link)}/></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className={cn("font-bold", theme.text.primary)}>Meet & Confer Log</h3>
          <p className={cn("text-sm", theme.text.secondary)}>Track mandatory conferral attempts for motions and discovery disputes.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>Log Session</Button>
      </div>

      <div className="space-y-4">
        {sessions.map(session => (
          <div key={session.id} className={cn("p-4 rounded-lg border shadow-sm transition-all hover:border-blue-500", theme.surface.default, theme.border.default)}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-full", theme.surface.highlight, theme.text.secondary)}>
                  {getMethodIcon(session.method)}
                </div>
                <div>
                  <h4 className={cn("font-bold text-sm", theme.text.primary)}>{session.topic}</h4>
                  <div className={cn("flex items-center gap-2 text-xs", theme.text.secondary)}>
                    <span>{session.date}</span>
                    <span>•</span>
                    <span>{session.participants.join(', ')}</span>
                  </div>
                </div>
              </div>
              {getResultBadge(session.result)}
            </div>
            
            <div className={cn("ml-11 mt-2 text-sm p-3 rounded border", theme.surface.highlight, theme.text.secondary, theme.border.subtle)}>
              {session.notes}
            </div>
            
            {session.nextSteps && (
              <div className={cn("ml-11 mt-2 flex items-center gap-2 text-xs", theme.text.link)}>
                <CheckCircle className="h-3 w-3"/>
                <span className="font-medium">Next: {session.nextSteps}</span>
              </div>
            )}
          </div>
        ))}
        
        {sessions.length === 0 && (
          <div className={cn("text-center py-12 border-2 border-dashed rounded-lg", theme.border.default, theme.text.tertiary)}>
            <Users className="h-12 w-12 mx-auto mb-2 opacity-20"/>
            <p>No conferral sessions recorded.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Meet & Confer Session">
        <div className="p-6 space-y-4">
          <Input 
            label="Subject / Topic" 
            placeholder="e.g. Discovery Dispute regarding RFP Set 2"
            value={newSession.topic || ''}
            onChange={e => setNewSession({...newSession, topic: e.target.value})}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Date" 
              type="date" 
              value={newSession.date}
              onChange={e => setNewSession({...newSession, date: e.target.value})}
            />
            <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Method</label>
              <select 
                className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.input, theme.border.default, theme.text.primary)}
                value={newSession.method}
                onChange={e => setNewSession({...newSession, method: e.target.value as any})}
              >
                <option>Phone</option>
                <option>Email</option>
                <option>Video Conference</option>
                <option>In-Person</option>
              </select>
            </div>
          </div>

          <Input 
            label="Participants (Opposing Counsel)" 
            placeholder="e.g. Robert Smith, Jane Doe"
            value={newSession.participants?.join(', ') || ''}
            onChange={e => setNewSession({...newSession, participants: e.target.value.split(', ')})}
          />

          <TextArea 
            label="Discussion Notes" 
            placeholder="Summary of what was discussed..."
            rows={4}
            value={newSession.notes || ''}
            onChange={e => setNewSession({...newSession, notes: e.target.value})}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Outcome</label>
              <select 
                className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.input, theme.border.default, theme.text.primary)}
                value={newSession.result}
                onChange={e => setNewSession({...newSession, result: e.target.value as any})}
              >
                <option value="Pending">Pending</option>
                <option value="Agreed">Agreed</option>
                <option value="Partial Agreement">Partial Agreement</option>
                <option value="Impasse">Impasse (Disagreement)</option>
              </select>
            </div>
            <Input 
              label="Next Steps" 
              placeholder="e.g. File Motion, Send Letter"
              value={newSession.nextSteps || ''}
              onChange={e => setNewSession({...newSession, nextSteps: e.target.value})}
            />
          </div>

          <div className={cn("pt-4 flex justify-end gap-2 border-t mt-4", theme.border.subtle)}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Log Session</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

