
import { AuditLogEntry } from '../../types';
import { db, STORES } from '../db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
            { id: '3', name: 'Salesforce', type: 'CRM', status: 'Disconnected', icon: 'SF', color: 'bg-blue-400' },
            { id: '4', name: 'Relativity', type: 'eDiscovery', status: 'Connected', icon: 'R', color: 'bg-amber-600' },
        ];
    },
    
    connectIntegration: async (provider: string) => { return true; },
    
    getSecuritySettings: async () => {
        return [
            { id: '2fa', label: 'Enforce Two-Factor Authentication', desc: 'Require 2FA for all internal users.', enabled: true, type: 'Smartphone' },
            { id: 'sso', label: 'Single Sign-On (SSO)', desc: 'SAML 2.0 integration with Azure AD.', enabled: true, type: 'Lock' },
            { id: 'ip_restrict', label: 'IP Allowlisting', desc: 'Restrict access to corporate VPN IPs.', enabled: false, type: 'Globe' },
            { id: 'session', label: 'Session Timeout (15m)', desc: 'Auto-logout inactive users.', enabled: true, type: 'Clock' },
        ];
    },

    // --- Data Platform Services ---

    getPipelines: async () => {
        await delay(50); // Sim network
        return [
            { id: 'p1', name: 'PACER Sync (Hourly)', status: 'Running', lastRun: '2 mins ago', duration: '45s', volume: '12MB', schedule: 'Hourly (00:00)', logs: ['[INFO] Connecting to PACER API...', '[INFO] Auth Success', '[INFO] Fetching updates...', '[WARN] Rate limit approaching'] },
            { id: 'p2', name: 'Email Archival', status: 'Idle', lastRun: '15 mins ago', duration: '1m 20s', volume: '250MB', schedule: 'Continuous', logs: ['[INFO] Monitoring Exchange...', '[INFO] 150 items archived'] },
            { id: 'p3', name: 'Data Warehouse ETL', status: 'Failed', lastRun: '4 hours ago', duration: 'Failed', volume: '0KB', schedule: 'Daily (02:00)', logs: ['[INFO] Starting batch load', '[ERROR] Connection Timeout: Warehouse DB unavailble'] },
            { id: 'p4', name: 'Search Indexing', status: 'Success', lastRun: '10 mins ago', duration: '5m', volume: '45MB', schedule: 'Every 15m', logs: ['[INFO] Reindexing elastic', '[INFO] Success'] },
        ];
    },

    getApiKeys: async () => {
        await delay(50);
        return [
            { id: 'k1', name: 'Production App', prefix: 'pk_live_...', created: '2023-11-01', status: 'Active' },
            { id: 'k2', name: 'Dev Environment', prefix: 'pk_test_...', created: '2024-01-15', status: 'Active' },
            { id: 'k3', name: 'Partner Integration', prefix: 'pk_part_...', created: '2024-02-20', status: 'Revoked' },
        ];
    },

    getAnomalies: async () => {
        await delay(50);
        return [
            { id: 1, table: 'Parties', field: 'phone', issue: 'Invalid Format', count: 142, sample: '123-456', status: 'Detected', severity: 'Medium' },
            { id: 2, table: 'Cases', field: 'status', issue: 'Unknown Enum', count: 5, sample: 'Pending Review (Legacy)', status: 'Detected', severity: 'High' },
            { id: 3, table: 'Documents', field: 'size', issue: 'Missing Value', count: 450, sample: 'null', status: 'Detected', severity: 'Low' },
            { id: 4, table: 'Clients', field: 'email', issue: 'Invalid Domain', count: 23, sample: 'user@gmial.com', status: 'Detected', severity: 'High' },
        ];
    },

    getDataDomains: async () => {
        await delay(50);
        return [
            { name: 'Client Master', count: 12, desc: 'Authoritative source for client entities.' },
            { name: 'Case Facts', count: 8, desc: 'Litigation details and metadata.' },
            { name: 'Financial Ledger', count: 24, desc: 'Billing, expenses, and trust accounting.' },
            { name: 'Document Metadata', count: 45, desc: 'File properties and version history.' },
            { name: 'Entity Graph', count: 6, desc: 'Relationship mapping nodes.' },
            { name: 'Communications', count: 15, desc: 'Email and secure message logs.' }
        ];
    }
};
