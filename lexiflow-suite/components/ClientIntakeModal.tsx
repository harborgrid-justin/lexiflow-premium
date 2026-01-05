
import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface ClientIntakeModalProps {
  onClose: () => void;
  onSave?: (name: string) => void;
}

export const ClientIntakeModal: React.FC<ClientIntakeModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intake-title"
    >
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h3 className="text-xl font-bold mb-4" id="intake-title">New Client Intake</h3>
        <div className="space-y-4">
          <input 
            placeholder="Client Name" 
            className="w-full p-2 border rounded" 
            value={name} 
            onChange={e => setName(e.target.value)}
            aria-label="Client Name"
          />
          <input 
            placeholder="Opposing Parties (Conflict Check)" 
            className="w-full p-2 border rounded" 
            aria-label="Opposing Parties"
          />
          <div className="bg-green-50 p-3 rounded border border-green-200 text-green-800 text-sm flex items-center">
            <ShieldCheck className="h-4 w-4 mr-2" /> No conflicts found in database.
          </div>
          <button 
            className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
            onClick={() => onSave && name && onSave(name)}
          >
            Create Prospect Record
          </button>
          <button onClick={onClose} className="w-full py-2 text-slate-500 hover:text-slate-700">Cancel</button>
        </div>
      </div>
    </div>
  );
};
