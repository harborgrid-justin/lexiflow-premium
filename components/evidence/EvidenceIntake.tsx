import React, { useState, useRef } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ArrowLeft, UploadCloud, CheckCircle, Loader2, Link, ShieldCheck } from 'lucide-react';
import { DocumentService } from '../../services/documentService';
import { EvidenceItem, EvidenceId, CaseId, UUID } from '../../types';
import { Stepper } from '../common/Stepper';
import { useWizard } from '../../hooks/useWizard';
import { useNotify } from '../../hooks/useNotify';
import { TagInput } from '../common/TagInput';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface EvidenceIntakeProps {
  handleBack: () => void;
  onComplete: (item: EvidenceItem) => void;
}

export const EvidenceIntake: React.FC<EvidenceIntakeProps> = ({ handleBack, onComplete }) => {
  const wizard = useWizard(2);
  const notify = useNotify();
  const { theme } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processStage, setProcessStage] = useState('');
  
  const [title, setTitle] = useState('');
  const [custodian, setCustodian] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Document');
  const [generatedData, setGeneratedData] = useState<{hash?: string, uuid?: string, tags?: string[]}>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      setGeneratedData(data);
      setDescription(data.summary);
      setProcessing(false);
      setProcessStage('Complete');
      notify.success("File processed and hashed");
      wizard.next();
    }
  };

  const handleFinish = () => {
      const newItem: EvidenceItem = {
          id: `EV-${Date.now()}` as EvidenceId,
          trackingUuid: (generatedData.uuid || crypto.randomUUID()) as UUID,
          caseId: 'Pending Assignment' as CaseId,
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
              id: `cc-${Date.now()}`,
              date: new Date().toISOString(),
              action: 'Initial Collection',
              actor: 'Current User',
              notes: 'Intake via Digital Wizard'
          }]
      };
      onComplete(newItem);
  };

  return (
      <div className="max-w-3xl mx-auto py-6 animate-fade-in">
          <div className="flex items-center mb-6">
              <button onClick={handleBack} className={cn("mr-4 transition-colors", theme.text.tertiary, `hover:${theme.text.primary}`)}><ArrowLeft className="h-6 w-6"/></button>
              <h2 className={cn("text-2xl font-bold", theme.text.primary)}>Evidence Intake Wizard</h2>
          </div>
          <Card>
              <div className="space-y-6">
                  <Stepper steps={['Upload & Hash', 'Metadata & Tagging']} currentStep={wizard.currentStep} />

                  {wizard.currentStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        <div 
                            className={cn(
                                "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors relative overflow-hidden",
                                theme.border.default,
                                `hover:${theme.surface.highlight}`
                            )}
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
                                    <Button variant="primary" className="mt-6" onClick={(e) => { e.stopPropagation(); wizard.next(); }}>Continue</Button>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud className={cn("h-12 w-12 mx-auto mb-4", theme.text.tertiary)}/>
                                    <p className={cn("text-lg font-medium", theme.text.primary)}>Drop files here to upload</p>
                                    <p className={cn("text-sm mt-2", theme.text.secondary)}>Supports PDF, DOCX, MSG, JPG (Max 500MB)</p>
                                    <Button variant="secondary" className="mt-6" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Select Files</Button>
                                </>
                            )}
                        </div>
                    </div>
                  )}

                  {wizard.currentStep === 2 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                      <div className="sm:col-span-2">
                        <label className={cn("block text-sm font-medium mb-1", theme.text.primary)}>Evidence Title</label>
                        <input 
                            type="text" 
                            className={cn("w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500", theme.border.default, theme.surface.default)} 
                            placeholder="e.g. Hard Drive S/N 12345"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={cn("block text-sm font-medium mb-1", theme.text.primary)}>Evidence Type</label>
                        <select 
                            className={cn("w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500", theme.border.default, theme.surface.default)}
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="Document">Document</option>
                            <option value="Digital">Digital</option>
                            <option value="Physical">Physical</option>
                        </select>
                      </div>
                      <div>
                        <label className={cn("block text-sm font-medium mb-1", theme.text.primary)}>Lifecycle ID (UUID)</label>
                        <input 
                            type="text" 
                            disabled 
                            className={cn("w-full border rounded-md px-3 py-2 font-mono text-xs", theme.border.default, theme.surface.highlight, theme.text.tertiary)}
                            value={generatedData.uuid || 'Pending generation...'}
                        />
                      </div>
                      <div className="sm:col-span-2">
                          <label className={cn("block text-sm font-medium mb-1", theme.text.primary)}>Description & Context</label>
                          <textarea 
                             className={cn("w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500", theme.border.default, theme.surface.default)} 
                             rows={4} 
                             value={description}
                             onChange={(e) => setDescription(e.target.value)}
                             placeholder="Describe the item..."
                          ></textarea>
                      </div>
                      <div className="sm:col-span-2">
                          <label className={cn("block text-sm font-medium mb-1", theme.text.primary)}>Custodian</label>
                          <input 
                             type="text" 
                             className={cn("w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500", theme.border.default, theme.surface.default)} 
                             placeholder="Person/Entity in possession"
                             value={custodian}
                             onChange={(e) => setCustodian(e.target.value)}
                          />
                      </div>
                      <div className="sm:col-span-2">
                          <label className={cn("block text-sm font-medium mb-1", theme.text.primary)}>Auto-Tags</label>
                          <TagInput 
                            tags={generatedData.tags || []} 
                            onAdd={(t) => setGeneratedData({...generatedData, tags: [...(generatedData.tags || []), t]})}
                            onRemove={(t) => setGeneratedData({...generatedData, tags: generatedData.tags?.filter(tag => tag !== t)})}
                          />
                      </div>
                      <div className="sm:col-span-2 pt-4 flex justify-end gap-3">
                          <Button variant="secondary" onClick={wizard.back}>Back</Button>
                          <Button variant="primary" disabled={!file || processing} onClick={handleFinish}>Log Item & Print Label</Button>
                      </div>
                    </div>
                  )}
              </div>
          </Card>
      </div>
  );
};
