
import { AuditLogEntry } from '../../types';
import { db, STORES } from '../db';

export const AdminService = {
    getLogs: async () => db.getAll<AuditLogEntry>(STORES.LOGS),
    addLog: async (entry: Omit<AuditLogEntry, 'id'>) => { 
        const log = { id: crypto.randomUUID(), ...entry };
        await db.put(STORES.LOGS, log);
        return log;
    },
    getIntegrations: async () => {
        return [
            { id: '1', name: 'Outlook / Exchange', type: 'Email & Calendar', status: 'Connected', icon: 'O', color: 'bg-blue-600' },
            { id: '2', name: 'iManage', type: 'DMS', status: 'Connected', icon: 'iM', color: 'bg-orange-500' },
        ];
    },
    connectIntegration: async (provider: string) => { return true; },
    getSecuritySettings: async () => {
        return [
            { id: '2fa', label: 'Enforce Two-Factor Authentication', desc: 'Require 2FA for all internal users.', enabled: true, type: 'Smartphone' },
            { id: 'sso', label: 'Single Sign-On (SSO)', desc: 'SAML 2.0 integration with Azure AD.', enabled: true, type: 'Lock' },
        ];
    }
};
