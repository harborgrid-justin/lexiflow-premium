import { Button } from '@/shared/ui/atoms/Button/Button';
import { PageHeader } from '@/shared/ui/organisms/PageHeader';
import { useTheme } from '@/theme';
import { Briefcase, UserPlus, Users } from 'lucide-react';
import { useCRM } from './CRMProvider';

export function CRMView() {
  const { theme, tokens } = useTheme();
  const { clients, contacts, opportunities, metrics, activeTab, setActiveTab, isPending } = useCRM();

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="CRM" subtitle="Client relationship management">
        <Button variant="primary" size="md">
          <UserPlus className="w-4 h-4" />
          Add Client
        </Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard theme={theme} tokens={tokens} title="Total Clients" value={metrics.totalClients} icon={<Users style={{ color: theme.primary.DEFAULT }} className="w-5 h-5" />} />
        <MetricCard theme={theme} tokens={tokens} title="Active Clients" value={metrics.activeClients} icon={<Users style={{ color: theme.status.success.text }} className="w-5 h-5" />} />
        <MetricCard theme={theme} tokens={tokens} title="Contacts" value={metrics.totalContacts} icon={<UserPlus style={{ color: '#9333ea' }} className="w-5 h-5" />} />
        <MetricCard theme={theme} tokens={tokens} title="Opportunities" value={metrics.openOpportunities} icon={<Briefcase style={{ color: theme.status.warning.text }} className="w-5 h-5" />} />
      </div>

      <div style={{
        borderBottom: `1px solid ${theme.border.default}`,
        marginBottom: tokens.spacing.normal.md,
      }}>
        <nav className="flex space-x-4">
          <TabButton theme={theme} tokens={tokens} active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} disabled={isPending}>
            Clients ({clients.length})
          </TabButton>
          <TabButton theme={theme} tokens={tokens} active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} disabled={isPending}>
            Contacts ({contacts.length})
          </TabButton>
          <TabButton theme={theme} tokens={tokens} active={activeTab === 'opportunities'} onClick={() => setActiveTab('opportunities')} disabled={isPending}>
            Opportunities ({opportunities.length})
          </TabButton>
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'clients' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map(client => (
              <ClientCard key={client.id} client={client} theme={theme} tokens={tokens} />
            ))}
          </div>
        )}
        {activeTab === 'contacts' && (
          <div className="space-y-2">
            {contacts.map(contact => (
              <ContactRow key={contact.id} contact={contact} theme={theme} tokens={tokens} />
            ))}
          </div>
        )}
        {activeTab === 'opportunities' && (
          <div className="space-y-2">
            {opportunities.map(opp => (
              <OpportunityRow key={opp.id} opportunity={opp} theme={theme} tokens={tokens} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, theme, tokens }: { title: string; value: number; icon: React.ReactNode; theme: Record<string, any>; tokens: Record<string, any> }) {
  return (
    <div style={{
      backgroundColor: theme.surface.base,
      borderRadius: tokens.borderRadius.lg,
      border: `1px solid ${theme.border.default}`,
      padding: tokens.spacing.normal.md,
    }}>
      <div style={{ marginBottom: tokens.spacing.normal.sm }} className="flex items-center justify-between">
        <span style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>{title}</span>
        {icon}
      </div>
      <div style={{
        fontSize: tokens.typography.fontSize['2xl'],
        fontWeight: tokens.typography.fontWeight.semibold,
        color: theme.text.primary,
      }}>{value}</div>
    </div>
  );
}

function TabButton({ active, onClick, disabled, children, theme, tokens }: { active: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode; theme: Record<string, any>; tokens: Record<string, any> }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
        fontSize: tokens.typography.fontSize.sm,
        fontWeight: tokens.typography.fontWeight.medium,
        borderBottom: `2px solid ${active ? theme.primary.DEFAULT : 'transparent'}`,
        color: active ? theme.primary.DEFAULT : theme.text.secondary,
      }}
      className="transition-colors"
    >
      {children}
    </button>
  );
}

function ClientCard({ client, theme, tokens }: { client: CRMClient; theme: Record<string, any>; tokens: Record<string, any> }) {
  return (
    <div style={{
      backgroundColor: theme.surface.base,
      borderRadius: tokens.borderRadius.lg,
      border: `1px solid ${theme.border.default}`,
      padding: tokens.spacing.normal.md,
    }}>
      <div style={{
        fontWeight: tokens.typography.fontWeight.medium,
        color: theme.text.primary,
        marginBottom: tokens.spacing.normal.sm,
      }}>{client.name}</div>
      <div style={{
        fontSize: tokens.typography.fontSize.sm,
        color: theme.text.secondary,
        marginBottom: tokens.spacing.normal.md,
      }}>{client.industry}</div>
      <div style={{ fontSize: tokens.typography.fontSize.xs }} className="flex items-center justify-between">
        <span style={{ color: theme.text.secondary }}>{client.contactCount} contacts</span>
        <span style={{
          padding: `${tokens.spacing.normal.xs} ${tokens.spacing.normal.sm}`,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: client.status === 'active' ? theme.status.success.bg : theme.surface.muted,
          color: client.status === 'active' ? theme.status.success.text : theme.text.primary,
        }}>
          {client.status}
        </span>
      </div>
    </div>
  );
}

function ContactRow({ contact, theme, tokens }: { contact: CRMContact; theme: Record<string, any>; tokens: Record<string, any> }) {
  return (
    <div style={{
      backgroundColor: theme.surface.base,
      borderRadius: tokens.borderRadius.lg,
      border: `1px solid ${theme.border.default}`,
      padding: tokens.spacing.normal.md,
    }}>
      <div className="flex items-center justify-between">
        <div>
          <div style={{
            fontWeight: tokens.typography.fontWeight.medium,
            color: theme.text.primary,
          }}>{contact.name}</div>
          <div style={{
            fontSize: tokens.typography.fontSize.sm,
            color: theme.text.secondary,
          }}>{contact.email} • {contact.phone}</div>
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: theme.text.secondary,
        }}>{contact.clientName}</div>
      </div>
    </div>
  );
}

function OpportunityRow({ opportunity, theme, tokens }: { opportunity: CRMOpportunity; theme: Record<string, any>; tokens: Record<string, any> }) {
  return (
    <div style={{
      backgroundColor: theme.surface.base,
      borderRadius: tokens.borderRadius.lg,
      border: `1px solid ${theme.border.default}`,
      padding: tokens.spacing.normal.md,
    }}>
      <div className="flex items-center justify-between">
        <div>
          <div style={{
            fontWeight: tokens.typography.fontWeight.medium,
            color: theme.text.primary,
          }}>{opportunity.title}</div>
          <div style={{
            fontSize: tokens.typography.fontSize.sm,
            color: theme.text.secondary,
          }}>{opportunity.clientName}</div>
        </div>
        <div className="text-right">
          <div style={{
            fontWeight: tokens.typography.fontWeight.semibold,
            color: theme.text.primary,
          }}>${opportunity.value.toLocaleString()}</div>
          <div style={{
            fontSize: tokens.typography.fontSize.xs,
            color: theme.text.secondary,
          }}>{opportunity.stage}</div>
        </div>
      </div>
    </div>
  );
}
