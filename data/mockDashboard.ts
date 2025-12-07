import { Briefcase, Clock, FileText, AlertTriangle } from 'lucide-react';

export const DASHBOARD_STATS = [
    { label: 'Active Cases', value: '142', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Pending Motions', value: '28', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Billable Hours (Mo)', value: '1,240', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'High Risk Items', value: '12', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
];
  
export const DASHBOARD_CHART_DATA = [
    { name: 'Discovery', count: 45 },
    { name: 'Trial Prep', count: 22 },
    { name: 'In Trial', count: 8 },
    { name: 'Settlement', count: 15 },
    { name: 'Appeal', count: 5 },
];

export const RECENT_ALERTS = [
    { id: 1, message: 'New filing in Martinez v. TechCorp', detail: 'Opposing counsel submitted Motion to Dismiss.', time: '2h ago', caseId: 'C-2024-001' },
    { id: 2, message: 'Compliance Review Due', detail: 'Project Blue Acquisition ethical wall audit.', time: '4h ago', caseId: 'C-2024-112' },
    { id: 3, message: 'Billing Target Met', detail: 'Q1 Billing goals reached by Litigation team.', time: '1d ago', caseId: null },
    { id: 4, message: 'System Maintenance', detail: 'Scheduled downtime Sunday 2am.', time: '2d ago', caseId: null },
];