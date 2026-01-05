
import React, { useState, useTransition } from 'react';
import { PageHeader } from './common/PageHeader.tsx';
import { TabNavigation } from './common/TabNavigation.tsx';
import { HRManager } from './practice/HRManager.tsx';
import { FinancialCenter } from './practice/FinancialCenter.tsx';
import { MarketingDashboard } from './practice/MarketingDashboard.tsx';
import { Users, DollarSign, Megaphone, Laptop, FileText, Settings } from 'lucide-react';
import { Button } from './common/Button.tsx';
import { PageContainer } from './layout/PageContainer.tsx';
import { EmptyState } from './common/EmptyState.tsx';

export const FirmOperations: React.FC = () => {
  const [activeTab, setActiveTab] = useState('hr');
  // Guideline 3: Use transition for tab switching
  const [isPending, startTransition] = useTransition();

  const tabs = [
    { id: 'hr', label: 'HR & Staffing', icon: Users },
    { id: 'finance', label: 'Financial Center', icon: DollarSign },
    { id: 'marketing', label: 'Marketing & Intake', icon: Megaphone },
    { id: 'assets', label: 'Assets & Inventory', icon: Laptop },
  ];

  const handleTabChange = (tabId: string) => {
      startTransition(() => {
          setActiveTab(tabId);
      });
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
        <div className="px-6 pt-6 pb-2 shrink-0">
            <PageHeader 
                title="Firm Operations" 
                subtitle="Practice Management: Staff, Finances, and Business Growth."
                actions={
                <div className="flex gap-2">
                    <Button variant="secondary" icon={Settings}>Settings</Button>
                    <Button variant="primary" icon={FileText}>Generate P&L</Button>
                </div>
                }
            />

            <TabNavigation 
                tabs={tabs} 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
                className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm"
            />
        </div>

        <div className={`flex-1 overflow-y-auto min-h-0 p-6 pt-4 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
            <div className="max-w-7xl mx-auto h-full">
                {activeTab === 'hr' && <HRManager />}
                {activeTab === 'finance' && <FinancialCenter />}
                {activeTab === 'marketing' && <MarketingDashboard />}
                {activeTab === 'assets' && (
                <div className="h-full flex flex-col justify-center">
                    <EmptyState 
                        icon={Laptop}
                        title="Asset Management"
                        description="Track laptops, software licenses, and office inventory in one place. Connect your IT assets database to get started."
                        action={<Button variant="primary" icon={Laptop}>Import Asset List</Button>}
                        className="bg-white border border-slate-200 rounded-xl shadow-sm p-12"
                    />
                </div>
                )}
            </div>
        </div>
    </div>
  );
};
