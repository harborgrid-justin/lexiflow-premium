/**
 * War Room Domain - View Component
 */

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/shared/ui/organisms/PageHeader';
import { Calendar, MapPin, Plus, Users } from 'lucide-react';
import React from 'react';
import { useWarRoom } from './WarRoomProvider';

export function WarRoomView() {
  const { sessions, statusFilter, setStatusFilter, metrics } = useWarRoom();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="War Room"
        subtitle="Collaborative case strategy sessions"
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            New Session
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        <MetricCard
          icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          label="Total Sessions"
          value={metrics.totalSessions}
        />
        <MetricCard
          icon={<Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="Scheduled"
          value={metrics.scheduled}
        />
        <MetricCard
          icon={<Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          label="In Progress"
          value={metrics.inProgress}
        />
      </div>

      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <FilterButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
            All
          </FilterButton>
          <FilterButton active={statusFilter === 'Scheduled'} onClick={() => setStatusFilter('Scheduled')}>
            Scheduled
          </FilterButton>
          <FilterButton active={statusFilter === 'In Progress'} onClick={() => setStatusFilter('In Progress')}>
            In Progress
          </FilterButton>
          <FilterButton active={statusFilter === 'Completed'} onClick={() => setStatusFilter('Completed')}>
            Completed
          </FilterButton>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))}
          {sessions.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">
              No sessions found
            </div>
          )}
        </div>
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
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${active
        ? 'bg-blue-600 text-white'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
    >
      {children}
    </button>
  );
}

type WarRoomSession = {
  id: string;
  caseId: string;
  caseName: string;
  date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  participants: string[];
  agenda: string;
  location: string;
};

const statusColors = {
  'Scheduled': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'In Progress': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'Completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
};

function SessionCard({ session }: { session: WarRoomSession }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[session.status]}`}>
          {session.status}
        </span>
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
        {session.caseName}
      </h3>
      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {new Date(session.date).toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {session.location}
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          {session.participants.length} participants
        </div>
      </div>
      <div className="text-sm">
        <div className="font-medium text-slate-900 dark:text-white mb-1">Agenda:</div>
        <div className="text-slate-600 dark:text-slate-400 line-clamp-2">
          {session.agenda}
        </div>
      </div>
    </div>
  );
}
