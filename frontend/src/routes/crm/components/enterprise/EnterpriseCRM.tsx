/**
 * @module components/enterprise/CRM/EnterpriseCRM
 * @category Enterprise CRM
 * @description Enterprise-grade Client Relationship Management dashboard with Client 360 view,
 * relationship mapping, contact management, and opportunity pipeline.
 */

import {
  ArrowUpRight,
  Award,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Link2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  TrendingUp,
  Users
} from 'lucide-react';
import React, { useState } from 'react';

import { Card } from '@/components/molecules/Card/Card';
import { MetricCard } from '@/components/molecules/MetricCard/MetricCard';
import { EmptyState } from '@/routes/_shared/EmptyState';
import { useQuery } from '@/hooks/backend';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { crmApi } from '@/lib/frontend-api';
import { QUERY_KEYS } from '@/services/data/queryKeys';

import type { Client } from "@/types";


// ============================================================================
// COMPONENT
// ============================================================================

export const EnterpriseCRM: React.FC = () => {
  const { theme } = useTheme();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'list' | '360'>('list');

  // Data queries
  const { data: clients = [] } = useQuery(QUERY_KEYS.CLIENTS.ALL, async () => {
    const result = await crmApi.getAllClients({ page: 1, limit: 1000 });
    return result.ok ? result.data.data : [];
  });

  const { data: opportunities = [] } = useQuery(QUERY_KEYS.CRM.OPPORTUNITIES, async () => {
    const result = await crmApi.getOpportunities({ page: 1, limit: 100 });
    return result.ok ? result.data.data : [];
  });

  interface CRMRelationship {
    id: string;
    type: string;
    [key: string]: unknown;
  }

  const { data: relationships = [] } = useQuery<CRMRelationship[]>(QUERY_KEYS.CRM.RELATIONSHIPS, async () => {
    const result = await crmApi.getRelationships({ page: 1, limit: 100 });
    return result.ok ? result.data.data : [];
  });

  // Ensure data is array
  const clientsArray = Array.isArray(clients) ? clients : [];
  const opportunitiesArray = Array.isArray(opportunities) ? opportunities : [];

  // Calculate metrics
  const activeClients = clientsArray.filter((c: unknown) => {
    const status = typeof c === 'object' && c !== null && 'status' in c ? String(c.status) : '';
    return status === 'Active' || status === 'active';
  }).length;

  const totalRevenue = clientsArray.reduce((acc: number, c: unknown) => {
    if (typeof c === 'object' && c !== null && 'totalBilled' in c) {
      const totalBilled = typeof c.totalBilled === 'number' ? c.totalBilled : 0;
      return acc + totalBilled;
    }
    return acc;
  }, 0);

  const pipelineValue = opportunitiesArray.reduce((acc, opp) => acc + opp.value, 0);
  const avgClientValue = activeClients > 0 ? totalRevenue / activeClients : 0;

  const selectedClient = selectedClientId
    ? clientsArray.find((c: unknown) =>
      typeof c === 'object' && c !== null && 'id' in c && c.id === selectedClientId
    ) as Client | undefined
    : null;

  // ============================================================================
  // RENDER: CLIENT LIST VIEW
  // ============================================================================

  const renderClientList = () => (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className={cn("flex gap-4 p-4 rounded-lg", theme.surface.default, theme.border.default, "border")}>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search clients..."
            className={cn(
              "w-full px-4 py-2 rounded-md border",
              theme.surface.default,
              theme.text.primary,
              theme.border.default
            )}
          />
        </div>
        <select className={cn("px-4 py-2 rounded-md border", theme.surface.default, theme.text.primary, theme.border.default)}>
          <option>All Industries</option>
          <option>Technology</option>
          <option>Healthcare</option>
          <option>Finance</option>
        </select>
        <select className={cn("px-4 py-2 rounded-md border", theme.surface.default, theme.text.primary, theme.border.default)}>
          <option>All Statuses</option>
          <option>Active</option>
          <option>Prospect</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Client Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {clientsArray.slice(0, 6).map((client: unknown, idx: number) => {
          if (typeof client !== 'object' || client === null) return null;

          const clientName = 'name' in client && typeof client.name === 'string' ? client.name : 'Unknown';
          const clientId = 'id' in client ? String(client.id) : `client-${idx}`;
          const clientEmail = 'email' in client && typeof client.email === 'string' ? client.email : '';
          const clientPhone = 'phone' in client && typeof client.phone === 'string' ? client.phone : '';
          const clientIndustry = 'industry' in client && typeof client.industry === 'string' ? client.industry : '';
          const clientTotalBilled = 'totalBilled' in client && typeof client.totalBilled === 'number' ? client.totalBilled : 0;
          const clientActiveCases = 'activeCases' in client && typeof client.activeCases === 'number' ? client.activeCases : 0;

          return (
            <div
              key={idx}
              onClick={() => {
                setSelectedClientId(clientId);
                setActiveView('360');
              }}
              className={cn(
                "p-6 rounded-lg border cursor-pointer transition-all hover:shadow-lg",
                theme.surface.default,
                theme.border.default
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-full", theme.surface.highlight)}>
                    <Building2 className={cn("h-6 w-6", theme.text.secondary)} />
                  </div>
                  <div>
                    <h3 className={cn("font-bold text-lg", theme.text.primary)}>{clientName}</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>{clientIndustry || 'No industry'}</p>
                  </div>
                </div>
                <ArrowUpRight className={cn("h-5 w-5", theme.text.tertiary)} />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Total Billed</p>
                  <p className={cn("text-lg font-bold", theme.text.primary)}>
                    ${(clientTotalBilled / 1000).toFixed(0)}k
                  </p>
                </div>
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Active Matters</p>
                  <p className={cn("text-lg font-bold", theme.text.primary)}>{clientActiveCases}</p>
                </div>
              </div>

              <div className="space-y-2">
                {clientEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className={cn("h-4 w-4", theme.text.tertiary)} />
                    <span className={cn("text-sm", theme.text.secondary)}>{clientEmail}</span>
                  </div>
                )}
                {clientPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className={cn("h-4 w-4", theme.text.tertiary)} />
                    <span className={cn("text-sm", theme.text.secondary)}>{clientPhone}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: CLIENT 360 VIEW
  // ============================================================================

  const renderClient360 = () => {
    if (!selectedClient) return null;

    const clientName = selectedClient.name || 'Unknown Client';
    const clientIndustry = selectedClient.industry || 'N/A';
    const clientEmail = selectedClient.email || 'N/A';
    const clientPhone = selectedClient.phone || 'N/A';
    const clientAddress = selectedClient.address || 'N/A';
    const clientCity = selectedClient.city || '';
    const clientState = selectedClient.state || '';
    const clientTotalBilled = selectedClient.totalBilled || 0;
    const clientTotalPaid = selectedClient.totalPaid || 0;
    const clientActiveCases = selectedClient.activeCases || 0;
    const clientStatus = selectedClient.status || 'active';

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setActiveView('list')}
          className={cn("flex items-center gap-2 text-sm", theme.text.secondary, "hover:underline")}
        >
          <ArrowUpRight className="h-4 w-4 rotate-180" />
          Back to Client List
        </button>

        {/* Client Header */}
        <div className={cn("p-6 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className={cn("p-4 rounded-full", theme.surface.highlight)}>
                <Building2 className={cn("h-8 w-8", theme.text.secondary)} />
              </div>
              <div>
                <h1 className={cn("text-2xl font-bold", theme.text.primary)}>{clientName}</h1>
                <p className={cn("text-sm", theme.text.secondary)}>{clientIndustry}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    clientStatus === 'active' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                  )}>
                    {clientStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className={cn("px-4 py-2 rounded-md border", theme.surface.default, theme.border.default, "hover:shadow")}>
                <MessageSquare className="h-4 w-4" />
              </button>
              <button className={cn("px-4 py-2 rounded-md border", theme.surface.default, theme.border.default, "hover:shadow")}>
                <Phone className="h-4 w-4" />
              </button>
              <button className={cn("px-4 py-2 rounded-md border", theme.surface.default, theme.border.default, "hover:shadow")}>
                <Mail className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div>
              <p className={cn("text-xs", theme.text.tertiary)}>Total Billed</p>
              <p className={cn("text-xl font-bold", theme.text.primary)}>${(clientTotalBilled / 1000).toFixed(0)}k</p>
            </div>
            <div>
              <p className={cn("text-xs", theme.text.tertiary)}>Total Paid</p>
              <p className={cn("text-xl font-bold", theme.text.primary)}>${(clientTotalPaid / 1000).toFixed(0)}k</p>
            </div>
            <div>
              <p className={cn("text-xs", theme.text.tertiary)}>Active Matters</p>
              <p className={cn("text-xl font-bold", theme.text.primary)}>{clientActiveCases}</p>
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <Card title="Contact Information">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className={cn("h-5 w-5 mt-1", theme.text.tertiary)} />
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Email</p>
                  <p className={cn("text-sm", theme.text.primary)}>{clientEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className={cn("h-5 w-5 mt-1", theme.text.tertiary)} />
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Phone</p>
                  <p className={cn("text-sm", theme.text.primary)}>{clientPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className={cn("h-5 w-5 mt-1", theme.text.tertiary)} />
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Address</p>
                  <p className={cn("text-sm", theme.text.primary)}>
                    {clientAddress}
                    {clientCity && clientState && <><br />{clientCity}, {clientState}</>}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Relationship Map */}
          <Card title="Relationships">
            <div className="space-y-3">
              {relationships
                .filter(rel => rel.clientId === selectedClient.id)
                .map(rel => (
                  <div key={rel.id} className={cn("p-3 rounded border", theme.border.default)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={cn("font-medium text-sm", theme.text.primary)}>{rel.relatedClientName}</p>
                        <p className={cn("text-xs", theme.text.secondary)}>{rel.relationshipType}</p>
                      </div>
                      <div className={cn("px-2 py-1 rounded text-xs", theme.surface.highlight)}>
                        Strength: {rel.strength}/10
                      </div>
                    </div>
                  </div>
                ))}
              {relationships.filter(rel => rel.clientId === selectedClient.id).length === 0 && (
                <EmptyState 
                  icon={Link2}
                  title="No relationships mapped"
                  message="Map client relationships to visualize business connections"
                  size="sm"
                />
              )}
            </div>
          </Card>

          {/* Opportunities */}
          <Card title="Active Opportunities">
            <div className="space-y-3">
              {opportunitiesArray
                .filter(opp => opp.clientId === selectedClient.id)
                .map(opp => (
                  <div key={opp.id} className={cn("p-3 rounded border", theme.border.default)}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={cn("font-medium text-sm", theme.text.primary)}>{opp.title}</h4>
                      <span className={cn("text-xs font-mono", theme.text.primary)}>
                        ${(opp.value / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs",
                        opp.stage === 'Closed Won' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                          opp.stage === 'Closed Lost' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      )}>
                        {opp.stage}
                      </span>
                      <span className={cn("text-xs", theme.text.secondary)}>{opp.probability}% probability</span>
                    </div>
                  </div>
                ))}
              {opportunitiesArray.filter(opp => opp.clientId === selectedClient.id).length === 0 && (
                <EmptyState 
                  icon={TrendingUp}
                  title="No active opportunities"
                  message="Track business opportunities and deals to forecast revenue"
                  size="sm"
                />
              )}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card title="Recent Activity">
          <div className="space-y-3">
            {[
              { type: 'Meeting', subject: 'Quarterly Business Review', timestamp: '2026-01-02 14:00', user: 'John Smith' },
              { type: 'Email', subject: 'Follow-up on proposal', timestamp: '2026-01-01 10:30', user: 'Sarah Johnson' },
              { type: 'Document', subject: 'Engagement letter sent', timestamp: '2025-12-28 16:45', user: 'System' }
            ].map((activity, idx) => (
              <div key={idx} className={cn("flex items-start gap-3 p-3 border-b last:border-0", theme.border.default)}>
                <div className={cn("p-2 rounded", theme.surface.highlight)}>
                  {activity.type === 'Meeting' && <Calendar className={cn("h-4 w-4", theme.text.secondary)} />}
                  {activity.type === 'Email' && <Mail className={cn("h-4 w-4", theme.text.secondary)} />}
                  {activity.type === 'Document' && <FileText className={cn("h-4 w-4", theme.text.secondary)} />}
                </div>
                <div className="flex-1">
                  <p className={cn("font-medium text-sm", theme.text.primary)}>{activity.subject}</p>
                  <p className={cn("text-xs", theme.text.secondary)}>{activity.type} • {activity.user}</p>
                </div>
                <span className={cn("text-xs", theme.text.tertiary)}>{activity.timestamp}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="space-y-6 animate-fade-in">
      {activeView === 'list' ? (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Active Clients"
              value={activeClients.toString()}
              icon={Users}
              trend="+12% YTD"
              trendUp={true}
              className="border-l-4 border-l-blue-600"
            />
            <MetricCard
              label="Total Revenue"
              value={`$${(totalRevenue / 1000000).toFixed(1)}M`}
              icon={DollarSign}
              trend="+8% vs Last Year"
              trendUp={true}
              className="border-l-4 border-l-emerald-600"
            />
            <MetricCard
              label="Pipeline Value"
              value={`$${(pipelineValue / 1000).toFixed(0)}k`}
              icon={TrendingUp}
              trend={`${opportunitiesArray.length} Opportunities`}
              className="border-l-4 border-l-purple-600"
            />
            <MetricCard
              label="Avg Client Value"
              value={`$${(avgClientValue / 1000).toFixed(0)}k`}
              icon={Award}
              className="border-l-4 border-l-amber-500"
            />
          </div>

          {/* Client List */}
          {renderClientList()}
        </>
      ) : (
        <>
          {/* Client 360 View */}
          {renderClient360()}
        </>
      )}
    </div>
  );
};
