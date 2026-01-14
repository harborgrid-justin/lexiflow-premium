import { Briefcase, UserPlus, Users } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { useCRM } from './CRMProvider';

export function CRMView() {
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
        <MetricCard title="Total Clients" value={metrics.totalClients} icon={<Users className="w-5 h-5 text-blue-600" />} />
        <MetricCard title="Active Clients" value={metrics.activeClients} icon={<Users className="w-5 h-5 text-emerald-600" />} />
        <MetricCard title="Contacts" value={metrics.totalContacts} icon={<UserPlus className="w-5 h-5 text-purple-600" />} />
        <MetricCard title="Opportunities" value={metrics.openOpportunities} icon={<Briefcase className="w-5 h-5 text-amber-600" />} />
      </div>

      <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
        <nav className="flex space-x-4">
          <TabButton active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} disabled={isPending}>
            Clients ({clients.length})
          </TabButton>
          <TabButton active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} disabled={isPending}>
            Contacts ({contacts.length})
          </TabButton>
          <TabButton active={activeTab === 'opportunities'} onClick={() => setActiveTab('opportunities')} disabled={isPending}>
            Opportunities ({opportunities.length})
          </TabButton>
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'clients' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map(client => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
        {activeTab === 'contacts' && (
          <div className="space-y-2">
            {contacts.map(contact => (
              <ContactRow key={contact.id} contact={contact} />
            ))}
          </div>
        )}
        {activeTab === 'opportunities' && (
          <div className="space-y-2">
            {opportunities.map(opp => (
              <OpportunityRow key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function TabButton({ active, onClick, disabled, children }: any) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 dark:text-slate-400'
        }`}>
      {children}
    </button>
  );
}

function ClientCard({ client }: { client: any }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="font-medium text-slate-900 dark:text-white mb-2">{client.name}</div>
      <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">{client.industry}</div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">{client.contactCount} contacts</span>
        <span className={`px-2 py-1 rounded-full ${client.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
          }`}>
          {client.status}
        </span>
      </div>
    </div>
  );
}

function ContactRow({ contact }: { contact: any }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{contact.name}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{contact.email} • {contact.phone}</div>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">{contact.clientName}</div>
      </div>
    </div>
  );
}

function OpportunityRow({ opportunity }: { opportunity: any }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{opportunity.title}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{opportunity.clientName}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-slate-900 dark:text-white">${opportunity.value.toLocaleString()}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">{opportunity.stage}</div>
        </div>
      </div>
    </div>
  );
}
