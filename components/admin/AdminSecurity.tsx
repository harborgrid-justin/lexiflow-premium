
import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Lock, Shield, Smartphone, Globe, Eye, FileText, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';

export const AdminSecurity: React.FC = () => {
  const { theme } = useTheme();
  
  const { data: controls = [] } = useQuery<any[]>(
      ['admin', 'security'],
      DataService.admin.getSecuritySettings
  );

  const getIcon = (type: string) => {
      switch(type) {
          case 'Smartphone': return Smartphone;
          case 'Lock': return Lock;
          case 'Globe': return Globe;
          case 'Clock': return Clock;
          default: return Shield;
      }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Authentication Policy">
                <div className={cn("divide-y", theme.border.light)}>
                    {controls.map((ctrl) => {
                        const Icon = getIcon(ctrl.type);
                        return (
                            <div key={ctrl.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                <div className="flex items-start gap-3">
                                    <div className={cn("p-2 rounded-lg", theme.surfaceHighlight)}>
                                        <Icon className={cn("h-5 w-5", theme.text.secondary)}/>
                                    </div>
                                    <div>
                                        <p className={cn("text-sm font-bold", theme.text.primary)}>{ctrl.label}</p>
                                        <p className={cn("text-xs", theme.text.secondary)}>{ctrl.desc}</p>
                                    </div>
                                </div>
                                <div className={cn("relative w-11 h-6 rounded-full transition-colors cursor-pointer", ctrl.enabled ? "bg-green-500" : "bg-slate-300")}>
                                    <div className={cn("absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform", ctrl.enabled ? "translate-x-5" : "translate-x-0")}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <div className="space-y-6">
                <Card title="Data Loss Prevention (DLP)">
                    <div className="space-y-4">
                        <div className={cn("p-4 rounded-lg border", theme.status.warning.bg, theme.status.warning.border)}>
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className={cn("h-5 w-5", theme.status.warning.text)}/>
                                <h4 className={cn("font-bold text-sm", theme.status.warning.text)}>Strict Mode Active</h4>
                            </div>
                            <p className={cn("text-xs", theme.status.warning.text)}>Downloads of documents tagged "Confidential" are blocked on mobile devices.</p>
                        </div>
                        
                        <div className="space-y-2">
                            <div className={cn("flex justify-between items-center text-sm p-2 rounded", theme.surfaceHighlight)}>
                                <span className={theme.text.secondary}>PII Detection</span>
                                <span className="text-green-600 font-bold text-xs">Enabled</span>
                            </div>
                            <div className={cn("flex justify-between items-center text-sm p-2 rounded", theme.surfaceHighlight)}>
                                <span className={theme.text.secondary}>Watermarking</span>
                                <span className="text-green-600 font-bold text-xs">Dynamic</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Access Logs">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className={theme.text.secondary}>Failed Logins (24h)</span>
                            <span className={cn("font-mono font-bold", theme.text.primary)}>12</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className={theme.text.secondary}>Suspicious IPs</span>
                            <span className={cn("font-mono font-bold", theme.text.primary)}>0</span>
                        </div>
                        <div className="pt-2 border-t border-slate-100">
                            <Button variant="ghost" size="sm" className="w-full text-blue-600" icon={FileText}>View Security Audit</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    </div>
  );
};
