
import { AuditLogEntry, RLSPolicy, RolePermission, ApiKey, PipelineJob, DataAnomaly } from '../../types';
import { db, STORES } from '../db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data for RLS Policies
let policiesStore: RLSPolicy[] = [
    { id: 'pol-1', name: 'tenant_isolation', table: 'all_tables', cmd: 'ALL', roles: ['All'], using: "org_id = current_setting('app.current_org_id')::uuid", status: 'Active' },
    { id: 'pol-2', name: 'client_case_access', table: 'cases', cmd: 'SELECT', roles: ['Client'], using: "EXISTS (SELECT 1 FROM case_parties WHERE case_id = cases.id AND party_id = current_user_id())", status: 'Active' },
    { id: 'pol-3', name: 'ethical_wall_barrier', table: 'documents', cmd: 'ALL', roles: ['All'], using: "NOT EXISTS (SELECT 1 FROM ethical_walls WHERE case_id = documents.case_id AND current_user_id() = ANY(restricted_users))", status: 'Active' },
    { id: 'pol-4', name: 'admin_override', table: 'audit_logs', cmd: 'SELECT', roles: ['Administrator'], using: "true", status: 'Active' }
];

// Mock Data for Permissions Matrix
let permissionsStore: RolePermission[] = [
    // Cases
    { id: 'perm-1', role: 'Administrator', resource: 'Cases', access: 'Full' },
    { id: 'perm-2', role: 'Partner', resource: 'Cases', access: 'Full' },
    { id: 'perm-3', role: 'Associate', resource: 'Cases', access: 'Write' },
    { id: 'perm-4', role: 'Paralegal', resource: 'Cases', access: 'Write' },
    { id: 'perm-5', role: 'Client', resource: 'Cases', access: 'Own' },
    
    // Financials
    { id: 'perm-6', role: 'Administrator', resource: 'Financials', access: 'Full' },
    { id: 'perm-7', role: 'Partner', resource: 'Financials', access: 'Full' },
    { id: 'perm-8', role: 'Associate', resource: 'Financials', access: 'None' },
    { id: 'perm-9', role: 'Paralegal', resource: 'Financials', access: 'None' },
    { id: 'perm-10', role: 'Client', resource: 'Financials', access: 'None' },

    // Audit Logs
    { id: 'perm-11', role: 'Administrator', resource: 'Audit Logs', access: 'Read' },
    { id: 'perm-12', role: 'Partner', resource: 'Audit Logs', access: 'Read' },
    { id: 'perm-13', role: 'Associate', resource: 'Audit Logs', access: 'None' },
    { id: 'perm-14', role: 'Paralegal', resource: 'Audit Logs', access: 'None' },
    { id: 'perm-15', role: 'Client', resource: 'Audit Logs', access: 'None' },

    // Security Settings
    { id: 'perm-16', role: 'Administrator', resource: 'Security Settings', access: 'Full' },
    { id: 'perm-17', role: 'Partner', resource: 'Security Settings', access: 'Read' },
    { id: 'perm-18', role: 'Associate', resource: 'Security Settings', access: 'None' },
    { id: 'perm-19', role: 'Paralegal', resource: 'Security Settings', access: 'None' },
    { id: 'perm-20', role: 'Client', resource: 'Security Settings', access: 'None' },
];

export const AdminService = {
    getLogs: async (): Promise<AuditLogEntry[]> => db.getAll<AuditLogEntry>(STORES.LOGS),
    
    addLog: async (entry: Omit<AuditLogEntry, 'id'>): Promise<AuditLogEntry> => { 
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

    // --- RLS & Permissions ---

    getRLSPolicies: async (): Promise<RLSPolicy[]> => {
        await delay(200);
        return [...policiesStore];
    },

    saveRLSPolicy: async (policy: Partial<RLSPolicy>): Promise<RLSPolicy | undefined> => {
        await delay(300);
        if (policy.id) {
            policiesStore = policiesStore.map(p => p.id === policy.id ? { ...p, ...policy } as RLSPolicy : p);
            return policiesStore.find(p => p.id === policy.id);
        } else {
            const newPolicy = {
                id: `pol-${Date.now()}`,
                name: policy.name || 'New Policy',
                table: policy.table || 'all',
                cmd: policy.cmd || 'SELECT',
                roles: policy.roles || ['All'],
                using: policy.using || 'true',
                status: 'Active',
                ...policy
            } as RLSPolicy;
            policiesStore.push(newPolicy);
            return newPolicy;
        }
    },

    deleteRLSPolicy: async (id: string): Promise<void> => {
        await delay(200);
        policiesStore = policiesStore.filter(p => p.id !== id);
    },

    getPermissions: async (): Promise<RolePermission[]> => {
        await delay(200);
        return [...permissionsStore];
    },

    updatePermission: async (payload: { role: string, resource: string, level: string }): Promise<RolePermission | undefined> => {
        await delay(100);
        const idx = permissionsStore.findIndex(p => p.role === payload.role && p.resource === payload.resource);
        if (idx !== -1) {
            permissionsStore[idx] = { ...permissionsStore[idx], access: payload.level as any };
        } else {
            permissionsStore.push({ id: `perm-${Date.now()}`, role: payload.role, resource: payload.resource, access: payload.level as any });
        }
        return permissionsStore.find(p => p.role === payload.role && p.resource === payload.resource);
    },

    // --- Data Platform Services ---

    getPipelines: async (): Promise<PipelineJob[]> => {
        await delay(50); // Sim network
        return [
            { id: 'p1', name: 'PACER Sync (Hourly)', status: 'Running', lastRun: '2 mins ago', duration: '45s', volume: '12MB', schedule: 'Hourly (00:00)', logs: ['[INFO] Connecting to PACER API...', '[INFO] Auth Success', '[INFO] Fetching updates...', '[WARN] Rate limit approaching'] },
            { id: 'p2', name: 'Email Archival', status: 'Idle', lastRun: '15 mins ago', duration: '1m 20s', volume: '250MB', schedule: 'Continuous', logs: ['[INFO] Monitoring Exchange...', '[INFO] 150 items archived'] },
            { id: 'p3', name: 'Data Warehouse ETL', status: 'Failed', lastRun: '4 hours ago', duration: 'Failed', volume: '0KB', schedule: 'Daily (02:00)', logs: ['[INFO] Starting batch load', '[ERROR] Connection Timeout: Warehouse DB unavailble'] },
            { id: 'p4', name: 'Search Indexing', status: 'Success', lastRun: '10 mins ago', duration: '5m', volume: '45MB', schedule: 'Every 15m', logs: ['[INFO] Reindexing elastic', '[INFO] Success'] },
        ];
    },

    getApiKeys: async (): Promise<ApiKey[]> => {
        await delay(50);
        return [
            { id: 'k1', name: 'Production App', prefix: 'pk_live_...', created: '2023-11-01', status: 'Active' },
            { id: 'k2', name: 'Dev Environment', prefix: 'pk_test_...', created: '2024-01-15', status: 'Active' },
            { id: 'k3', name: 'Partner Integration', prefix: 'pk_part_...', created: '2024-02-20', status: 'Revoked' },
        ];
    },

    getAnomalies: async (): Promise<DataAnomaly[]> => {
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
