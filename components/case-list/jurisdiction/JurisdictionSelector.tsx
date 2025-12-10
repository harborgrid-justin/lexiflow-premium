
import React, { useState, useEffect } from 'react';
import { JurisdictionObject } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { FEDERAL_CIRCUITS, STATE_JURISDICTIONS, StateJurisdiction } from '../../../data/federalHierarchy';
import { Globe, Scale, Building2 } from 'lucide-react';

interface JurisdictionSelectorProps {
  onJurisdictionChange: (data: { finalCourt: string; jurisdictionConfig: JurisdictionObject } | null) => void;
}

export const JurisdictionSelector: React.FC<JurisdictionSelectorProps> = ({ onJurisdictionChange }) => {
  const { theme } = useTheme();

  const [courtSystem, setCourtSystem] = useState<'Federal' | 'State'>('Federal');
  const [fedLevel, setFedLevel] = useState<'Supreme' | 'Appellate' | 'District' | 'Bankruptcy'>('District');
  const [fedCircuit, setFedCircuit] = useState(FEDERAL_CIRCUITS[0].name);
  const [fedDistrict, setFedDistrict] = useState(FEDERAL_CIRCUITS[0].districts?.[0] || '');
  const [selectedStateId, setSelectedStateId] = useState<string>('VA');
  const [stateLevelName, setStateLevelName] = useState<string>('');
  const [specificStateCourt, setSpecificStateCourt] = useState<string>('');

  useEffect(() => {
    const circuit = FEDERAL_CIRCUITS.find(c => c.name === fedCircuit);
    if (circuit?.districts?.[0]) {
      setFedDistrict(circuit.districts[0]);
    }
  }, [fedCircuit]);

  useEffect(() => {
    if (courtSystem === 'State') {
      const stateData = STATE_JURISDICTIONS[selectedStateId];
      if (stateData?.levels[0]) {
        setStateLevelName(stateData.levels[0].name);
        if (stateData.levels[0].courts[0]) {
          setSpecificStateCourt(stateData.levels[0].courts[0]);
        }
      }
    }
  }, [selectedStateId, courtSystem]);

  useEffect(() => {
    if (courtSystem === 'State') {
      const levelData = STATE_JURISDICTIONS[selectedStateId]?.levels.find(l => l.name === stateLevelName);
      if (levelData?.courts[0]) {
        setSpecificStateCourt(levelData.courts[0]);
      }
    }
  }, [stateLevelName, selectedStateId]);

  useEffect(() => {
    let finalCourt = '';
    let jurisdictionConfig: JurisdictionObject | null = null;
  
    if (courtSystem === 'Federal') {
      jurisdictionConfig = {
        country: 'USA', state: 'Federal', courtLevel: fedLevel, division: fedCircuit
      };
      if (fedLevel === 'Supreme') finalCourt = 'Supreme Court of the United States';
      else if (fedLevel === 'Appellate') finalCourt = `U.S. Court of Appeals for the ${fedCircuit}`;
      else finalCourt = `U.S. ${fedLevel} Court, ${fedDistrict}`;
    } else {
      const stateData = STATE_JURISDICTIONS[selectedStateId];
      if (stateData) {
        jurisdictionConfig = { country: 'USA', state: stateData.name, courtLevel: 'State' as 'State', division: stateLevelName };
        finalCourt = specificStateCourt;
      }
    }

    if (finalCourt && jurisdictionConfig) {
        onJurisdictionChange({ finalCourt, jurisdictionConfig });
    } else {
        onJurisdictionChange(null);
    }
  }, [courtSystem, fedLevel, fedCircuit, fedDistrict, selectedStateId, stateLevelName, specificStateCourt, onJurisdictionChange]);


  const activeFederalCircuit = FEDERAL_CIRCUITS.find(c => c.name === fedCircuit);
  const activeStateData = STATE_JURISDICTIONS[selectedStateId];
  const activeStateLevel = activeStateData?.levels.find(l => l.name === stateLevelName);

  return (
    <div className={cn("p-4 rounded-lg border bg-slate-50/50 space-y-4", theme.border.default)}>
      <h4 className={cn("font-bold text-sm flex items-center", theme.text.primary)}>
        <Globe className="h-4 w-4 mr-2 text-blue-600"/> Jurisdiction & Venue
      </h4>
      <div>
        <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Court System</label>
        <div className="flex gap-2">
          <button onClick={() => setCourtSystem('Federal')} className={cn("flex-1 py-1.5 text-xs border rounded font-medium flex items-center justify-center gap-2", courtSystem === 'Federal' ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600")}>
            <Scale className="h-3 w-3"/> Federal
          </button>
          <button onClick={() => setCourtSystem('State')} className={cn("flex-1 py-1.5 text-xs border rounded font-medium flex items-center justify-center gap-2", courtSystem === 'State' ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600")}>
            <Building2 className="h-3 w-3"/> State
          </button>
        </div>
      </div>

      {courtSystem === 'Federal' && (
        <>
          <div>
            <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Court Level</label>
            <select className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default)} value={fedLevel} onChange={e => setFedLevel(e.target.value as any)}>
              <option value="District">District Court</option>
              <option value="Appellate">Circuit Court of Appeals</option>
              <option value="Bankruptcy">Bankruptcy Court</option>
              <option value="Supreme">Supreme Court</option>
            </select>
          </div>
          {fedLevel !== 'Supreme' && (
            <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Circuit</label>
              <select className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default)} value={fedCircuit} onChange={e => setFedCircuit(e.target.value)}>
                {FEDERAL_CIRCUITS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          )}
          {(fedLevel === 'District' || fedLevel === 'Bankruptcy') && activeFederalCircuit?.districts && (
            <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>District</label>
              <select className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default)} value={fedDistrict} onChange={e => setFedDistrict(e.target.value)}>
                {activeFederalCircuit.districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}
        </>
      )}

      {courtSystem === 'State' && activeStateData && (
        <>
          <div>
            <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>State / District</label>
            <select className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default)} value={selectedStateId} onChange={e => setSelectedStateId(e.target.value)}>
              {(Object.values(STATE_JURISDICTIONS) as StateJurisdiction[]).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {activeStateData.levels.length > 0 && (
            <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Jurisdiction Level</label>
              <select className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default)} value={stateLevelName} onChange={e => setStateLevelName(e.target.value)}>
                {activeStateData.levels.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
              </select>
            </div>
          )}
          {activeStateLevel?.courts.length && (
            <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Specific Court / Region</label>
              <select className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default)} value={specificStateCourt} onChange={e => setSpecificStateCourt(e.target.value)}>
                {activeStateLevel.courts.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
};
