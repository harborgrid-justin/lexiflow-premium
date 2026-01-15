import { Tabs } from "@/components/molecules/Tabs/Tabs";

interface LedgerTabsProps {
  activeTab: 'operating' | 'trust';
  onTabChange: (tab: 'operating' | 'trust') => void;
}

export function LedgerTabs({ activeTab, onTabChange }: LedgerTabsProps) {
  return (
    <Tabs
      tabs={[
        { id: 'operating', label: 'Operating' },
        { id: 'trust', label: 'Trust' }
      ]}
      activeTab={activeTab}
      onChange={(tab) => onTabChange(tab as 'operating' | 'trust')}
    />
  );
}
