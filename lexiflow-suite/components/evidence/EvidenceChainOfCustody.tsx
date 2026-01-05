
import React, { useState, useTransition } from 'react';
import { Button } from '../common/Button.tsx';
import { User, Layers, Plus, AlertCircle } from 'lucide-react';
import { EvidenceItem, ChainOfCustodyEvent } from '../../types.ts';
import { Modal } from '../common/Modal.tsx';
import { Input, TextArea } from '../common/Inputs.tsx';
import { SignaturePad } from '../common/SignaturePad.tsx';

interface EvidenceChainOfCustodyProps {
  selectedItem: EvidenceItem;
  onCustodyUpdate?: (event: ChainOfCustodyEvent) => void;
}

export const EvidenceChainOfCustody: React.FC<EvidenceChainOfCustodyProps> = ({ selectedItem, onCustodyUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    action: 'Transfer',
    actor: '',
    notes: '',
    verified: false
  });
  const [isSigning, setIsSigning] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = async () => {
    if (!formData.actor || !onCustodyUpdate) return;

    setIsSigning(true);
    // Simulate digital signature delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    startTransition(() => {
        const newEvent: ChainOfCustodyEvent = {
            id: `cc-${Date.now()}`,
            date: new Date().toISOString(),
            action: formData.action,
            actor: formData.actor,
            notes: formData.notes
        };

        onCustodyUpdate(newEvent);
        setIsSigning(false);
        setIsModalOpen(false);
        setFormData({ action: 'Transfer', actor: '', notes: '', verified: false });
    });
  };

  const chainEvents = selectedItem.chainOfCustody || [];

  return (
    <div className={`space-y-6 transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Chain of Custody Log</h3>
          <p className="text-sm text-slate-500">Chronological history of evidence handling.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>Record Event</Button>
      </div>

      {chainEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-slate-400">
              <AlertCircle className="h-10 w-10 mb-2 opacity-50"/>
              <p className="text-sm font-medium">No custody events recorded.</p>
          </div>
      ) : (
        <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 py-4">
            {chainEvents.map((event, idx) => (
            <div key={event.id} className="relative pl-8">
                <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white ${idx === 0 ? 'bg-green-500 ring-4 ring-green-100' : 'bg-slate-300'}`}></div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-900 flex items-center">
                    {event.action}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{event.date}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600 mb-2">
                    <User className="h-4 w-4 mr-2 text-slate-400"/>
                    Handled by <span className="font-semibold text-slate-900 ml-1">{event.actor}</span>
                </div>
                {event.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded">
                    "{event.notes}"
                    </p>
                )}
                <div className="mt-3 pt-3 border-t border-slate-100 flex gap-4 text-xs text-slate-400">
                    <span className="flex items-center"><Layers className="h-3 w-3 mr-1"/> Hash: <span className="font-mono ml-1">{selectedItem.blockchainHash ? selectedItem.blockchainHash.substring(0,8) + '...' : 'sha256...8a2f'}</span></span>
                    <span>Signature: <span className="text-green-600 font-medium">Verified</span></span>
                </div>
                </div>
            </div>
            ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Record Custody Event"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Action Type</label>
            <select 
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
              value={formData.action}
              onChange={(e) => setFormData({...formData, action: e.target.value})}
            >
              <option value="Transfer">Transfer Custody</option>
              <option value="Check-In">Check-In to Storage</option>
              <option value="Check-Out">Check-Out for Analysis</option>
              <option value="Exhibit Prep">Preparation for Trial</option>
              <option value="Destruction">Authorized Destruction</option>
            </select>
          </div>

          <Input 
            label="Actor / Handler" 
            placeholder="Name of person taking possession"
            value={formData.actor}
            onChange={(e) => setFormData({...formData, actor: e.target.value})}
          />

          <TextArea 
            label="Notes & Condition" 
            placeholder="Describe condition of evidence, seals checked, destination..."
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={3}
          />

          <SignaturePad 
            value={formData.verified} 
            onChange={(v) => setFormData({...formData, verified: v})}
            isSigning={isSigning}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleSave} 
              disabled={!formData.actor || !formData.verified || isSigning}
              isLoading={isSigning}
            >
              {isSigning ? 'Cryptographic Signing...' : 'Sign & Record'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
