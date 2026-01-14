import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';

interface AdminContextValue {
  users: any[];
  settings: any;
  auditLogs: any[];
  activeTab: 'users' | 'settings' | 'audit';
  setActiveTab: (tab: 'users' | 'settings' | 'audit') => void;
  isPending: boolean;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children, initialUsers, initialSettings, initialAuditLogs }: {
  children: React.ReactNode;
  initialUsers: any[];
  initialSettings: any;
  initialAuditLogs: any[];
}) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTabState] = useState<'users' | 'settings' | 'audit'>('users');

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
