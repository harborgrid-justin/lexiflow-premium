/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';

interface AdminContextValue {
  users: unknown[];
  settings: unknown;
  auditLogs: unknown[];
  activeTab: 'users' | 'settings' | 'audit' | 'health';
  setActiveTab: (tab: 'users' | 'settings' | 'audit' | 'health') => void;
  isPending: boolean;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children, initialUsers, initialSettings, initialAuditLogs }: {
  children: React.ReactNode;
  initialUsers: unknown[];
  initialSettings: unknown;
  initialAuditLogs: unknown[];
}) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTabState] = useState<'users' | 'settings' | 'audit' | 'health'>('users');

  const setActiveTab = useCallback((tab: typeof activeTab) => {
    startTransition(() => setActiveTabState(tab));
  }, []);

  const value = useMemo<AdminContextValue>(() => ({
    users: initialUsers,
    settings: initialSettings,
    auditLogs: initialAuditLogs,
    activeTab,
    setActiveTab,
    isPending
  }), [initialUsers, initialSettings, initialAuditLogs, activeTab, setActiveTab, isPending]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}
