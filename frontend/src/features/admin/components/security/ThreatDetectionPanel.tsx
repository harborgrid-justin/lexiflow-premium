import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import type { ThreatCheckResult } from './types';

interface ThreatDetectionPanelProps {
  onCheckIp: (ip: string) => ThreatCheckResult;
  ipWhitelist: string[];
}

export const ThreatDetectionPanel: React.FC<ThreatDetectionPanelProps> = ({ onCheckIp, ipWhitelist }) => {
  const { theme } = useTheme();
  const [testIp, setTestIp] = useState('');
  const [checkResult, setCheckResult] = useState<ThreatCheckResult | null>(null);

  const handleCheck = () => {
    if (!testIp.trim()) return;
    const result = onCheckIp(testIp);
    setCheckResult(result);
  };

  const resultConfig = {
    safe: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    blocked: { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    whitelisted: { icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' }
  };

  return (
    <Card title="Threat Detection">
      <div className="space-y-4">
        <div>
          <p className={cn("text-sm mb-3", theme.text.secondary)}>
            Test IP addresses against the Bloom Filter blacklist and whitelist.
          </p>
          <div className="flex gap-2">
            <Input
              value={testIp}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestIp(e.target.value)}
              placeholder="Enter IP address (e.g., 192.168.1.1)"
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            />
            <Button onClick={handleCheck}>Check IP</Button>
          </div>
        </div>

        {checkResult && (
          <div className={cn("p-4 rounded-lg flex items-start gap-3", resultConfig[checkResult.status].bg)}>
            {React.createElement(resultConfig[checkResult.status].icon, {
              className: cn("h-5 w-5 flex-shrink-0 mt-0.5", resultConfig[checkResult.status].color)
            })}
            <div>
              <p className={cn("font-medium text-sm mb-1", resultConfig[checkResult.status].color)}>
                {checkResult.status.toUpperCase()}
              </p>
              <p className={cn("text-sm", theme.text.secondary)}>{checkResult.message}</p>
            </div>
          </div>
        )}

        <div>
          <h4 className={cn("font-medium text-sm mb-2", theme.text.primary)}>
            IP Whitelist ({ipWhitelist.length} ranges)
          </h4>
          <div className="flex flex-wrap gap-2">
            {ipWhitelist.map((ip, idx) => (
              <span
                key={idx}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-mono",
                  theme.surface.highlight,
                  theme.text.primary
                )}
              >
                {ip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
