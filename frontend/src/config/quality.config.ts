import { Activity, GitMerge, FileSearch, Settings, Wand2 } from 'lucide-react';
import { QualityRule } from '@/routes/admin/components/data/quality/RuleBuilder';

export const QUALITY_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'standardization', label: 'Standardization', icon: Wand2 },
  { id: 'dedupe', label: 'Deduplication', icon: GitMerge },
  { id: 'profiler', label: 'Profiler', icon: FileSearch },
  { id: 'rules', label: 'Validation Rules', icon: Settings }
];

export const QUALITY_RULES_DEFAULT: QualityRule[] = [
  {
      id: 'r1',
      name: 'Email Completeness',
      description: 'Ensure user emails follow standard format',
      severity: 'Critical',
      action: 'Block',
      enabled: true,
      conditions: [{ id: 'c1', field: 'users.email', operator: 'LIKE', value: '%_@__%.__%' }]
  },
  {
      id: 'r2',
      name: 'Case Value Range',
      description: 'Case value cannot be negative',
      severity: 'High',
      action: 'Warn',
      enabled: true,
      conditions: [{ id: 'c1', field: 'cases.value', operator: '>', value: '0' }]
  }
];
