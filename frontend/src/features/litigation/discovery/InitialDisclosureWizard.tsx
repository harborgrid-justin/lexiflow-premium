
import React, { useState } from 'react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Stepper } from '../../common/Stepper';
import { Input, TextArea } from '../../common/Inputs';
import { Users, FileText, Calculator, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '@/utils/cn';
import { useNotify } from '@/hooks/useNotify';
import { useWizard } from '@/hooks/useWizard';
import { InitialDisclosureWizardProps } from './types';

export const InitialDisclosureWizard: React.FC<InitialDisclosureWizardProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const wizard = useWizard(4);

  // Form State
  const [individuals, setIndividuals] = useState([{ name: '', contact: '', subject: '' }]);
  const [documents, setDocuments] = useState([{ description: '', location: '' }]);
  const [damages, setDamages] = useState([{ category: '', amount: '', computation: '' }]);
  const [insurance, setInsurance] = useState([{ carrier: '', policyNum: '', coverage: '' }]);

  // Handlers
  const addIndividual = () => setIndividuals([...individuals, { name: '', contact: '', subject: '' }]);
  const addDocument = () => setDocuments([...documents, { description: '', location: '' }]);
  const addDamage = () => setDamages([...damages, { category: '', amount: '', computation: '' }]);
  const addInsurance = () => setInsurance([...insurance, { carrier: '', policyNum: '', coverage: '' }]);

  const handleFinish = () => {
    // In a real app, this would generate a PDF or save to the database
    notify.success("Initial Disclosures generated and saved to case file.");
    onComplete();
  };

  const updateItem = (setter: unknown, list: unknown[], index: number, field: string, value: string) => {
      const newList = [...list];
      const currentItem = newList[index];
      newList[index] = currentItem && typeof currentItem === 'object' ? { ...currentItem, [field]: value } : { [field]: value };
      setter(newList);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
       <div className={cn("p-6 rounded-lg border mb-6 text-center", theme.surface.default, theme.border.default)}>
          <h2 className={cn("text-2xl font-bold mb-2", theme.text.primary)}>FRCP Rule 26(a)(1) Initial Disclosures</h2>
          <p className={cn("text-sm", theme.text.secondary)}>Mandatory exchange of information without awaiting a discovery request.</p>
       </div>

       <Stepper 
          steps={['Individuals (i)', 'Documents (ii)', 'Damages (iii)', 'Insurance (iv)']} 
          currentStep={wizard.currentStep} 
          className="mb-8"
       />

       <Card className="flex-1 overflow-visible">
          {/* Step 1: Individuals */}
          {wizard.currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn("p-2 rounded text-blue-700 bg-blue-50 border border-blue-100")}><Users className="h-6 w-6"/></div>
                    <div>
                        <h3 className={cn("font-bold text-lg", theme.text.primary)}>Individuals Likely to Have Discoverable Info</h3>
                        <p className={cn("text-xs", theme.text.secondary)}>Rule 26(a)(1)(A)(i)</p>
                    </div>
                </div>
                
                {individuals.map((ind, idx) => (
                    <div key={idx} className={cn("p-4 border rounded-lg space-y-3 relative", theme.border.default)}>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Name" value={ind.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(setIndividuals, individuals, idx, 'name', e.target.value)} placeholder="e.g. John Smith" />
                            <Input label="Contact Info" value={ind.contact} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(setIndividuals, individuals, idx, 'contact', e.target.value)} placeholder="Phone or Address" />
                        </div>
                        <Input label="Subject of Information" value={ind.subject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(setIndividuals, individuals, idx, 'subject', e.target.value)} placeholder="e.g. Witnessed the accident" />
                    </div>
                ))}
                <Button variant="secondary" onClick={addIndividual} className="w-full">Add Another Individual</Button>
            </div>
          )}

          {/* Step 2: Documents */}
          {wizard.currentStep === 2 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn("p-2 rounded text-purple-700 bg-purple-50 border border-purple-100")}><FileText className="h-6 w-6"/></div>
                    <div>
                        <h3 className={cn("font-bold text-lg", theme.text.primary)}>Documents & ESI</h3>
                        <p className={cn("text-xs", theme.text.secondary)}>Rule 26(a)(1)(A)(ii)</p>
                    </div>
                </div>
                 
                {documents.map((doc, idx) => (
                    <div key={idx} className={cn("p-4 border rounded-lg space-y-3", theme.border.default)}>
                        <Input label="Description / Category" value={doc.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(setDocuments, documents, idx, 'description', e.target.value)} placeholder="e.g. Emails regarding contract negotiation" />
                        <Input label="Location" value={doc.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(setDocuments, documents, idx, 'location', e.target.value)} placeholder="e.g. Corporate Exchange Server" />
                    </div>
                ))}
                <Button variant="secondary" onClick={addDocument} className="w-full">Add Document Category</Button>
             </div>
          )}

          {/* Step 3: Damages */}
          {wizard.currentStep === 3 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn("p-2 rounded text-green-700 bg-green-50 border border-green-100")}><Calculator className="h-6 w-6"/></div>
                    <div>
                        <h3 className={cn("font-bold text-lg", theme.text.primary)}>Computation of Damages</h3>
                        <p className={cn("text-xs", theme.text.secondary)}>Rule 26(a)(1)(A)(iii)</p>
                    </div>
                </div>
                 
                {damages.map((dmg, idx) => (
                    <div key={idx} className={cn("p-4 border rounded-lg space-y-3", theme.border.default)}>
                        <div className="grid grid-cols-2 gap-4">
                             <Input label="Category" value={dmg.category} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(setDamages, damages, idx, 'category', e.target.value)} placeholder="e.g. Lost Profits" />
                             <Input label="Claimed Amount" value={dmg.amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(setDamages, damages, idx, 'amount', e.target.value)} placeholder="$0.00" />
                        </div>
                        <TextArea label="Basis of Computation" value={dmg.computation} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateItem(setDamages, damages, idx, 'computation', e.target.value)} rows={2} />
                    </div>
                ))}
                <Button variant="secondary" onClick={addDamage} className="w-full">Add Damage Category</Button>
             </div>
          )}

          {/* Step 4: Insurance */}
          {wizard.currentStep === 4 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn("p-2 rounded text-amber-700 bg-amber-50 border border-amber-100")}><ShieldCheck className="h-6 w-6"/></div>
                    <div>
                        <h3 className={cn("font-bold text-lg", theme.text.primary)}>Insurance Agreements</h3>
                        <p className={cn("text-xs", theme.text.secondary)}>Rule 26(a)(1)(A)(iv)</p>
                    </div>
                </div>
                 
                {insurance.map((ins, idx) => (
                    <div key={idx} className={cn("p-4 border rounded-lg space-y-3", theme.border.default)}>
                         <Input label="Insurance Carrier" value={ins.carrier} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(setInsurance, insurance, idx, 'carrier', e.target.value)} />
                         <div className="grid grid-cols-2 gap-4">
                             <Input label="Policy Number" value={ins.policyNum} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(setInsurance, insurance, idx, 'policyNum', e.target.value)} />
                             <Input label="Coverage Limit" value={ins.coverage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(setInsurance, insurance, idx, 'coverage', e.target.value)} />
                        </div>
                    </div>
                ))}
                <Button variant="secondary" onClick={addInsurance} className="w-full">Add Insurance Policy</Button>
             </div>
          )}
       </Card>

       <div className={cn("mt-6 flex justify-between pt-4 border-t", theme.border.default)}>
           <Button variant="ghost" onClick={wizard.back} disabled={wizard.isFirst}>Back</Button>
           <Button variant="primary" onClick={wizard.isLast ? handleFinish : wizard.next}>
               {wizard.isLast ? 'Generate Disclosure' : 'Next Step'}
           </Button>
       </div>
    </div>
  );
};

export default InitialDisclosureWizard;
