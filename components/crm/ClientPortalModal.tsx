
import React, { useState, Suspense, lazy } from 'react';
import { Client } from '../../types';
import { X, Lock, FileText, MessageSquare, UploadCloud, Bell, Activity, Shield } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Button } from '../common/Button';
import { Tabs } from '../common/Tabs';
import { LazyLoader } from '../common/LazyLoader'; // Import LazyLoader

// Lazy load dedicated components for each tab
const ClientPortalDocuments = lazy(() => import('./client-portal/ClientPortalDocuments').then(m => ({ default: m.ClientPortalDocuments })));
const ClientPortalMessages = lazy(() => import('./client-portal/ClientPortalMessages').then(m => ({ default: m.ClientPortalMessages })));
const ClientPortalSecurity = lazy(() => import('./client-portal/ClientPortalSecurity').then(m => ({ default: m.ClientPortalSecurity })));
const ClientPortalActivity = lazy(() => import('./client-portal/ClientPortalActivity').then(m => ({ default: m.ClientPortalActivity })));


interface ClientPortalModalProps {
  client: Client;
  onClose: () => void;
}

export const ClientPortalModal: React.FC<ClientPortalModalProps> = ({ client, onClose }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('documents');

  const renderContent = () => {
      return (
          <Suspense fallback={<LazyLoader message={`Loading ${activeTab} data...`} />}>
              {activeTab === 'documents' && <ClientPortalDocuments />}
              {activeTab === 'messages' && <ClientPortalMessages />}
              {activeTab === 'security' && <ClientPortalSecurity />}
              {activeTab === 'activity' && <ClientPortalActivity />}
          </Suspense>
      );
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
