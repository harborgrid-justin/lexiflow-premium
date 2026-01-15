import { useTheme } from '@/theme';
import { cn } from '@/lib/cn';
import { Card } from '@/components/molecules/Card/Card';
import { Book, FileCode, FileText, Flag, Scale } from 'lucide-react';
export function HelpSection() {
  const { theme } = useTheme();

  const citationTypes = [
    {
      icon: Scale,
      name: 'Case Citation',
      example: 'Brown v. Board of Education, 347 U.S. 483 (1954)',
      color: 'text-blue-600'
    },
    {
      icon: Book,
      name: 'Statute',
      example: '42 U.S.C. § 1983 (2018)',
      color: 'text-green-600'
    },
    {
      icon: Flag,
      name: 'Constitution',
      example: 'U.S. Const. art. I, § 8',
      color: 'text-purple-600'
    },
    {
      icon: FileCode,
      name: 'Regulation',
      example: '21 C.F.R. § 314.126 (2022)',
      color: 'text-amber-600'
    },
    {
      icon: FileText,
      name: 'Book',
      example: 'Richard A. Posner, Economic Analysis of Law 25 (9th ed. 2014)',
      color: 'text-rose-600'
    }
  ];

  return (
    <Card title="Quick Reference">
      <div className={cn("text-sm mb-4", theme.text.secondary)}>
        The Bluebook Formatter supports multiple citation types. Enter citations in any format,
        and they will be automatically parsed and formatted according to The Bluebook (21st ed.) standards.
      </div>

      <div className="space-y-3">
        {citationTypes.map((type, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <type.icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", type.color)} />
            <div className="flex-1 min-w-0">
              <div className={cn("font-medium text-sm mb-1", theme.text.primary)}>
                {type.name}
              </div>
              <div className={cn("text-xs font-mono", theme.text.tertiary)}>
                {type.example}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={cn("mt-4 pt-4 border-t text-xs", theme.border.default, theme.text.tertiary)}>
        <strong>Pro Tips:</strong>
        <ul className="mt-2 space-y-1 pl-4">
          <li>• Enter multiple citations separated by new lines</li>
          <li>• Use "Add Sample Data" to see examples</li>
          <li>• Export to HTML for formatted documents</li>
          <li>• Generate Table of Authorities for briefs</li>
        </ul>
      </div>
    </Card>
  );
};
