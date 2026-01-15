/**
 * @file ApprovalChainsPanel.tsx
 * @description Multi-level approval chains configuration
 */

import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/molecules/Card/Card';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { Settings, UserCheck } from 'lucide-react';
interface ApprovalChainsPanelProps {
  onAddApprovalChain: () => void;
}

export function ApprovalChainsPanel({
  onAddApprovalChain,
}: ApprovalChainsPanelProps) {
  const { theme } = useTheme();

  return (
    <Card title="Multi-Level Approval Chains">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className={cn("text-sm", theme.text.secondary)}>
            Hierarchical approval workflows with delegation support
          </p>
          <Button icon={UserCheck} onClick={onAddApprovalChain}>
            Add Level
          </Button>
        </div>

        <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-blue-500" />
            <span className={cn("text-sm font-semibold", theme.text.primary)}>
              Configuration
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className={cn(theme.text.tertiary)}>Sequential Approvals:</p>
              <p className={cn("font-medium", theme.text.primary)}>Enabled</p>
            </div>
            <div>
              <p className={cn(theme.text.tertiary)}>Timeout Action:</p>
              <p className={cn("font-medium", theme.text.primary)}>Escalate</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

ApprovalChainsPanel.displayName = 'ApprovalChainsPanel';
