
import React, { useState, useTransition } from 'react';
import { Button } from '../common/Button.tsx';
import { EvidenceItem, ChainOfCustodyEvent } from '../../types.ts';
import { ArrowLeft, FileSearch, Lock, ExternalLink, Edit2, Trash2, Save, RefreshCw } from 'lucide-react';
import { EvidenceOverview } from './EvidenceOverview.tsx';
import { EvidenceChainOfCustody } from './EvidenceChainOfCustody.tsx';
import { EvidenceAdmissibility } from './EvidenceAdmissibility.tsx';
import { EvidenceStructure } from './EvidenceStructure.tsx';
import { EvidenceForensics } from './EvidenceForensics.tsx';
import { Modal } from '../common/Modal.tsx';
import { Input, TextArea } from '../common/Inputs.tsx';

interface EvidenceDetailProps {
  selectedItem: EvidenceItem;
  handleBack: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onNavigateToCase?: (caseId: string) => void;
  onCustodyUpdate?: (event: ChainOfCustodyEvent) => void;
  onUpdate?: (updates: Partial<EvidenceItem>) => void;
  onDelete?: () => void;
}

export const EvidenceDetail: React.FC<EvidenceDetailProps> = ({ 
  selectedItem, handleBack, activeTab, setActiveTab, onNavigateToCase, onCustodyUpdate, onUpdate, onDelete 
}) => {
  const [isPending, startTransition] = useTransition();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<EvidenceItem>>({});

  const handleTabChange = (tab: string) => {
      startTransition(() => {
          setActiveTab(tab);
      });
  };

  const openEdit = () => {
      setEditFormData({
          title: selectedItem.title,
          description: selectedItem.description,
          custodian: selectedItem.custodian,
          location: selectedItem.location,
          admissibility: selectedItem.admissibility,
          type: selectedItem.type,
          collectionDate: selectedItem.collectionDate
      });
      setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
      if (onUpdate) {
          startTransition(() => {
              onUpdate(editFormData);
              setIsEditModalOpen(false);
          });
      }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{selectedItem.title}</h1>
              <span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-600">{selectedItem.id}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-500 text-sm">Associated Case: <span className="font-medium text-blue-600">{selectedItem.caseId}</span></p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            {onNavigateToCase && (
                <Button variant="outline" icon={ExternalLink} onClick={() => onNavigateToCase(selectedItem.caseId)}>View Case</Button>
            )}
            {onUpdate && <Button variant="secondary" icon={Edit2} onClick={openEdit}>Edit</Button>}
            <Button variant="outline" icon={FileSearch}>Generate Report</Button>
            <Button variant="primary" icon={Lock} onClick={() => handleTabChange('custody')}>Log Transfer</Button>
            {onDelete && <Button variant="danger" icon={Trash2} onClick={onDelete}>Delete</Button>}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {['overview', 'structure', 'custody', 'admissibility', 'forensics'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap capitalize transition-colors ${
                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab === 'custody' ? 'Chain of Custody' : tab === 'structure' ? 'Document Chunks' : tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-y-auto pb-8 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {activeTab === 'overview' && <EvidenceOverview selectedItem={selectedItem} />}
        {activeTab === 'structure' && <EvidenceStructure selectedItem={selectedItem} />}
        {activeTab === 'custody' && <EvidenceChainOfCustody selectedItem={selectedItem} onCustodyUpdate={onCustodyUpdate} />}
        {activeTab === 'admissibility' && <EvidenceAdmissibility selectedItem={selectedItem} />}
        {activeTab === 'forensics' && <EvidenceForensics selectedItem={selectedItem} />}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Evidence Metadata">
          <div className="p-6 space-y-4">
              <Input label="Title" value={editFormData.title || ''} onChange={e => setEditFormData({...editFormData, title: e.target.value})} />
              <TextArea label="Description" rows={3} value={editFormData.description || ''} onChange={e => setEditFormData({...editFormData, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                  <Input label="Current Custodian" value={editFormData.custodian || ''} onChange={e => setEditFormData({...editFormData, custodian: e.target.value})} />
                  <Input label="Storage Location" value={editFormData.location || ''} onChange={e => setEditFormData({...editFormData, location: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <Input label="Collection Date" type="date" value={editFormData.collectionDate || ''} onChange={e => setEditFormData({...editFormData, collectionDate: e.target.value})} />
                  <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Item Type</label>
                      <select 
                          className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                          value={editFormData.type}
                          onChange={e => setEditFormData({...editFormData, type: e.target.value as any})}
                      >
                          <option value="Document">Document</option>
                          <option value="Physical">Physical</option>
                          <option value="Digital">Digital</option>
                          <option value="Forensic">Forensic</option>
                      </select>
                  </div>
              </div>
              <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Admissibility Status</label>
                  <select 
                      className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                      value={editFormData.admissibility}
                      onChange={e => setEditFormData({...editFormData, admissibility: e.target.value as any})}
                  >
                      <option value="Pending">Pending</option>
                      <option value="Admissible">Admissible</option>
                      <option value="Challenged">Challenged</option>
                  </select>
              </div>
              <div className="flex justify-end pt-4 gap-2">
                  <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                  <Button variant="primary" icon={Save} onClick={handleSaveEdit}>Save Changes</Button>
              </div>
          </div>
      </Modal>
    </div>
  );
};
