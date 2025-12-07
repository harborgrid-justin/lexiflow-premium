
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, TextArea } from '../common/Inputs';
import { Case, CaseStatus, MatterType } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { FEDERAL_CIRCUITS, STATE_JURISDICTIONS } from '../../data/jurisdictionData';
import { Globe, Scale, Shield, FilePlus, Building2 } from 'lucide-react';
import { ModalFooter } from '../common/RefactoredCommon';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newCase: Case) => void;
}

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({ isOpen, onClose, onSave }) => {
  const { theme } = useTheme();
  
  // Workflow State
  const [isPreFiling, setIsPreFiling] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Case>>({
      title: '',
      client: '',
      matterType: 'Litigation',
      value: 0,
      description: ''
  });

  // Jurisdiction Logic
  const [courtSystem, setCourtSystem] = useState<'Federal' | 'State'>('Federal');
  
  // Federal State
  const [fedLevel, setFedLevel] = useState<'Supreme' | 'Appellate' | 'District' | 'Bankruptcy'>('District');
  const [fedCircuit, setFedCircuit] = useState(FEDERAL_CIRCUITS[0].name);
  const [fedDistrict, setFedDistrict] = useState(FEDERAL_CIRCUITS[0].districts?.[0] || '');

  // State System Logic
  const [selectedStateId, setSelectedStateId] = useState<string>('VA');
  const [stateLevelName, setStateLevelName] = useState<string>(''); // e.g. "Circuit Court"
  const [specificStateCourt, setSpecificStateCourt] = useState<string>(''); // e.g. "19th Judicial Circuit"

  // Effects
  useEffect(() => {
      // Reset Federal dependent dropdowns
      const circuit = FEDERAL_CIRCUITS.find(c => c.name === fedCircuit);
      if (circuit && circuit.districts && circuit.districts.length > 0) {
          setFedDistrict(circuit.districts[0]);
      }
  }, [fedCircuit]);

  useEffect(() => {
      // Reset State dependent dropdowns when state changes
      if (courtSystem === 'State') {
          const stateData = STATE_JURISDICTIONS[selectedStateId];
          if (stateData && stateData.levels.length > 0) {
              setStateLevelName(stateData.levels[0].name);
              setSpecificStateCourt(stateData.levels[0].courts[0]);
          }
      }
  }, [selectedStateId, courtSystem]);

  useEffect(() => {
      // Reset Specific court when Level changes
      if (courtSystem === 'State') {
          const stateData = STATE_JURISDICTIONS[selectedStateId];
          const levelData = stateData.levels.find(l => l.name === stateLevelName);
          if (levelData && levelData.courts.length > 0) {
              setSpecificStateCourt(levelData.courts[0]);
          }
      }
  }, [stateLevelName]);


  const handleSave = () => {
      if (!formData.title || !formData.client) return;

      // Construct Court String based on hierarchy
      let finalCourt = '';
      let finalJurisdiction = '';

      if (courtSystem === 'Federal') {
          finalJurisdiction = `Federal - ${fedCircuit}`;
          if (fedLevel === 'Supreme') finalCourt = 'Supreme Court of the United States';
          else if (fedLevel === 'Appellate') finalCourt = `U.S. Court of Appeals for the ${fedCircuit}`;
          else if (fedLevel === 'District') finalCourt = `U.S. District Court, ${fedDistrict}`;
          else if (fedLevel === 'Bankruptcy') finalCourt = `U.S. Bankruptcy Court, ${fedDistrict}`;
      } else {
          // State Logic
          const stateData = STATE_JURISDICTIONS[selectedStateId];
          finalJurisdiction = `${stateData.name} - ${stateLevelName}`;
          finalCourt = specificStateCourt;
      }

      const newCase: Case = {
          id: isPreFiling ? `MAT-${Date.now()}` : (formData.id || `CASE-${Date.now()}`), // MAT prefix for matters
          title: formData.title,
          client: formData.client,
          matterType: formData.matterType as MatterType,
          status: isPreFiling ? CaseStatus.PreFiling : CaseStatus.Discovery,
          filingDate: isPreFiling ? '' : new Date().toISOString().split('T')[0],
          description: formData.description || '',
          value: Number(formData.value),
          jurisdiction: finalJurisdiction,
          court: finalCourt,
          judge: isPreFiling ? 'Unassigned' : formData.judge,
          // Defaults
          opposingCounsel: 'Pending',
          parties: [],
          citations: [],
          arguments: [],
          defenses: []
      };

      onSave(newCase);
      onClose();
  };

  // Helpers for rendering
  const activeFederalCircuit = FEDERAL_CIRCUITS.find(c => c.name === fedCircuit);
  const activeStateData = STATE_JURISDICTIONS[selectedStateId];
  const activeStateLevel = activeStateData?.levels.find(l => l.name === stateLevelName);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isPreFiling ? "Develop New Matter" : "File New Case"} size="lg">
      <div className="p-6 space-y-6">
        
        {/* Toggle Type */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mb-6">
             <button 
                onClick={() => setIsPreFiling(true)}
                className={cn(
                    "flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2",
                    isPreFiling ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700"
                )}
             >
                <FilePlus className="h-4 w-4"/> Pre-Filing Matter
             </button>
             <button 
                onClick={() => setIsPreFiling(false)}
                className={cn(
                    "flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2",
                    !isPreFiling ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700"
                )}
             >
                <Scale className="h-4 w-4"/> Active Litigation
             </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
                <Input 
                    label="Case / Matter Title" 
                    placeholder={isPreFiling ? "e.g. In Re: TechCorp Investigation" : "e.g. Smith v. Jones"} 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    autoFocus
                />
                <Input 
                    label="Client" 
                    placeholder="Client Name" 
                    value={formData.client} 
                    onChange={e => setFormData({...formData, client: e.target.value})}
                />
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Type</label>
                        <select 
                            className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default, theme.text.primary)}
                            value={formData.matterType}
                            onChange={e => setFormData({...formData, matterType: e.target.value as MatterType})}
                        >
                            <option value="Litigation">Litigation</option>
                            <option value="Appeal">Appeal</option>
                            <option value="M&A">M&A</option>
                            <option value="IP">Intellectual Property</option>
                            <option value="Real Estate">Real Estate</option>
                        </select>
                    </div>
                    <Input 
                        label="Est. Value ($)" 
                        type="number"
                        value={formData.value || ''} 
                        onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                    />
                </div>
            </div>

            <div className={cn("p-4 rounded-lg border bg-slate-50/50 space-y-4", theme.border.default)}>
                <h4 className={cn("font-bold text-sm flex items-center", theme.text.primary)}>
                    <Globe className="h-4 w-4 mr-2 text-blue-600"/> Jurisdiction & Venue
                </h4>
                
                {/* System Selector */}
                <div>
                    <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Court System</label>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCourtSystem('Federal')}
                            className={cn("flex-1 py-1.5 text-xs border rounded font-medium flex items-center justify-center gap-2", courtSystem === 'Federal' ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600")}
                        >
                            <Scale className="h-3 w-3"/> Federal
                        </button>
                        <button 
                             onClick={() => setCourtSystem('State')}
                             className={cn("flex-1 py-1.5 text-xs border rounded font-medium flex items-center justify-center gap-2", courtSystem === 'State' ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600")}
                        >
                            <Building2 className="h-3 w-3"/> State
                        </button>
                    </div>
                </div>

                {/* FEDERAL LOGIC */}
                {courtSystem === 'Federal' && (
                    <>
                        <div>
                            <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Court Level</label>
                            <select 
                                className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default)}
                                value={fedLevel}
                                onChange={e => setFedLevel(e.target.value as any)}
                            >
                                <option value="Supreme">Supreme Court</option>
                                <option value="Appellate">Circuit Court of Appeals</option>
                                <option value="District">District Court</option>
                                <option value="Bankruptcy">Bankruptcy Court</option>
                            </select>
                        </div>

                        {fedLevel !== 'Supreme' && (
                            <div>
                                <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Circuit</label>
                                <select 
                                    className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default)}
                                    value={fedCircuit}
                                    onChange={e => setFedCircuit(e.target.value)}
                                >
                                    {FEDERAL_CIRCUITS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                        )}

                        {(fedLevel === 'District' || fedLevel === 'Bankruptcy') && activeFederalCircuit?.districts && (
                             <div>
                                <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>District</label>
                                <select 
                                    className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default)}
                                    value={fedDistrict}
                                    onChange={e => setFedDistrict(e.target.value)}
                                >
                                    {activeFederalCircuit.districts.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        )}
                    </>
                )}

                {/* STATE LOGIC */}
                {courtSystem === 'State' && (
                    <>
                        <div>
                            <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>State / District</label>
                            <select 
                                className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default)}
                                value={selectedStateId}
                                onChange={e => setSelectedStateId(e.target.value)}
                            >
                                {Object.values(STATE_JURISDICTIONS).map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        {activeStateData && (
                            <>
                                <div>
                                    <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Jurisdiction Level</label>
                                    <select 
                                        className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default)}
                                        value={stateLevelName}
                                        onChange={e => setStateLevelName(e.target.value)}
                                    >
                                        {activeStateData.levels.map(l => (
                                            <option key={l.name} value={l.name}>{l.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {activeStateLevel && activeStateLevel.courts.length > 0 && (
                                    <div>
                                        <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Specific Court / District / Region</label>
                                        <select 
                                            className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default)}
                                            value={specificStateCourt}
                                            onChange={e => setSpecificStateCourt(e.target.value)}
                                        >
                                            {activeStateLevel.courts.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>

        {!isPreFiling && (
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                 <Input 
                    label="Case Number" 
                    placeholder="e.g. 1:24-cv-00123"
                    value={formData.id} 
                    onChange={e => setFormData({...formData, id: e.target.value})}
                />
                 <Input 
                    label="Assigned Judge" 
                    placeholder="Presiding Judge"
                    value={formData.judge} 
                    onChange={e => setFormData({...formData, judge: e.target.value})}
                />
            </div>
        )}

        <div className="pt-2">
            <TextArea 
                label="Case Summary / Description" 
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Brief overview of the matter..."
            />
        </div>
        
        <ModalFooter>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>
                {isPreFiling ? 'Create Matter' : 'File Case'}
            </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
};
