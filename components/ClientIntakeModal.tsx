
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, UserPlus, AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from './common/Modal';
import { Button } from './common/Button';
import { Input } from './common/Inputs';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { DataService } from '../services/dataService';
import { useDebounce } from '../hooks/useDebounce';

interface ClientIntakeModalProps {
  onClose: () => void;
  onSave?: (name: string) => void;
}

export const ClientIntakeModal: React.FC<ClientIntakeModalProps> = ({ onClose, onSave }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [contact, setContact] = useState('');
  
  // Conflict State
  const [isChecking, setIsChecking] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const debouncedName = useDebounce(name, 500);

  useEffect(() => {
      if (!debouncedName || debouncedName.length < 3) {
          setConflicts([]);
          setIsChecking(false);
          return;
      }

      const runCheck = async () => {
          setIsChecking(true);
          // Parallel fetch for full scope
          const [clients, parties] = await Promise.all([
              DataService.clients.getAll(),
              // DataService.parties.getAll() // Assuming we implement a party retrieval in DataService facade or fetch cases and flatten parties
              DataService.cases.getAll().then(cases => cases.flatMap(c => c.parties || [])) 
          ]);
          
          const q = debouncedName.toLowerCase();
          const found: string[] = [];
          
          clients.forEach(c => {
              if (c.name.toLowerCase().includes(q)) found.push(`Existing Client: ${c.name}`);
          });
          
          parties.forEach(p => {
              if (p.name.toLowerCase().includes(q)) found.push(`Party in Case: ${p.name} (${p.role})`);
          });
          
          setConflicts(found);
          setIsChecking(false);
      };
      
      runCheck();
  }, [debouncedName]);

  return (
    <Modal isOpen={true} onClose={onClose} title="New Client Intake">
      <div className="p-6 space-y-4">
        <div className={cn("p-4 rounded-lg border flex items-center gap-3 mb-4", theme.surfaceHighlight, theme.border.default)}>
            <div className="bg-blue-100 p-2 rounded-full text-blue-600"><UserPlus className="h-5 w-5"/></div>
            <div>
                <h4 className={cn("font-bold text-sm", theme.text.primary)}>Prospect Record</h4>
                <p className={cn("text-xs", theme.text.secondary)}>Create a new lead to begin conflict checks.</p>
            </div>
        </div>

        <Input 
          label="Client / Entity Name" 
          placeholder="e.g. Acme Corp" 
          value={name} 
          onChange={e => setName(e.target.value)}
          autoFocus
        />
        
        <div className="grid grid-cols-2 gap-4">
            <Input 
                label="Industry" 
                placeholder="e.g. Technology" 
                value={industry} 
                onChange={e => setIndustry(e.target.value)}
            />
            <Input 
                label="Primary Contact" 
                placeholder="Email or Phone" 
                value={contact} 
                onChange={e => setContact(e.target.value)}
            />
        </div>

        <Input label="Opposing Parties (Conflict Check)" placeholder="Enter names separated by commas..." />
        
        {/* Live Conflict Result */}
        <div className={cn("p-3 rounded border text-xs flex flex-col gap-1 transition-colors", 
             isChecking ? "bg-slate-50 border-slate-200 text-slate-500" :
             conflicts.length > 0 ? "bg-red-50 border-red-200 text-red-800" :
             name.length > 2 ? "bg-green-50 border-green-200 text-green-800" : "bg-slate-50 border-slate-200 text-slate-400"
        )}>
          <div className="flex items-center font-medium">
             {isChecking ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : 
              conflicts.length > 0 ? <AlertTriangle className="h-4 w-4 mr-2"/> : 
              name.length > 2 ? <ShieldCheck className="h-4 w-4 mr-2"/> : <ShieldCheck className="h-4 w-4 mr-2 opacity-50"/>
             }
             
             {isChecking ? "Scanning database..." : 
              conflicts.length > 0 ? "Potential Conflicts Detected" : 
              name.length > 2 ? "Clearance Check Passed" : "Enter name to scan conflicts"}
          </div>
          
          {conflicts.length > 0 && (
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  {conflicts.slice(0, 3).map((c, i) => <li key={i}>{c}</li>)}
                  {conflicts.length > 3 && <li>...and {conflicts.length - 3} more</li>}
              </ul>
          )}
        </div>

        <div className={cn("flex justify-end gap-3 pt-4 border-t mt-2", theme.border.light)}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={() => onSave && name && onSave(name)}
            disabled={!name || conflicts.length > 0} // Prevent creation on conflict
            icon={Plus}
          >
            Create Prospect Record
          </Button>
        </div>
      </div>
    </Modal>
  );
};
