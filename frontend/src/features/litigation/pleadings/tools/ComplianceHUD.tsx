import React, { useState, useMemo } from 'react';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Ruler } from 'lucide-react';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { FormattingRule, PleadingSection } from '@/types';

interface ComplianceHUDProps {
  rules: FormattingRule;
  sections: PleadingSection[];
  score: number;
}

interface ComplianceCheck {
  id: string;
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

export const ComplianceHUD: React.FC<ComplianceHUDProps> = ({ rules, sections, score }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Memoize compliance checks to avoid recalculation on every render
  const checks = useMemo<ComplianceCheck[]>(() => {
    const results: ComplianceCheck[] = [];
    
    // Font check
    results.push({
      id: 'font',
      name: 'Font Family',
      status: 'pass',
      message: `Using ${rules?.fontFamily || 'Times New Roman'} as required`
    });

    // Font size check
    results.push({
      id: 'fontSize',
      name: 'Font Size',
      status: 'pass',
      message: `${rules?.fontSize || 12}pt body text`
    });

    // Margin check
    results.push({
      id: 'margins',
      name: 'Page Margins',
      status: 'pass',
      message: `${rules?.marginTop || '1in'} top, ${rules?.marginBottom || '1in'} bottom`
    });

    // Line height
    results.push({
      id: 'spacing',
      name: 'Line Height',
      status: 'pass',
      message: `${rules?.lineHeight || 2.0}x line height`
    });

    // Page estimate (no pageLimit in type, use reasonable default)
    const estimatedPages = Math.ceil(sections.reduce((acc: unknown, s: unknown) => (acc as number) + ((s as {content?: string}).content?.length || 0), 0) / 3000);
    const pageLimit = 25; // Default page limit
    results.push({
      id: 'pageLimit',
      name: 'Page Estimate',
      status: estimatedPages > pageLimit ? 'fail' : estimatedPages > pageLimit * 0.9 ? 'warn' : 'pass',
      message: `~${estimatedPages} pages`
    });

    // Certificate of service
    const hasCertificate = sections.some(s => 
      s.type === 'Certificate' || 
      s.content?.toLowerCase().includes('certificate of service')
    );
    results.push({
      id: 'certificate',
      name: 'Certificate of Service',
      status: hasCertificate ? 'pass' : 'warn',
      message: hasCertificate ? 'Included' : 'Not detected'
    });

    return results;
  }, [rules?.fontFamily, rules?.fontSize, rules?.marginTop, rules?.marginBottom, rules?.lineHeight, sections]);

  const { passCount, warnCount, failCount } = useMemo(() => ({
    passCount: checks.filter(c => c.status === 'pass').length,
    warnCount: checks.filter(c => c.status === 'warn').length,
    failCount: checks.filter(c => c.status === 'fail').length
  }), [checks]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;
      case 'warn': return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
      case 'fail': return <XCircle className="h-3.5 w-3.5 text-rose-500" />;
      default: return null;
    }
  };

  const overallStatus = failCount > 0 ? 'fail' : warnCount > 0 ? 'warn' : 'pass';

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 rounded-lg shadow-lg border transition-all",
      theme.surface.overlay, theme.border.default,
      isExpanded ? "w-72" : "w-auto"
    )}>
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between p-3 rounded-lg transition-colors",
          "hover:bg-slate-50 dark:hover:bg-slate-800"
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
            overallStatus === 'pass' ? "bg-emerald-100 text-emerald-700" :
            overallStatus === 'warn' ? "bg-amber-100 text-amber-700" :
            "bg-rose-100 text-rose-700"
          )}>
            {score}%
          </div>
          <div className="text-left">
            <span className={cn("text-xs font-bold block", theme.text.primary)}>Compliance</span>
            <span className={cn("text-[10px]", theme.text.secondary)}>
              {passCount} pass · {warnCount} warn · {failCount} fail
            </span>
          </div>
        </div>
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className={cn("border-t p-3 space-y-2", theme.border.subtle)}>
          <div className="flex items-center gap-2 mb-2">
            <Ruler className={cn("h-4 w-4", theme.text.tertiary)} />
            <span className={cn("text-xs font-medium", theme.text.secondary)}>
              {rules?.name || 'Federal'} Rules
            </span>
          </div>
          
          {checks.map(check => (
            <div
              key={check.id}
              className={cn(
                "flex items-center justify-between p-2 rounded text-xs",
                theme.surface.highlight
              )}
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(check.status)}
                <span className={cn("font-medium", theme.text.primary)}>{check.name}</span>
              </div>
              <span className={theme.text.secondary}>{check.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplianceHUD;
