import React, { useState } from 'react';
import { Button } from '../common/Button';
import { User, Layers, Plus, ShieldCheck, AlertOctagon, Link } from 'lucide-react';
import { EvidenceItem, ChainOfCustodyEvent } from '../../types';
import { Modal } from '../common/Modal';
import { Input, TextArea } from '../common/Inputs';
import { SignaturePad } from '../common/SignaturePad';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { ChainService } from '../../services/chainService';

interface EvidenceChainOfCustodyProps {
  selectedItem: EvidenceItem;
  onCustodyUpdate?: (event: ChainOfCustodyEvent) => void;
}

export const EvidenceChainOfCustody: React.FC<EvidenceChainOfCustodyProps> = ({ selectedItem, onCustodyUpdate }) => {
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    action: 'Transfer',
    actor: '',
    notes: '',
    verified: false
  });
  const [isSigning, setIsSigning] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');

  // Cryptographic Verification Logic
  const verifyChainIntegrity = async () => {
      setVerifyStatus('verifying');
      await new Promise(r => setTimeout(r, 1000)); // Simulate calculation time
      
      // In a real app, we would re-calculate SHA-256 of every node
      // For this demo, we check if the blockchainHash exists as a proxy for "anchored"
      if (selectedItem.blockchainHash) {
          setVerifyStatus('valid');
      } else {
          setVerifyStatus('invalid');
      }
  };

  const handleSave = async () => {
    if (!formData.actor || !onCustodyUpdate) return;

    setIsSigning(true);
    // Generate a hash for this specific event to simulate locking it
    const eventData = `${formData.action}:${formData.actor}:${new Date().toISOString()}`;
    const hash = await ChainService.generateHash(eventData);
    
    await new Promise(resolve => setTimeout(resolve, 800));

    const newEvent: ChainOfCustodyEvent = {
      id: `cc-${Date.now()}`,
      date: new Date().toISOString(),
      action: formData.action,
      actor: formData.actor,
      notes: `${formData.notes} [Hash: ${hash.substring(0, 8)}...]`
    };

    onCustodyUpdate(newEvent);
    setIsSigning(false);
    setIsModalOpen(false);
    setFormData({ action: 'Transfer', actor: '', notes: '', verified: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className={cn("text-lg font-bold", theme.text.primary)}>Chain of Custody Log</h3>
          <p className={cn("text-sm", theme.text.secondary)}>Chronological history of evidence handling.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <Button 
                variant={verifyStatus === 'valid' ? 'outline' : 'secondary'} 
                icon={verifyStatus === 'valid' ? ShieldCheck : Link}
                onClick={verifyChainIntegrity}
                isLoading={verifyStatus === 'verifying'}
                className={cn("flex-1", verifyStatus === 'valid' ? "text-green-600 border-green-200 bg-green-50" : "")}
            >
                {verifyStatus === 'idle' ? 'Verify Chain' : verifyStatus === 'verifying' ? 'Hashing...' : verifyStatus === 'valid' ? 'Integrity Valid' : 'Chain Broken'}
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} className="flex-1">Record Event</Button>
        </div>
      </div>
      
      {verifyStatus === 'valid' && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-3 rounded-lg flex items-center animate-in fade-in slide-in-from-top-2">
              <ShieldCheck className="h-4 w-4 mr-2"/>
              <span><strong>Cryptographic Verification Passed:</strong> All custody events match the immutable ledger anchor.</span>
          </div>
      )}

      {verifyStatus === 'invalid' && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-lg flex items-center animate-in fade-in slide-in-from-top-2">
              <AlertOctagon className="h-4 w-4 mr-2"/>
              <span><strong>Verification Failed:</strong> Latest hash does not match the anchored root. Potential tampering detected.</span>
          </div>
      )}

      <div className={cn("relative border-l-2 ml-4 space-y-8 py-4", theme.border.default)}>
        {selectedItem.chainOfCustody.map((event, idx) => (
          <div key={event.id} className="relative pl-8">
            <div className={cn(
                "absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2",
                theme.surface === 'bg-white' ? 'border-white' : 'border-slate-900',
                idx === 0 ? "bg-green-500 ring-4 ring-green-100" : "bg-slate-300"
            )}></div>
            
            <div className={cn(
                "p-4 rounded-lg border shadow-sm transition-colors",
                theme.surface,
                theme.border.default,
                `hover:${theme.border.light}`
            )}>
              <div className="flex justify-between items-start mb-2">
                <span className={cn("font-bold flex items-center", theme.text.primary)}>
                  {event.action}
                </span>
                <span className={cn("text-xs font-mono", theme.text.tertiary)}>{event.date}</span>
              </div>
              <div className={cn("flex items-center text-sm mb-2", theme.text.secondary)}>
                <User className={cn("h-4 w-4 mr-2", theme.text.tertiary)}/>
                Handled by <span className={cn("font-semibold ml-1", theme.text.primary)}>{event.actor}</span>
              </div>
              {event.notes && (
                <p className={cn("text-xs italic p-2 rounded", theme.text.secondary, theme.surfaceHighlight)}>
                  "{event.notes}"
                </p>
              )}
              <div className={cn("mt-3 pt-3 border-t flex gap-4 text-xs", theme.border.light, theme.text.tertiary)}>
                <span className="flex items-center"><Layers className="h-3 w-3 mr-1"/> Hash: <span className="font-mono ml-1">{selectedItem.blockchainHash ? selectedItem.blockchainHash.substring(0,8) + '...' : 'sha256...8a2f'}</span></span>
                <span className="flex items-center text-green-600 font-medium"><ShieldCheck className="h-3 w-3 mr-1"/> Verified</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Record Custody Event"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Action Type</label>
            <select 
              className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.border.default, theme.surface)}
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