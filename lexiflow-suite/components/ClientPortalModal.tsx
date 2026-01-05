
import React from 'react';
import { Client } from '../types.ts';
import { X, Lock, FileText } from 'lucide-react';

interface ClientPortalModalProps {
  client: Client;
  onClose: () => void;
}

export const ClientPortalModal: React.FC<ClientPortalModalProps> = ({ client, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-slate-900 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-title"
    >
      <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center text-white space-x-3">
          <Lock className="h-5 w-5 text-emerald-400" />
          <span className="font-bold text-lg" id="portal-title">Secure Client Portal: {client.name}</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close Portal"><X className="h-6 w-6" /></button>
      </div>
      <div className="flex-1 bg-slate-100 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center"><FileText className="h-4 w-4 mr-2 text-blue-500" /> Shared Documents</h3>
            <ul className="space-y-2 text-sm">
              <li className="p-2 bg-slate-50 rounded flex justify-between"><span>Engagement_Letter.pdf</span><span className="text-slate-500">Nov 12</span></li>
              <li className="p-2 bg-slate-50 rounded flex justify-between"><span>Q4_Invoice.pdf</span><span className="text-slate-500">Jan 02</span></li>
              <li className="p-2 bg-slate-50 rounded flex justify-between"><span>Settlement_Offer.pdf</span><span className="text-slate-500">Yesterday</span></li>
            </ul>
            <button className="mt-4 w-full py-2 border border-blue-200 text-blue-600 rounded hover:bg-blue-50 text-sm font-medium">Upload File</button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Messages & Updates</h3>
            <div className="space-y-4">
              <div className="text-sm">
                <p className="font-bold text-slate-900">Case Status Update</p>
                <p className="text-slate-600 mt-1">Discovery phase is 80% complete. We are scheduling depositions for next week.</p>
                <p className="text-xs text-slate-400 mt-1">Sent by Alexandra H. - 2h ago</p>
              </div>
              <div className="text-sm pt-4 border-t">
                <p className="font-bold text-slate-900">Invoice #4022</p>
                <p className="text-slate-600 mt-1">Payment received. Thank you.</p>
                <p className="text-xs text-slate-400 mt-1">System - 1d ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
