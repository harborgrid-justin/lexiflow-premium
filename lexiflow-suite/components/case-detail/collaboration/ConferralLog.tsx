
import React, { useState } from 'react';
import { ConferralSession, ConferralResult, ConferralMethod } from '../../../types.ts';
import { MOCK_CONFERRALS } from '../../../data/mockCollaboration.ts';
import { Button } from '../../common/Button.tsx';
import { Badge } from '../../common/Badge.tsx';
import { Input, TextArea } from '../../common/Inputs.tsx';
import { Modal } from '../../common/Modal.tsx';
import { Phone, Mail, Users, Video, Plus, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface ConferralLogProps {
  caseId: string;
}

export const ConferralLog: React.FC<ConferralLogProps> = ({ caseId }) => {
  const [sessions, setSessions] = useState<ConferralSession[]>(MOCK_CONFERRALS.filter(c => c.caseId === caseId));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSession, setNewSession] = useState<Partial<ConferralSession>>({
    method: 'Phone',
    result: 'Pending',
    date: new Date().toISOString().split('T')[0]
  });

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Email': return <Mail className="h-4 w-4"/>;
      case 'Phone': return <Phone className="h-4 w-4"/>;
      case 'Video Conference': return <Video className="h-4 w-4"/>;
      default: return <Users className="h-4 w-4"/>;
    }
  };

  const handleSave = () => {
    const session: ConferralSession = {
      id: `conf-${Date.now()}`,
      caseId,
      topic: newSession.topic || 'General Conferral',
      date: newSession.date || new Date().toISOString().split('T')[0],
      method: newSession.method as ConferralMethod,
      participants: newSession.participants || [],
      notes: newSession.notes || '',
      result: newSession.result as ConferralResult,
      nextSteps: newSession.nextSteps
    };
    setSessions([session, ...sessions]);
    setIsModalOpen(false);
    setNewSession({ method: 'Phone', result: 'Pending', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Meet & Confer Log</h3>
          <p className="text-sm text-slate-500">Track mandatory conferral attempts.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>Log Session</Button>
      </div>

      <div className="space-y-4">
        {sessions.map(session => (
          // Design Pattern: Comment Thread / Log Entry
          <div key={session.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-all group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full border ${
                    session.method === 'Video Conference' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                    session.method === 'Email' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {getMethodIcon(session.method)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{session.topic}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-medium">{session.date}</span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{session.participants.join(', ')}</span>
                  </div>
                </div>
              </div>
              <Badge variant={session.result === 'Agreed' ? 'success' : session.result === 'Impasse' ? 'error' : 'warning'}>
                {session.result}
              </Badge>
            </div>
            
            <div className="ml-12 relative pl-4 border-l-2 border-slate-100">
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-r-lg rounded-bl-lg mb-2">
                    {session.notes}
                </p>
                {session.nextSteps && (
                    <div className="flex items-center gap-2 text-xs text-blue-700 font-medium mt-2 bg-blue-50 w-fit px-2 py-1 rounded border border-blue-100">
                        <ArrowRight className="h-3 w-3"/> Next: {session.nextSteps}
                    </div>
                )}
            </div>
          </div>
        ))}
        
        {sessions.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 bg-slate-50">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50"/>
            <p className="text-sm">No conferral sessions recorded.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Conferral Session">
        <div className="p-6 space-y-4">
          <Input label="Topic" placeholder="e.g. Discovery Dispute" value={newSession.topic || ''} onChange={e => setNewSession({...newSession, topic: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={newSession.date} onChange={e => setNewSession({...newSession, date: e.target.value})} />
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Method</label>
              <select className="w-full px-3 py-2 border rounded-md text-sm bg-white" value={newSession.method} onChange={e => setNewSession({...newSession, method: e.target.value as any})}>
                <option>Phone</option><option>Email</option><option>Video Conference</option><option>In-Person</option>
              </select>
            </div>
          </div>
          <Input label="Participants" placeholder="Names..." value={newSession.participants?.join(', ') || ''} onChange={e => setNewSession({...newSession, participants: e.target.value.split(', ')})} />
          <TextArea label="Notes" rows={3} value={newSession.notes || ''} onChange={e => setNewSession({...newSession, notes: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Outcome</label>
                <select className="w-full px-3 py-2 border rounded-md text-sm bg-white" value={newSession.result} onChange={e => setNewSession({...newSession, result: e.target.value as any})}>
                    <option value="Pending">Pending</option><option value="Agreed">Agreed</option><option value="Impasse">Impasse</option>
                </select>
            </div>
            <Input label="Next Steps" value={newSession.nextSteps || ''} onChange={e => setNewSession({...newSession, nextSteps: e.target.value})} />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Log</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
