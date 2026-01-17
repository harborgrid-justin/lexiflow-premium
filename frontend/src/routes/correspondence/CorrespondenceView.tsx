/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { FileText, Layout, Mail } from 'lucide-react';

import { Button } from '@/components/atoms/Button/Button';
import { PageHeader } from '@/components/organisms/PageHeader';

import { useCorrespondence } from './CorrespondenceProvider';

export function CorrespondenceView() {
  const { emails, letters, templates, metrics, activeTab, setActiveTab, isPending } = useCorrespondence();

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Correspondence" subtitle="Email and letter management">
        <Button variant="primary" size="md">
          <Mail className="w-4 h-4" />
          Compose
        </Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Emails" value={metrics.totalEmails} icon={<Mail className="w-5 h-5 text-blue-600" />} />
        <MetricCard title="Unread" value={metrics.unreadEmails} icon={<Mail className="w-5 h-5 text-amber-600" />} />
        <MetricCard title="Letters" value={metrics.totalLetters} icon={<FileText className="w-5 h-5 text-purple-600" />} />
        <MetricCard title="Templates" value={metrics.totalTemplates} icon={<Layout className="w-5 h-5 text-emerald-600" />} />
      </div>

      <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
        <nav className="flex space-x-4">
          <TabButton active={activeTab === 'emails'} onClick={() => setActiveTab('emails')} disabled={isPending}>
            Emails ({emails.length})
          </TabButton>
          <TabButton active={activeTab === 'letters'} onClick={() => setActiveTab('letters')} disabled={isPending}>
            Letters ({letters.length})
          </TabButton>
          <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} disabled={isPending}>
            Templates ({templates.length})
          </TabButton>
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'emails' && (
          <div className="space-y-2">
            {emails.map(email => (
              <EmailRow key={email.id} email={email} />
            ))}
          </div>
        )}
        {activeTab === 'letters' && (
          <div className="space-y-2">
            {letters.map(letter => (
              <LetterRow key={letter.id} letter={letter} />
            ))}
          </div>
        )}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <TemplateCard key={template.id} template={template} />
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

function TabButton({ active, onClick, disabled, children }: { active: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 dark:text-slate-400'
        }`}>
      {children}
    </button>
  );
}

function EmailRow({ email }: { email: CorrespondenceEmail }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 ${!email.read ? 'border-l-4 border-l-blue-500' : ''
      }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-slate-900 dark:text-white">{email.from}</div>
        <div className="text-sm text-slate-600 dark:text-slate-400">{new Date(email.date).toLocaleDateString()}</div>
      </div>
      <div className={`text-sm ${!email.read ? 'font-medium' : ''} text-slate-900 dark:text-white mb-1`}>
        {email.subject}
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400 truncate">{email.preview}</div>
    </div>
  );
}

function LetterRow({ letter }: { letter: CorrespondenceLetter }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{letter.title}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">To: {letter.recipient}</div>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {new Date(letter.date).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template }: { template: CorrespondenceTemplate }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4 hover:border-blue-500 transition-colors cursor-pointer">
      <Layout className="w-8 h-8 text-emerald-600 mb-2" />
      <div className="font-medium text-slate-900 dark:text-white mb-1">{template.name}</div>
      <div className="text-sm text-slate-600 dark:text-slate-400">{template.category}</div>
    </div>
  );
}
