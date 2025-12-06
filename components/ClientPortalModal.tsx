import React, { useState } from 'react';
import { Client } from '../types';
import { X, Lock, FileText, MessageSquare, UploadCloud, Bell, Activity, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { Button } from './common/Button';
import { Tabs } from './common/Tabs';

interface ClientPortalModalProps {
  client: Client;
  onClose: () => void;
}

export const ClientPortalModal: React.FC<ClientPortalModalProps> = ({ client, onClose }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('documents');

  const renderContent = () => {
      if (activeTab === 'documents') {
          return (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" /> Shared Documents
                    </h3>
                    <span className="text-xs font-medium text-slate-500 bg-white border px-2 py-1 rounded">3 Files</span>
                </div>
                <div className="p-5 space-y-3 flex-1">
                    {[
                        { name: 'Engagement_Letter.pdf', date: 'Nov 12, 2023', size: '1.2 MB' },
                        { name: 'Q4_Invoice_4022.pdf', date: 'Jan 02, 2024', size: '0.5 MB' },
                        { name: 'Settlement_Offer_v2.pdf', date: 'Yesterday', size: '2.4 MB' }
                    ].map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded border border-slate-200 text-red-500">
                                    <FileText className="h-5 w-5"/>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">{doc.name}</p>
                                    <p className="text-xs text-slate-500">{doc.date} • {doc.size}</p>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100">Download</Button>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                    <button className="text-sm text-blue-600 font-medium hover:underline">View All Documents</button>
                </div>
            </div>
          );
      }

      if (activeTab === 'messages') {
          return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" /> Secure Messages
                    </h3>
                    <Bell className="h-5 w-5 text-slate-400"/>
                </div>
                <div className="p-5 space-y-4 flex-1">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">AH</div>
                        <div className="bg-slate-50 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-slate-100 text-sm text-slate-700">
                            <p className="font-bold text-xs text-slate-900 mb-1">Alexandra H. (Attorney)</p>
                            <p>Discovery phase is 80% complete. We are scheduling depositions for next week. Please review the attached schedule.</p>
                            <p className="text-[10px] text-slate-400 mt-2 text-right">2 hours ago</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs shrink-0">ME</div>
                        <div className="bg-blue-50 p-3 rounded-tl-xl rounded-bl-xl rounded-br-xl border border-blue-100 text-sm text-slate-800">
                            <p>Understood. I will be available on Tuesday and Thursday.</p>
                            <p className="text-[10px] text-blue-400 mt-2 text-right">Just now</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-white">
                    <div className="relative">
                        <input className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Type a secure message..." />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 rounded-md text-white hover:bg-indigo-700 transition-colors">
                            <MessageSquare className="h-4 w-4"/>
                        </button>
                    </div>
                </div>
            </div>
          );
      }
      
      if (activeTab === 'security') {
          return (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center"><Shield className="h-5 w-5 mr-2 text-green-600"/> MFA & Security</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                    <span className="font-medium text-sm">Enable Multi-Factor Authentication</span>
                    <div className="h-6 w-11 bg-green-500 rounded-full p-1"><div className="h-4 w-4 bg-white rounded-full shadow transform translate-x-5"></div></div>
                </div>
                <Button variant="outline">Generate Backup Codes</Button>
            </div>
          );
      }
      
      if (activeTab === 'activity') {
          return (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3">
                <h3 className="font-bold text-slate-800 flex items-center"><Activity className="h-5 w-5 mr-2 text-slate-600"/> Activity Log</h3>
                <p className="text-xs text-slate-400">Showing recent activity from your account.</p>
                <div className="border-t pt-3">
                    <p className="text-sm font-mono"><span className="text-slate-400">2024-03-15 10:30:15</span> [LOGIN] Successful login from 192.168.1.1</p>
                    <p className="text-sm font-mono"><span className="text-slate-400">2024-03-15 10:31:02</span> [DOWNLOAD] Engagement_Letter.pdf</p>
                </div>
            </div>
          );
      }

      return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      {/* Dark Header for Portal Context */}
      <div className="bg-slate-950 p-4 flex justify-between items-center border-b border-slate-800 shadow-md">
        <div className="flex items-center text-white space-x-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Lock className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight">Secure Client Portal</h2>
            <p className="text-xs text-slate-400">Viewing as: {client.name}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full">
            <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 bg-slate-50 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Welcome Banner */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Welcome, {client.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">You have 2 new documents and 1 unread message.</p>
                </div>
                <Button variant="primary" icon={UploadCloud}>Secure Upload</Button>
            </div>

            <Tabs
                tabs={[
                    { id: 'documents', label: 'Documents', icon: FileText },
                    { id: 'messages', label: 'Messages', icon: MessageSquare },
                    { id: 'security', label: 'MFA & Security', icon: Shield },
                    { id: 'activity', label: 'Activity Log', icon: Activity },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
                variant="underline"
            />
            
            <div className="grid grid-cols-1 gap-8">
                {renderContent()}
            </div>
        </div>
      </div>
    </div>
  );
};