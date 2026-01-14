import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/molecules/Tabs/Tabs";

interface LedgerTabsProps {
  activeTab: 'operating' | 'trust';
  onTabChange: (tab: 'operating' | 'trust') => void;
}

export function LedgerTabs({ activeTab, onTabChange }: LedgerTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(val) => onTabChange(val as 'operating' | 'trust')}>
      <TabsList>
        <TabsTrigger value="operating">Operating</TabsTrigger>
        <TabsTrigger value="trust">Trust</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
