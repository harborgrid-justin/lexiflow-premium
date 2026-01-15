/**
 * BusinessDevelopment Component
 * @module components / enterprise / CRM / BusinessDevelopment
 * @category Enterprise CRM
 * @description Business development module with lead tracking, pitch management,
 * RFP response tracking, and win / loss analysis.
 */

import React, { useState } from 'react';

import { ChartColorService, useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/cn';
import { Card } from '@/components/molecules/Card/Card';
import { MetricCard } from '@/components/molecules/MetricCard/MetricCard';
import { getChartTheme } from '@/utils/chartConfig';
import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Plus,
  Search,
  Target,
  Users,
  XCircle
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as RechartPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// ============================================================================
// TYPES
// ============================================================================

interface Lead {
  id: string;
  name: string;
  company: string;
  industry: string;
  email: string;
  phone: string;
  source: 'Referral' | 'Website' | 'Conference' | 'LinkedIn' | 'Cold Outreach' | 'Other';
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  practiceArea: string;
  estimatedValue: number;
  probability: number; // 0-100
  assignedTo: string;
  createdDate: string;
  lastActivity: string;
  nextAction?: string;
  nextActionDate?: string;
  notes?: string;
}

interface Pitch {
  id: string;
  leadId: string;
  clientName: string;
  practiceArea: string;
  pitchDate: string;
  pitchType: 'In-Person' | 'Virtual' | 'Written' | 'Panel';
  attendees: string[];
  presenters: string[];
  status: 'Scheduled' | 'Completed' | 'Won' | 'Lost';
  followUpDate?: string;
  estimatedValue: number;
  outcome?: 'Won' | 'Lost' | 'No Decision Yet';
  feedbackReceived?: boolean;
  notes?: string;
}

interface RFP {
  id: string;
  title: string;
  clientName: string;
  industry: string;
  practiceArea: string;
  receivedDate: string;
  dueDate: string;
  estimatedValue: number;
  status: 'Reviewing' | 'Go/No-Go' | 'In Progress' | 'Submitted' | 'Won' | 'Lost' | 'Declined';
  teamLead: string;
  contributors: string[];
  progress: number; // 0-100
  sections: {
    name: string;
    assignedTo: string;
    status: 'Not Started' | 'In Progress' | 'Review' | 'Complete';
  }[];
  questions?: number;
  pageLimit?: number;
  goNoGoDecision?: 'Go' | 'No-Go' | 'Pending';
  goNoGoReason?: string;
}

interface WinLossAnalysis {
  id: string;
  opportunityName: string;
  clientName: string;
  practiceArea: string;
  estimatedValue: number;
  actualValue?: number;
  outcome: 'Won' | 'Lost';
  closeDate: string;
  winReasons?: string[];
  lossReasons?: string[];
  competitorWon?: string;
  lessonsLearned: string[];
  teamMembers: string[];
  salesCycle: number; // days
}

// ============================================================================
// COMPONENT
// ============================================================================

export const BusinessDevelopment: React.FC = () => {
  const { theme, mode } = useTheme();
  const chartColors = ChartColorService.getPalette(mode as 'light' | 'dark');
  const chartTheme = getChartTheme(mode as 'light' | 'dark');
  const [activeTab, setActiveTab] = useState<'leads' | 'pitches' | 'rfps' | 'analysis'>('leads');

  // Mock data
  const leads: Lead[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      company: 'TechVentures Inc.',
      industry: 'Technology',
      email: 'sarah.chen@techventures.com',
      phone: '555-0123',
      source: 'Referral',
      status: 'Proposal',
      practiceArea: 'Corporate Law',
      estimatedValue: 450000,
      probability: 75,
      assignedTo: 'John Smith',
      createdDate: '2025-12-15',
      lastActivity: '2026-01-02',
      nextAction: 'Send revised proposal',
      nextActionDate: '2026-01-05'
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      company: 'BioHealth Solutions',
      industry: 'Healthcare',
      email: 'm.rodriguez@biohealth.com',
      phone: '555-0456',
      source: 'Conference',
      status: 'Qualified',
      practiceArea: 'IP Litigation',
      estimatedValue: 320000,
      probability: 60,
      assignedTo: 'Sarah Johnson',
      createdDate: '2025-12-20',
      lastActivity: '2026-01-01',
      nextAction: 'Schedule initial consultation',
      nextActionDate: '2026-01-08'
    },
    {
      id: '3',
      name: 'Emma Wilson',
      company: 'Global Manufacturing LLC',
      industry: 'Manufacturing',
      email: 'ewilson@globalmanuf.com',
      phone: '555-0789',
      source: 'Website',
      status: 'Won',
      practiceArea: 'Employment Law',
      estimatedValue: 180000,
      probability: 100,
      assignedTo: 'Mike Wilson',
      createdDate: '2025-11-10',
      lastActivity: '2025-12-28',
      notes: 'Signed engagement letter on 12/28'
    }
  ];

  const pitches: Pitch[] = [
    {
      id: '1',
      leadId: '1',
      clientName: 'TechVentures Inc.',
      practiceArea: 'Corporate Law',
      pitchDate: '2025-12-18',
      pitchType: 'In-Person',
      attendees: ['Sarah Chen', 'CFO', 'General Counsel'],
      presenters: ['John Smith', 'Senior Partner'],
      status: 'Completed',
      followUpDate: '2026-01-05',
      estimatedValue: 450000,
      outcome: 'No Decision Yet',
      feedbackReceived: true,
      notes: 'Very positive reception, requested revised scope'
    },
    {
      id: '2',
      leadId: '4',
      clientName: 'RetailCorp',
      practiceArea: 'Real Estate',
      pitchDate: '2026-01-15',
      pitchType: 'Virtual',
      attendees: ['CEO', 'VP Operations'],
      presenters: ['Jane Davis', 'Associate'],
      status: 'Scheduled',
      estimatedValue: 280000
    }
  ];

  const rfps: RFP[] = [
    {
      id: '1',
      title: 'Outside General Counsel Services',
      clientName: 'Acme Corporation',
      industry: 'Technology',
      practiceArea: 'Corporate Law',
      receivedDate: '2025-12-10',
      dueDate: '2026-01-20',
      estimatedValue: 850000,
      status: 'In Progress',
      teamLead: 'John Smith',
      contributors: ['Sarah Johnson', 'Mike Wilson', 'Jane Davis'],
      progress: 65,
      sections: [
        { name: 'Executive Summary', assignedTo: 'John Smith', status: 'Complete' },
        { name: 'Firm Overview', assignedTo: 'Sarah Johnson', status: 'Complete' },
        { name: 'Practice Area Experience', assignedTo: 'Mike Wilson', status: 'In Progress' },
        { name: 'Team Bios', assignedTo: 'Jane Davis', status: 'Review' },
        { name: 'Pricing', assignedTo: 'John Smith', status: 'Not Started' }
      ],
      questions: 45,
      pageLimit: 50,
      goNoGoDecision: 'Go',
      goNoGoReason: 'Strong fit, existing relationship, high value'
    },
    {
      id: '2',
      title: 'IP Litigation Panel',
      clientName: 'Tech Innovations LLC',
      industry: 'Technology',
      practiceArea: 'IP Litigation',
      receivedDate: '2026-01-05',
      dueDate: '2026-02-15',
      estimatedValue: 500000,
      status: 'Go/No-Go',
      teamLead: 'Sarah Johnson',
      contributors: [],
      progress: 5,
      sections: [],
      questions: 30,
      pageLimit: 30,
      goNoGoDecision: 'Pending'
    }
  ];

  const winLossData: WinLossAnalysis[] = [
    {
      id: '1',
      opportunityName: 'Global Manufacturing Employment Matter',
      clientName: 'Global Manufacturing LLC',
      practiceArea: 'Employment Law',
      estimatedValue: 180000,
      actualValue: 180000,
      outcome: 'Won',
      closeDate: '2025-12-28',
      winReasons: ['Strong industry expertise', 'Competitive pricing', 'Responsive proposal'],
      lessonsLearned: ['Quick turnaround on proposal was key', 'Industry-specific case studies resonated'],
      teamMembers: ['Mike Wilson', 'Jane Davis'],
      salesCycle: 48
    },
    {
      id: '2',
      opportunityName: 'Financial Services Compliance Review',
      clientName: 'BigBank Corp',
      practiceArea: 'Compliance',
      estimatedValue: 400000,
      outcome: 'Lost',
      closeDate: '2025-12-15',
      lossReasons: ['Price too high', 'Competitor had existing relationship', 'Insufficient fintech experience'],
      competitorWon: 'Smith & Associates',
      lessonsLearned: ['Need more fintech expertise on team', 'Consider flexible pricing for large engagements'],
      teamMembers: ['John Smith', 'Sarah Johnson'],
      salesCycle: 62
    }
  ];

  // Analytics data
  const leadsByStatus = [
    { status: 'New', count: 12, value: 850000 },
    { status: 'Contacted', count: 8, value: 620000 },
    { status: 'Qualified', count: 15, value: 1250000 },
    { status: 'Proposal', count: 6, value: 980000 },
    { status: 'Negotiation', count: 4, value: 720000 },
    { status: 'Won', count: 22, value: 3200000 },
    { status: 'Lost', count: 18, value: 1100000 }
  ];

  const leadsBySource = [
    { source: 'Referral', count: 28, color: '#3b82f6' },
    { source: 'Website', count: 15, color: '#10b981' },
    { source: 'Conference', count: 12, color: '#f59e0b' },
    { source: 'LinkedIn', count: 8, color: '#8b5cf6' },
    { source: 'Cold Outreach', count: 5, color: '#ef4444' },
    { source: 'Other', count: 7, color: '#6b7280' }
  ];

  const conversionTrend = [
    { month: 'Jul', leads: 42, won: 8, lostcount: 12 },
    { month: 'Aug', leads: 45, won: 10, lost: 10 },
    { month: 'Sep', leads: 38, won: 7, lost: 9 },
    { month: 'Oct', leads: 52, won: 12, lost: 14 },
    { month: 'Nov', leads: 48, won: 11, lost: 11 },
    { month: 'Dec', leads: 55, won: 15, lost: 13 }
  ];

  // Calculate metrics
  const activeLeads = leads.filter(l => !['Won', 'Lost'].includes(l.status)).length;
  const pipelineValue = leads
    .filter(l => !['Won', 'Lost'].includes(l.status))
    .reduce((acc, l) => acc + l.estimatedValue, 0);
  const wonValue = leads
    .filter(l => l.status === 'Won')
    .reduce((acc, l) => acc + l.estimatedValue, 0);
  const winRate = ((leads.filter(l => l.status === 'Won').length / Math.max(leads.filter(l => ['Won', 'Lost'].includes(l.status)).length, 1)) * 100).toFixed(1);

  // ============================================================================
  // RENDER: LEADS TAB
  // ============================================================================

  const renderLeadsTab = () => (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className={cn("flex gap-4 p-4 rounded-lg", theme.surface.default, theme.border.default, "border")}>
        <div className="flex-1">
          <div className="relative">
            <Search className={cn("absolute left-3 top-2.5 h-5 w-5", theme.text.tertiary)} />
            <input
              type="text"
              placeholder="Search leads..."
              className={cn("w-full pl-10 pr-4 py-2 rounded-md border", theme.surface.default, theme.text.primary, theme.border.default)}
            />
          </div>
        </div>
        <select className={cn("px-4 py-2 rounded-md border", theme.surface.default, theme.text.primary, theme.border.default)}>
          <option>All Statuses</option>
          <option>New</option>
          <option>Qualified</option>
          <option>Proposal</option>
        </select>
        <select className={cn("px-4 py-2 rounded-md border", theme.surface.default, theme.text.primary, theme.border.default)}>
          <option>All Sources</option>
          <option>Referral</option>
          <option>Website</option>
          <option>Conference</option>
        </select>
        <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4 inline mr-1" />
          Add Lead
        </button>
      </div>

      {/* Leads Pipeline */}
      <Card title="Pipeline by Status">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leadsByStatus} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
              <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
              <Tooltip contentStyle={chartTheme.tooltipStyle} />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill={chartColors[0]} radius={[8, 8, 0, 0]} name="Lead Count" />
              <Bar yAxisId="right" dataKey="value" fill={chartColors[2]} radius={[8, 8, 0, 0]} name="Pipeline Value ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Leads List */}
      <div className="space-y-3">
        {leads.map(lead => (
          <div
            key={lead.id}
            className={cn("p-6 rounded-lg border hover:shadow-lg transition-all cursor-pointer", theme.surface.default, theme.border.default)}
            onClick={() => {
              // setSelectedLead hook used in parent component via useBusinessDevelopment
              console.log('Lead selected:', lead.id);
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={cn("font-bold text-lg", theme.text.primary)}>
                    {lead.name} - {lead.company}
                  </h3>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    lead.status === 'Won' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                      lead.status === 'Lost' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                        lead.status === 'Proposal' || lead.status === 'Negotiation' ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  )}>
                    {lead.status}
                  </span>
                </div>
                <p className={cn("text-sm", theme.text.secondary)}>
                  {lead.practiceArea} • {lead.industry}
                </p>
              </div>
              <div className="text-right">
                <p className={cn("text-xl font-bold", theme.text.primary)}>
                  ${(lead.estimatedValue / 1000).toFixed(0)}k
                </p>
                <p className={cn("text-xs", theme.text.tertiary)}>{lead.probability}% probability</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Source</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>{lead.source}</p>
              </div>
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Assigned To</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>{lead.assignedTo}</p>
              </div>
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Created</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>{lead.createdDate}</p>
              </div>
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Last Activity</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>{lead.lastActivity}</p>
              </div>
            </div>

            {lead.nextAction && (
              <div className={cn("p-3 rounded", theme.surface.highlight)}>
                <div className="flex items-center gap-2">
                  <Clock className={cn("h-4 w-4", theme.text.secondary)} />
                  <p className={cn("text-sm font-medium", theme.text.primary)}>
                    Next: {lead.nextAction}
                    {lead.nextActionDate && ` (${lead.nextActionDate})`}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: PITCHES TAB
  // ============================================================================

  const renderPitchesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={cn("font-medium", theme.text.primary)}>Pitch Activities</h3>
        <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4 inline mr-1" />
          Schedule Pitch
        </button>
      </div>

      <div className="space-y-3">
        {pitches.map(pitch => (
          <div key={pitch.id} className={cn("p-6 rounded-lg border", theme.surface.default, theme.border.default)}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className={cn("font-bold", theme.text.primary)}>{pitch.clientName}</h4>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    pitch.status === 'Won' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                      pitch.status === 'Lost' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                        pitch.status === 'Completed' ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  )}>
                    {pitch.status}
                  </span>
                </div>
                <p className={cn("text-sm", theme.text.secondary)}>
                  {pitch.practiceArea} • {pitch.pitchType} Pitch
                </p>
              </div>
              <p className={cn("text-xl font-bold", theme.text.primary)}>
                ${(pitch.estimatedValue / 1000).toFixed(0)}k
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Pitch Date</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>{pitch.pitchDate}</p>
              </div>
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Presenters</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>{pitch.presenters.join(', ')}</p>
              </div>
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Attendees</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>{pitch.attendees.length} people</p>
              </div>
            </div>

            {pitch.outcome && (
              <div className={cn("p-3 rounded mb-4", theme.surface.highlight)}>
                <p className={cn("text-sm", theme.text.primary)}>
                  <strong>Outcome:</strong> {pitch.outcome}
                  {pitch.feedbackReceived && " • Feedback received"}
                </p>
              </div>
            )}

            {pitch.notes && (
              <p className={cn("text-sm mb-4", theme.text.secondary)}>{pitch.notes}</p>
            )}

            {pitch.followUpDate && (
              <div className="flex items-center gap-2">
                <Calendar className={cn("h-4 w-4", theme.text.tertiary)} />
                <p className={cn("text-sm", theme.text.secondary)}>
                  Follow-up scheduled: {pitch.followUpDate}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: RFPs TAB
  // ============================================================================

  const renderRFPsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={cn("font-medium", theme.text.primary)}>RFP Tracker</h3>
        <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4 inline mr-1" />
          Add RFP
        </button>
      </div>

      <div className="space-y-4">
        {rfps.map(rfp => (
          <div key={rfp.id} className={cn("p-6 rounded-lg border", theme.surface.default, theme.border.default)}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className={cn("font-bold text-lg", theme.text.primary)}>{rfp.title}</h4>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    rfp.status === 'Won' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                      rfp.status === 'Lost' || rfp.status === 'Declined' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                        rfp.status === 'Submitted' ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  )}>
                    {rfp.status}
                  </span>
                  {rfp.goNoGoDecision === 'Go' && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Go Decision
                    </span>
                  )}
                </div>
                <p className={cn("text-sm", theme.text.secondary)}>
                  {rfp.clientName} • {rfp.practiceArea} • {rfp.industry}
                </p>
              </div>
              <div className="text-right">
                <p className={cn("text-xl font-bold", theme.text.primary)}>
                  ${(rfp.estimatedValue / 1000).toFixed(0)}k
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className={cn("text-sm", theme.text.secondary)}>Completion Progress</span>
                <span className={cn("text-sm font-medium", theme.text.primary)}>{rfp.progress}%</span>
              </div>
              <div className={cn("w-full h-2 rounded-full", theme.surface.highlight)}>
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${rfp.progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Received</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>{rfp.receivedDate}</p>
              </div>
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Due Date</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>{rfp.dueDate}</p>
              </div>
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Team Lead</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>{rfp.teamLead}</p>
              </div>
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Contributors</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>{rfp.contributors.length} people</p>
              </div>
            </div>

            {/* Sections Status */}
            {rfp.sections.length > 0 && (
              <div className={cn("p-4 rounded", theme.surface.highlight)}>
                <p className={cn("text-xs font-medium mb-3", theme.text.tertiary)}>Section Status</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {rfp.sections.map((section, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className={cn("text-sm", theme.text.secondary)}>{section.name}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs",
                        section.status === 'Complete' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                          section.status === 'Review' ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                            section.status === 'In Progress' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                              "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                      )}>
                        {section.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rfp.goNoGoReason && (
              <div className={cn("mt-4 p-3 rounded border-l-4 border-l-green-600", theme.surface.default, "border")}>
                <p className={cn("text-sm", theme.text.primary)}>
                  <strong>Go/No-Go Rationale:</strong> {rfp.goNoGoReason}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: WIN/LOSS ANALYSIS TAB
  // ============================================================================

  const renderAnalysisTab = () => (
    <div className="space-y-6">
      {/* Win Rate Trend */}
      <Card title="Conversion Trend">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={conversionTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
              <Tooltip contentStyle={chartTheme.tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="leads" stroke={chartColors[0]} strokeWidth={2} name="Total Leads" />
              <Line type="monotone" dataKey="won" stroke={chartColors[2]} strokeWidth={2} name="Won" />
              <Line type="monotone" dataKey="lost" stroke={chartColors[4]} strokeWidth={2} name="Lost" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Lead Sources Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Leads by Source">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartPieChart>
                <Pie
                  data={leadsBySource}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(props) => {
                    const payload = props.payload || {};
                    const source = (payload as { source?: string }).source || (props as { source?: string }).source;
                    const count = (payload as { count?: number }).count ?? (props as { count?: number }).count;
                    return source && count !== undefined ? `${source}: ${count}` : '';
                  }}
                >
                  {leadsBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartPieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Key Metrics Summary">
          <div className="space-y-4">
            <div className={cn("p-4 rounded", theme.surface.highlight)}>
              <p className={cn("text-sm", theme.text.tertiary)}>Total Pipeline Value</p>
              <p className={cn("text-2xl font-bold", theme.text.primary)}>
                ${(pipelineValue / 1000000).toFixed(2)}M
              </p>
            </div>
            <div className={cn("p-4 rounded", theme.surface.highlight)}>
              <p className={cn("text-sm", theme.text.tertiary)}>Win Rate</p>
              <p className={cn("text-2xl font-bold text-green-600")}>{winRate}%</p>
            </div>
            <div className={cn("p-4 rounded", theme.surface.highlight)}>
              <p className={cn("text-sm", theme.text.tertiary)}>Avg Sales Cycle</p>
              <p className={cn("text-2xl font-bold", theme.text.primary)}>
                {(winLossData.reduce((acc, w) => acc + w.salesCycle, 0) / winLossData.length).toFixed(0)} days
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Win/Loss Details */}
      <Card title="Win/Loss Analysis">
        <div className="space-y-4">
          {winLossData.map(analysis => (
            <div key={analysis.id} className={cn("p-6 rounded-lg border", theme.border.default)}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {analysis.outcome === 'Won' ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <h4 className={cn("font-bold", theme.text.primary)}>{analysis.opportunityName}</h4>
                    <p className={cn("text-sm", theme.text.secondary)}>
                      {analysis.clientName} • {analysis.practiceArea}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-xl font-bold", analysis.outcome === 'Won' ? "text-green-600" : "text-red-600")}>
                    ${((analysis.actualValue || analysis.estimatedValue) / 1000).toFixed(0)}k
                  </p>
                  <p className={cn("text-xs", theme.text.tertiary)}>
                    Sales Cycle: {analysis.salesCycle} days
                  </p>
                </div>
              </div>

              {analysis.outcome === 'Won' && analysis.winReasons && (
                <div className={cn("p-4 rounded mb-4 bg-green-50 dark:bg-green-900/20")}>
                  <p className={cn("text-xs font-medium mb-2 text-green-800 dark:text-green-400")}>Win Reasons</p>
                  <ul className="space-y-1">
                    {analysis.winReasons.map((reason, idx) => (
                      <li key={idx} className={cn("text-sm text-green-700 dark:text-green-300")}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.outcome === 'Lost' && analysis.lossReasons && (
                <div className={cn("p-4 rounded mb-4 bg-red-50 dark:bg-red-900/20")}>
                  <p className={cn("text-xs font-medium mb-2 text-red-800 dark:text-red-400")}>Loss Reasons</p>
                  <ul className="space-y-1">
                    {analysis.lossReasons.map((reason, idx) => (
                      <li key={idx} className={cn("text-sm text-red-700 dark:text-red-300")}>• {reason}</li>
                    ))}
                  </ul>
                  {analysis.competitorWon && (
                    <p className={cn("text-sm mt-2 text-red-700 dark:text-red-300")}>
                      <strong>Won by:</strong> {analysis.competitorWon}
                    </p>
                  )}
                </div>
              )}

              <div className={cn("p-4 rounded", theme.surface.highlight)}>
                <p className={cn("text-xs font-medium mb-2", theme.text.tertiary)}>Lessons Learned</p>
                <ul className="space-y-1">
                  {analysis.lessonsLearned.map((lesson, idx) => (
                    <li key={idx} className={cn("text-sm", theme.text.primary)}>• {lesson}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Leads"
          value={activeLeads.toString()}
          icon={Users}
          trend="+8 this week"
          trendUp={true}
          className="border-l-4 border-l-blue-600"
        />
        <MetricCard
          label="Pipeline Value"
          value={`$${(pipelineValue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          trend="+12% this month"
          trendUp={true}
          className="border-l-4 border-l-green-600"
        />
        <MetricCard
          label="Win Rate"
          value={`${winRate}%`}
          icon={Target}
          className="border-l-4 border-l-purple-600"
        />
        <MetricCard
          label="Won (YTD)"
          value={`$${(wonValue / 1000000).toFixed(1)}M`}
          icon={Award}
          trend="+25% vs Last Year"
          trendUp={true}
          className="border-l-4 border-l-amber-500"
        />
      </div>

      {/* Tabs */}
      <div className={cn("border-b", theme.border.default)}>
        <div className="flex gap-6">
          {[
            { id: 'leads' as const, label: 'Leads', icon: Users },
            { id: 'pitches' as const, label: 'Pitches', icon: Target },
            { id: 'rfps' as const, label: 'RFPs', icon: FileText },
            { id: 'analysis' as const, label: 'Win/Loss Analysis', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : cn("border-transparent", theme.text.secondary, "hover:text-blue-600")
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'leads' && renderLeadsTab()}
        {activeTab === 'pitches' && renderPitchesTab()}
        {activeTab === 'rfps' && renderRFPsTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
      </div>
    </div>
  );
};
