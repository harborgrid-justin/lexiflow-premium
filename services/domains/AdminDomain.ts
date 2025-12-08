
import { AuditLogEntry, RLSPolicy, RolePermission, ApiKey, PipelineJob, DataAnomaly, UUID, PermissionLevel, TenantConfig, Connector, GovernanceRule, GovernancePolicy } from '../../types';
import { db, STORES } from '../db';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const AdminService = {
    getLogs: async (): Promise<AuditLogEntry[]> => db.getAll<AuditLogEntry>(STORES.LOGS),
    getIntegrations: async () => { 
        await delay(500); 
        return [
            { id: 'int1', name: 'Outlook 365', type: 'Email & Calendar', status: 'Connected', icon: 'O', color: 'bg-blue-600' },
            { id: 'int2', name: 'Salesforce', type: 'CRM', status: 'Error', icon: 'S', color: 'bg-sky-500' },
            { id: 'int3', name: 'QuickBooks', type: 'Accounting', status: 'Disconnected', icon: 'Q', color: 'bg-green-600' },
        ]; 
    },
    getSecuritySettings: async () => { 
        await delay(300);
        return [
            { id: 'sec1', label: 'Require MFA', desc: 'All internal users must use 2-factor authentication.', type: 'Lock', enabled: true },
            { id: 'sec2', label: 'Session Timeout', desc: 'Inactive sessions are logged out after 4 hours.', type: 'Clock', enabled: true },
            { id: 'sec3', label: 'IP Whitelisting', desc: 'Restrict access to specific IP ranges.', type: 'Globe', enabled: false },
        ];
    },
    getRLSPolicies: async (): Promise<RLSPolicy[]> => { await delay(200); return [{ id: 'rls1', name: 'tenant_isolation_cases', table: 'cases', cmd: 'ALL', roles: ['All'], using: "org_id = current_setting('app.current_org_id')::uuid", status: 'Active' }]; },
    saveRLSPolicy: async (policy: Partial<RLSPolicy>): Promise<any> => { await delay(100); return policy; },
    deleteRLSPolicy: async (id: string): Promise<void> => { await delay(100); },
    getPermissions: async (): Promise<RolePermission[]> => { await delay(200); return [ {id: 'p1', role: 'Associate', resource: 'Financials', access: 'Read'} ]; },
    updatePermission: async (payload: { role: string, resource: string, level: string }): Promise<any> => { await delay(100); return payload; },
    getPipelines: async (): Promise<PipelineJob[]> => { 
        await delay(400); 
        return [
            { id: 'pipe1', name: 'Nightly ECF Sync', status: 'Success', lastRun: '2 hours ago', duration: '15m 30s', volume: '1.2 GB', schedule: '02:00 UTC', logs: ['[INFO] Job Started', '[INFO] Fetched 12 new dockets', '[SUCCESS] Job Completed'] },
            { id: 'pipe2', name: 'CRM Contact Ingestion', status: 'Running', lastRun: '1 day ago', duration: '5m 10s', volume: '2.1 MB', schedule: 'Daily', logs: ['[INFO] Job Started', '[INFO] Connecting to Salesforce API...', '[WARN] Rate limit approaching'] },
            { id: 'pipe3', name: 'Billing Data Warehouse Load', status: 'Failed', lastRun: '3 hours ago', duration: '2m 05s', volume: '250 MB', schedule: 'Hourly', logs: ['[INFO] Job Started', '[ERROR] Connection to Snowflake timed out.'] },
        ];
    },
    getApiKeys: async (): Promise<ApiKey[]> => { await delay(100); return [{id: 'key_1', name: 'Default Key', prefix: 'pk_live_ab12...', created: '2024-01-01', status: 'Active'}]; },
    getAnomalies: async (): Promise<DataAnomaly[]> => { await delay(600); return [
        { id: 1, table: 'clients', field: 'email', issue: 'Invalid Format', count: 12, sample: 'john-doe@', status: 'Detected', severity: 'High'},
        { id: 2, table: 'cases', field: 'status', issue: 'Inconsistent Casing', count: 5, sample: 'closed', status: 'Fixed', severity: 'Low'},
    ]; },
    getDataDomains: async () => { await delay(200); return [
        { name: 'Legal', count: 12, desc: 'Core case and litigation data.'},
        { name: 'Finance', count: 8, desc: 'Billing, invoices, and trust accounts.' },
        { name: 'HR', count: 4, desc: 'Staff, roles, and performance data.' },
    ]; },
    getTenantConfig: async (): Promise<TenantConfig> => {
        await delay(100);
        return { name: 'LexiFlow', tier: 'Enterprise Suite', version: '2.5', region: 'US-East-1' };
    },
    getConnectors: async (): Promise<Connector[]> => {
        await delay(200);
        return [
          { id: 'c1', name: 'PostgreSQL Production', type: 'Database', status: 'Healthy', color: 'text-blue-600' },
          { id: 'c2', name: 'Snowflake Warehouse', type: 'Warehouse', status: 'Healthy', color: 'text-sky-500' },
          { id: 'c3', name: 'Salesforce CRM', type: 'SaaS', status: 'Syncing', color: 'text-indigo-600' },
          { id: 'c4', name: 'AWS S3 Data Lake', type: 'Storage', status: 'Healthy', color: 'text-amber-600' },
          { id: 'c5', name: 'Redis Cache', type: 'Cache', status: 'Degraded', color: 'text-red-600' },
        ];
    },
    getGovernanceRules: async (): Promise<GovernanceRule[]> => {
        await delay(200);
        return [
            { id: 1, name: 'PII Encryption', status: 'Enforced', impact: 'High', passing: '100%', desc: 'All columns tagged PII must be encrypted at rest.' },
            { id: 2, name: 'Duplicate Detection', status: 'Monitoring', impact: 'Medium', passing: '98.2%', desc: 'Flag records with >95% similarity in core fields.' },
            { id: 3, name: 'Retention Policy (7 Years)', status: 'Enforced', impact: 'Critical', passing: '100%', desc: 'Hard delete case data 7 years after closure.' },
        ];
    },
    getGovernancePolicies: async (): Promise<GovernancePolicy[]> => {
        await delay(200);
        return [
            { id: 'pol1', title: 'Data Retention Standard', version: '2.4', status: 'Active', date: '2024-01-15' },
            { id: 'pol2', title: 'Access Control Policy', version: '1.1', status: 'Review', date: '2023-11-30' },
            { id: 'pol3', title: 'GDPR Compliance Guide', version: '3.0', status: 'Active', date: '2024-02-10' }
        ];
    }
};
