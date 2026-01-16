/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Messages & Communication Domain - View Component
 */

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/components/organisms/PageHeader';
import { Inbox, Mail, Send, Star } from 'lucide-react';
import React, { useId } from 'react';
import { useMessages } from './MessagesProvider';

export function MessagesView() {
  const { messages, unreadCount, filter, setFilter, searchTerm, setSearchTerm, isPending } = useMessages();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Messages"
        subtitle="Email and secure communications"
        actions={
          <Button variant="primary" size="md">
            <Send className="w-4 h-4" />
            Compose
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        <MetricCard
          icon={<Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          label="Total Messages"
          value={messages.length}
        />
        <MetricCard
          icon={<Inbox className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="Unread"
          value={unreadCount}
        />
        <MetricCard
          icon={<Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          label="Starred"
          value={messages.filter(m => m.starred).length}
        />
      </div>

      <div className="px-4 pb-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor={searchId} className="sr-only">Search messages</label>
            <input
              id={searchId}
              type="search"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
            <Inbox className="w-4 h-4" />
            All
          </FilterButton>
          <FilterButton active={filter === 'unread'} onClick={() => setFilter('unread')}>
            <Mail className="w-4 h-4" />
            Unread
          </FilterButton>
          <FilterButton active={filter === 'starred'} onClick={() => setFilter('starred')}>
            <Star className="w-4 h-4" />
            Starred
          </FilterButton>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        {isPending && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {!isPending && (
          <div className="space-y-2">
            {messages.map(message => (
              <MessageRow key={message.id} message={message} />
            ))}
            {messages.length === 0 && (
              <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                No messages found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${active
        ? 'bg-blue-600 text-white'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
    >
      {children}
    </button>
  );
}

type Message = {
  id: string;
  subject: string;
  from: string;
  to: string[];
  body: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  caseId?: string;
};

function MessageRow({ message }: { message: Message }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors ${!message.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
      }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`font-medium text-slate-900 dark:text-white ${!message.read ? 'font-semibold' : ''}`}>
              {message.subject}
            </div>
            {message.starred && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            From: {message.from}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">
            {message.body.substring(0, 100)}...
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-500">
          {new Date(message.timestamp).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
