
import React, { useState, useRef, useTransition } from 'react';
import { Card } from '../common/Card.tsx';
import { Button } from '../common/Button.tsx';
import { ArrowLeft, UploadCloud, CheckCircle, Loader2, Link, ShieldCheck } from 'lucide-react';
import { DocumentService } from '../../services/documentService.ts';
import { EvidenceItem } from '../../types.ts';
import { Stepper } from '../common/Stepper.tsx';
import { useWizard } from '../../hooks/useWizard.ts';
import { useNotify } from '../../hooks/useNotify.ts';
import { TagInput } from '../common/TagInput.tsx';

interface EvidenceIntakeProps {
  handleBack: () => void;
  onComplete: (item: EvidenceItem) => void;
}

export const EvidenceIntake: React.FC<EvidenceIntakeProps> = ({ handleBack, onComplete }) => {
  const wizard = useWizard(2);
  const notify = useNotify();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processStage, setProcessStage] = useState('');
  
  const [title, setTitle] = useState('');
  const [custodian, setCustodian] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Document');
  const [generatedData, setGeneratedData] = useState<{hash?: string, uuid?: string, tags?: string[]}>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Guideline 3: Transition for state updates
  const [isPending, startTransition] = useTransition();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setTitle(selectedFile.name);
      
      setProcessing(true);
      setProcessStage('Scanning for Malware...');
      await new Promise(r => setTimeout(r, 800));
      setProcessStage('OCR & Text Extraction...');
      await new Promise(r => setTimeout(r, 800));
      setProcessStage('Splitting Documents...');
      await new Promise(r => setTimeout(r, 600));
      setProcessStage('Generating Blockchain Hash...');
      
      const data = await DocumentService.processFile(selectedFile);
      
      startTransition(() => {
        setGeneratedData(data);
        setDescription(data.summary);
        setProcessing(false);
        setProcessStage('Complete');
        notify.success("File processed and hashed");
        wizard.next();
      });
    }
  };

  const handleFinish = () => {
      // Guideline 1: Secure ID Generation
      const newItem: EvidenceItem = {
          id: `EV-${crypto.randomUUID()}`,
          trackingUuid: generatedData.uuid || crypto.randomUUID(),
          caseId: 'Pending Assignment',
          title: title,
          type: type as any,
          description: description,
          collectionDate: new Date().toISOString().split('T')[0],
          collectedBy: 'Current User',
          custodian: custodian || 'Unknown',
          location: 'Evidence Locker / Digital S3',
          admissibility: 'Pending',
          tags: generatedData.tags || [],
          blockchainHash: generatedData.hash,
          chainOfCustody: [{
              id: `cc-${crypto.randomUUID()}`,
              date: new Date().toISOString(),
              action: 'Initial Collection',
              actor: 'Current User',
              notes: 'Intake via Digital Wizard'
          }]
      };
      
      startTransition(() => {
          onComplete(newItem);
      });
  };

  const handleNav = (direction: 'next' | 'back') => {
      startTransition(() => {
          if (direction === 'next') wizard.next();
          else wizard.back();
      });
  };

  return (
      <div className={`max-w-3xl mx-auto py-6 animate-fade-in transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
          <div className="flex items-center mb-6">
              <button onClick={handleBack} className="mr-4 text-slate-500 hover:text-slate-900"><ArrowLeft className="h-6 w-6"/></button>
              <h2 className="text-2xl font-bold text-slate-900">Evidence Intake Wizard</h2>
          </div>
          <Card>
              <div className="space-y-6">
                  <Stepper steps={['Upload & Hash', 'Metadata & Tagging']} currentStep={wizard.currentStep} />

                  {wizard.currentStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        <div 
                            className="border-2 border-dashed border-slate-300 rounded-lg p-10 text-center hover:bg-slate-50 cursor-pointer transition-colors relative overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                            {processing ? (
                                <div className="flex flex-col items-center justify-center text-blue-600">
                                    <Loader2 className="h-10 w-10 animate-spin mb-4"/>
                                    <p className="font-bold text-lg">{processStage}</p>
                                    <p className="text-sm text-slate-400 mt-2">Do not close window</p>
                                </div>
                            ) : file ? (
                                <div className="flex flex-col items-center text-green-600">
                                    <CheckCircle className="h-12 w-12 mb-4"/>
                                    <p className="font-bold text-lg">{file.name}</p>
                                    <p className="text-sm text-slate-500">{DocumentService.formatBytes(file.size)} • processed</p>
                                    <div className="mt-4 flex gap-2">
                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border border-slate-200 font-mono">
                                            <Link className="h-3 w-3 inline mr-1"/>
                                            {generatedData.hash?.substring(0, 12)}...
                                        </span>
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs border border-green-200 font-medium">
                                            <ShieldCheck className="h-3 w-3 inline mr-1"/>
                                            Secured
                                        </span>
                                    </div>
                                    <Button variant="primary" className="mt-6" onClick={(e) => { e.stopPropagation(); handleNav('next'); }}>Continue</Button>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud className="h-12 w-12 text-slate-400 mx-auto mb-4"/>
                                    <p className="text-lg font-medium text-slate-700">Drop files here to upload</p>
                                    <p className="text-sm text-slate-500 mt-2">Supports PDF, DOCX, MSG, JPG (Max 500MB)</p>
                                    <Button variant="secondary" className="mt-6" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Select Files</Button>
                                </>
                            )}
                        </div>
                    </div>
                  )}

                  {wizard.currentStep === 2 && (
                    <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Evidence Title</label>
                        <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="e.g. Hard Drive S/N 12345"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Evidence Type</label>
                        <select 
                            className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="Document">Document</option>
                            <option value="Digital">Digital</option>
                            <option value="Physical">Physical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Lifecycle ID (UUID)</label>
                        <input 
                            type="text" 
                            disabled 
                            className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-md px-3 py-2 font-mono text-xs"
                            value={generatedData.uuid || 'Pending generation...'}
                        />
                      </div>
                      <div className="col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Description & Context</label>
                          <textarea 
                             className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                             rows={4} 
                             value={description}
                             onChange={(e) => setDescription(e.target.value)}
                             placeholder="Describe the item..."
                          ></textarea>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Custodian</label>
                          <input 
                             type="text" 
                             className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                             placeholder="Person/Entity in possession"
                             value={custodian}
                             onChange={(e) => setCustodian(e.target.value)}
                          />
                      </div>
                      <div className="col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Auto-Tags</label>
                          <TagInput 
                            tags={generatedData.tags || []} 
                            onAdd={(t) => setGeneratedData({...generatedData, tags: [...(generatedData.tags || []), t]})}
                            onRemove={(t) => setGeneratedData({...generatedData, tags: generatedData.tags?.filter(tag => tag !== t)})}
                          />
                      </div>
                      <div className="col-span-2 pt-4 flex justify-end gap-3">
                          <Button variant="secondary" onClick={() => handleNav('back')}>Back</Button>
                          <Button variant="primary" disabled={!file || processing} onClick={handleFinish}>Log Item & Print Label</Button>
                      </div>
                    </div>
                  )}
              </div>
          </Card>
      </div>
  );
};
