
import React from 'react';
import { Card } from '../common/Card.tsx';
import { FileText, User, Mail, Send } from 'lucide-react';
import { Button } from '../common/Button.tsx';

export const SignaturePacket: React.FC = () => {
    return (
        <div className="grid grid-cols-3 gap-6 h-full">
            <div className="col-span-2 bg-slate-100 rounded-lg p-8 overflow-y-auto flex justify-center">
                <div className="bg-white shadow-lg w-[600px] h-[800px] p-12 relative">
                    <h2 className="text-center font-serif text-xl font-bold mb-8">SETTLEMENT AGREEMENT</h2>
                    <p className="text-xs text-justify leading-loose mb-8">
                        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
                    </p>
                    <div className="mt-20 border-t border-black w-64 pt-2">
                        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs p-2 absolute">
                            Sign Here (Client)
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white border-l p-4 flex flex-col">
                <h3 className="font-bold text-lg mb-4">Recipients</h3>
                <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 p-2 border rounded bg-slate-50">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600"><User size={16}/></div>
                        <div className="flex-1">
                            <div className="text-sm font-bold">John Doe</div>
                            <div className="text-xs text-slate-500">Signer (1st)</div>
                        </div>
                        <Mail size={14} className="text-slate-400"/>
                    </div>
                     <div className="flex items-center gap-3 p-2 border rounded bg-slate-50">
                        <div className="bg-slate-200 p-2 rounded-full text-slate-600"><User size={16}/></div>
                        <div className="flex-1">
                            <div className="text-sm font-bold">Jane Smith</div>
                            <div className="text-xs text-slate-500">CC: Only</div>
                        </div>
                    </div>
                </div>
                <Button className="w-full mt-4" icon={Send} variant="primary">Send Envelope</Button>
            </div>
        </div>
    );
};
