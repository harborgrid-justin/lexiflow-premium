
import React, { useState, useEffect, useRef } from 'react';
import { Plus, FileText } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Modal } from '../../common/Modal';
import { Input } from '../../common/Inputs';
import { Tabs } from '../../common/Tabs';
import { Button } from '../../common/Button';
import { AccessGovernance } from './governance/AccessGovernance';
import { ModalFooter } from '../../common/RefactoredCommon';
import { GovernanceDashboard } from './governance/GovernanceDashboard';
import { DataService } from '../../../services/data/dataService';
import { useQuery } from '../../../hooks/useQueryHooks';
import { GovernanceRule, GovernancePolicy } from '../../../types';

interface GovernanceConsoleProps {
    initialTab?: string;
}

export const GovernanceConsole: React.FC<GovernanceConsoleProps> = ({ initialTab = 'overview' }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [editingRule, setEditingRule] = useState<GovernanceRule | null>(null);
  
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Data Fetching
  const { data: rules = [] } = useQuery<GovernanceRule[]>(
      ['admin', 'governance_rules'],
      DataService.admin.getGovernanceRules
  );

  const { data: policies = [] } = useQuery<GovernancePolicy[]>(
      ['admin', 'governance_policies'],
      DataService.admin.getGovernancePolicies
  );

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
      return () => {
          if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      }
  }, []);

  const handleScan = () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      setIsScanning(true);
      setScanProgress(0);
      scanIntervalRef.current = setInterval(() => {
          setScanProgress(p => {
              if (p >= 100) {
                  if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
                  setIsScanning(false);
                  return 100;
              }
              return p + 10;
          });
      }, 200);
  };

  return (
    <div className="flex flex-col h-full">
        <div className={cn("px-6 pt-6 border-b", theme.border.default)}>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className={cn("text-xl font-bold", theme.text.primary)}>Governance & Compliance</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Policy enforcement and risk mitigation.</p>
                </div>
            </div>
            <Tabs 
                tabs={['overview', 'policies', 'access']}
                activeTab={activeTab}
                onChange={(t) => setActiveTab(t as any)}
            />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'overview' && (
                <GovernanceDashboard 
                    rules={rules} 
                    isScanning={isScanning} 
                    scanProgress={scanProgress} 
                    handleScan={handleScan} 
                    setEditingRule={setEditingRule} 
                />
            )}

            {activeTab === 'policies' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className={cn("text-lg font-bold", theme.text.primary)}>Internal Policies</h3>
                        <Button icon={Plus}>Draft Policy</Button>
                    </div>
                    <div className="space-y-3">
                        {policies.map(pol => (
                            <div key={pol.id} className={cn("flex items-center justify-between p-4 border rounded-lg shadow-sm transition-all hover:shadow-md", theme.surface.default, theme.border.default)}>
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-2 rounded-lg", theme.surface.highlight, theme.text.secondary)}><FileText className="h-6 w-6"/></div>
                                    <div>
                                        <h4 className={cn("font-bold text-sm", theme.text.primary)}>{pol.title}</h4>
                                        <p className={cn("text-xs", theme.text.secondary)}>Version {pol.version} • Updated {pol.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={cn("text-xs font-bold px-2 py-1 rounded border", pol.status === 'Active' ? cn(theme.status.success.bg, theme.status.success.text, theme.status.success.border) : cn(theme.status.warning.bg, theme.status.warning.text, theme.status.warning.border))}>{pol.status}</span>
                                    <Button size="sm" variant="ghost">View</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'access' && (
                <AccessGovernance />
            )}
        </div>

        {/* Rule Modal */}
        {editingRule && (
            <Modal isOpen={true} onClose={() => setEditingRule(null)} title="Edit Rule">
                <div className="p-6 space-y-4">
                    <Input label="Rule Name" value={editingRule.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingRule({...editingRule, name: e.target.value})}/>
                    <ModalFooter>
                         <Button variant="secondary" onClick={() => setEditingRule(null)}>Cancel</Button>
                         <Button variant="primary" onClick={() => setEditingRule(null)}>Save</Button>
                    </ModalFooter>
                </div>
            </Modal>
        )}
    </div>
  );
};

export default GovernanceConsole;
