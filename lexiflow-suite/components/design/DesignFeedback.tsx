
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

export const DesignFeedback = () => {
  const [progress, setProgress] = useState(45);

  useEffect(() => {
    const timer = setInterval(() => setProgress(p => (p >= 100 ? 0 : p + 10)), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
        <SectionHeading title="Feedback & States" icon={AlertTriangle} count="FB-01 to FB-46" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DemoContainer>
                <ComponentLabel id="FB-01" name="Alert Info" />
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start gap-3 relative shadow-sm">
                    <Info size={16} className="text-blue-600 mt-0.5 shrink-0"/>
                    <div className="flex-1">
                        <h5 className="text-xs font-bold text-blue-900 mb-0.5">System Update</h5>
                        <span className="text-[10px] text-blue-800 leading-tight block">Maintenance scheduled for 2AM EST.</span>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="FB-02" name="Alert Success" />
                <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 flex items-start gap-3 shadow-sm">
                    <CheckCircle size={16} className="text-emerald-600 mt-0.5 shrink-0"/>
                    <div className="flex-1">
                        <span className="text-xs font-bold text-emerald-900 block">Changes Saved</span>
                        <span className="text-[10px] text-emerald-800">Your profile has been updated.</span>
                    </div>
                </div>
            </DemoContainer>
            
            <DemoContainer>
                <ComponentLabel id="FB-03" name="Alert Warning" />
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-3 shadow-sm">
                    <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0"/>
                    <div className="flex-1">
                        <span className="text-xs font-bold text-amber-900 block">Verification Needed</span>
                        <span className="text-[10px] text-amber-800">Please confirm your email address.</span>
                    </div>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="FB-05" name="Spinner" />
                <div className="flex justify-center py-4 bg-slate-50 rounded border border-slate-100">
                    <Loader2 className="animate-spin text-blue-600 h-8 w-8"/>
                </div>
            </DemoContainer>

            <DemoContainer>
                <ComponentLabel id="FB-08" name="Progress Bar" />
                <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                        <div className="bg-blue-600 h-full transition-all duration-300 rounded-full relative overflow-hidden" style={{ width: `${progress}%` }}>
                        </div>
                    </div>
                </div>
            </DemoContainer>
        </div>
    </div>
  );
};
