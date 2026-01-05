
import React from 'react';
import { Card } from '../common/Card.tsx';
import { ShieldCheck, Printer, Download } from 'lucide-react';
import { Button } from '../common/Button.tsx';

export const ConflictReport: React.FC = () => {
    return (
        <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-sm p-8 min-h-[800px]">
            <div className="flex justify-between items-start mb-8 border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Conflict of Interest Report</h1>
                    <p className="text-sm text-slate-500">Generated: Oct 24, 2023</p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" icon={Printer}>Print</Button>
                    <Button size="sm" variant="outline" icon={Download}>PDF</Button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-4">
                    <ShieldCheck size={32} className="text-green-600"/>
                    <div>
                        <h3 className="font-bold text-green-900">Status: CLEARED</h3>
                        <p className="text-sm text-green-800">No direct conflicts found for entity "TechCorp Industries".</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-sm uppercase text-slate-500 border-b mb-2">Search Parameters</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-bold">Entity:</span> TechCorp Industries</div>
                        <div><span className="font-bold">Related Parties:</span> John Smith, Jane Doe</div>
                        <div><span className="font-bold">Jurisdiction:</span> CA, NY, DE</div>
                        <div><span className="font-bold">Lookback:</span> 7 Years</div>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-sm uppercase text-slate-500 border-b mb-2">Potential Hits (Reviewed)</h4>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left bg-slate-50"><th className="p-2">Entity</th><th className="p-2">Matter</th><th className="p-2">Relationship</th><th className="p-2">Disposition</th></tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="p-2">TechCorp Logistics</td>
                                <td className="p-2">2019-004 (Closed)</td>
                                <td className="p-2">Subsidiary</td>
                                <td className="p-2 text-green-600 font-bold">Waived</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                 <div className="mt-12 pt-8 border-t border-slate-200">
                    <p className="text-xs text-slate-400 text-center">
                        This report is confidential attorney work product. 
                        Certified by System Administrator.
                    </p>
                </div>
            </div>
        </div>
    );
};
