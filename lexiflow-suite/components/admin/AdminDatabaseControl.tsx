
import React, { useState, useTransition } from 'react';
import { Database, Server, CheckCircle, RefreshCw, AlertTriangle, Download, Copy } from 'lucide-react';
import { SchemaGenerator } from '../../services/schemaGenerator.ts';
import { Button } from '../common/Button.tsx';
import { Card } from '../common/Card.tsx';
import { CopyButton } from '../common/CopyButton.tsx';

export const AdminDatabaseControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'status' | 'schema' | 'migration'>('status');
  const [ddl, setDdl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [dbStatus, setDbStatus] = useState<'Mock' | 'Connected'>('Mock');
  
  // Guideline 3: Transition for tab switching
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab: 'status' | 'schema' | 'migration') => {
      startTransition(() => {
          setActiveTab(tab);
      });
  };

  const handleGenerateSchema = () => {
    const schema = SchemaGenerator.generateDDL();
    setDdl(schema);
  };

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setDbStatus('Connected');
      alert("Simulated connection to PostgreSQL successful. Data layer is now ready to swap.");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${dbStatus === 'Mock' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
            <Database className="h-6 w-6"/>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Data Persistence Layer</h3>
            <p className="text-sm text-slate-500">Current Mode: <span className={`font-bold ${dbStatus === 'Mock' ? 'text-amber-600' : 'text-green-600'}`}>{dbStatus} Data</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          {dbStatus === 'Mock' ? (
            <Button variant="primary" onClick={handleConnect} isLoading={isConnecting} icon={Server}>
              Connect PostgreSQL
            </Button>
          ) : (
            <Button variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 mr-2"/> Online
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button 
          onClick={() => handleTabChange('status')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'status' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Connection Health
        </button>
        <button 
          onClick={() => { handleTabChange('schema'); handleGenerateSchema(); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'schema' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Schema Builder (DDL)
        </button>
        <button 
          onClick={() => handleTabChange('migration')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'migration' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Migration Tools
        </button>
      </div>

      <div className={`flex-1 overflow-hidden transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {activeTab === 'status' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Configuration">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="font-semibold text-slate-500">Driver</div>
                  <div className="col-span-2 font-mono bg-slate-50 p-1 rounded">pg (node-postgres)</div>
                  
                  <div className="font-semibold text-slate-500">Host</div>
                  <div className="col-span-2 font-mono bg-slate-50 p-1 rounded">db.lexiflow-internal.com</div>
                  
                  <div className="font-semibold text-slate-500">Port</div>
                  <div className="col-span-2 font-mono bg-slate-50 p-1 rounded">5432</div>
                  
                  <div className="font-semibold text-slate-500">SSL</div>
                  <div className="col-span-2 font-mono bg-slate-50 p-1 rounded">true (ca-cert-v2)</div>
                </div>
              </div>
            </Card>
            <Card title="Performance Metrics">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-sm text-slate-600">Query Latency (Avg)</span>
                  <span className="font-mono font-bold text-green-600">12ms</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-sm text-slate-600">Active Connections</span>
                  <span className="font-mono font-bold text-blue-600">4 / 20</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-sm text-slate-600">Uptime</span>
                  <span className="font-mono font-bold text-slate-800">99.98%</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="h-full flex flex-col">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-slate-500">
                This SQL is automatically generated from the TypeScript <code>types.ts</code> definitions. 
                Run this to initialize a fresh Postgres instance.
              </p>
              <div className="flex gap-2">
                <CopyButton text={ddl} />
                <Button variant="secondary" size="sm" icon={Download}>Export .sql</Button>
                <Button variant="primary" size="sm" icon={RefreshCw} onClick={handleGenerateSchema}>Regenerate</Button>
              </div>
            </div>
            <div className="flex-1 bg-slate-900 rounded-lg p-4 overflow-auto border border-slate-700 shadow-inner">
              <pre className="text-xs md:text-sm font-mono text-green-400 whitespace-pre-wrap">
                {ddl || '// Click Regenerate to build schema...'}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'migration' && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <AlertTriangle className="h-12 w-12 mb-3 opacity-50"/>
            <h3 className="font-bold text-lg text-slate-600">Migration Safety Check</h3>
            <p className="max-w-md text-center text-sm mb-6">
              Moving from Mock Data to Production DB requires a full data sync. 
              Ensure all current in-memory changes are exported before proceeding.
            </p>
            <Button variant="danger" icon={RefreshCw}>Start Data Migration Wizard</Button>
          </div>
        )}
      </div>
    </div>
  );
};
