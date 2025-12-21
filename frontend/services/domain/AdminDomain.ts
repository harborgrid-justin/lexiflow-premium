import { AuditLogEntry, RLSPolicy, RolePermission, ApiKey, PipelineJob, DataAnomaly, UUID, PermissionLevel, TenantConfig, Connector, GovernanceRule, GovernancePolicy, ApiServiceSpec } from '../../types';
// TODO: Migrate to backend API - IndexedDB deprecated
import { db, STORES } from '../data/db';
import { ChainService } from '../infrastructure/chainService';
import { MOCK_API_SPEC } from '../../data/mockApiSpec';
import { API_PREFIX } from '../../config/network/api.config';
import { delay } from '../../utils/async';

export const AdminService = {
    // Real DB Access
    getLogs: async (): Promise<AuditLogEntry[]> => {
        const logs = await db.getAll<AuditLogEntry>(STORES.LOGS);
        return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    
    // Simulations (Infra)
    getIntegrations: async () => { 
        await delay(500); 
        return [
            { id: 'int1', name: 'Outlook 365', type: 'Email & Calendar', status: 'Connected', icon: 'O', color: 'bg-blue-600' },
            { id: 'int2', name: 'Salesforce', type: 'CRM', status: 'Error', icon: 'S', color: 'bg-sky-500' },
            { id: 'int3', name: 'QuickBooks', type: 'Accounting', status: 'Disconnected', icon: 'Q', color: 'bg-green-600' },
            { id: 'int4', name: 'Clio', type: 'Practice Mgmt', status: 'Connected', icon: 'C', color: 'bg-indigo-600' },
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

    // RLS Mock
    getRLSPolicies: async (): Promise<RLSPolicy[]> => { 
        await delay(200); 
        return [
            { id: 'rls1', name: 'tenant_isolation_cases', table: 'cases', cmd: 'ALL', roles: ['All'], using: "org_id = current_setting('app.current_org_id')::uuid", status: 'Active' },
            { id: 'rls2', name: 'partner_view_billing', table: 'billing', cmd: 'SELECT', roles: ['Partner'], using: "true", status: 'Active' },
            { id: 'rls3', name: 'associate_edit_own_time', table: 'time_entries', cmd: 'UPDATE', roles: ['Associate'], using: "user_id = auth.uid()", status: 'Active' }
        ]; 
    },
    saveRLSPolicy: async (policy: Partial<RLSPolicy>): Promise<any> => { await delay(100); return policy; },
    deleteRLSPolicy: async (id: string): Promise<void> => { await delay(100); },
    
    // Permissions
    getPermissions: async (): Promise<RolePermission[]> => { await delay(200); return [ {id: 'p1', role: 'Associate', resource: 'Financials', access: 'Read'} ]; },
    updatePermission: async (payload: { role: string, resource: string, level: string }): Promise<any> => { await delay(100); return payload; },
    
    // Data Platform - ETL Pipelines
    getPipelines: async (): Promise<PipelineJob[]> => { 
        try {
            const response = await fetch(`${API_PREFIX}/admin/pipelines`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
                },
            });
            if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
                return await response.json();
            }
        } catch (error) {
            // Silently fail - backend not available
        }
        
        // Backend not available - return empty or disconnected state
        await delay(200);
        return [];
    },
    getApiKeys: async (): Promise<ApiKey[]> => { await delay(100); return [{id: 'key_1', name: 'Default Key', prefix: 'pk_live_ab12...', created: '2024-01-01', status: 'Active'}]; },
    
    getAnomalies: async (): Promise<DataAnomaly[]> => { 
        await delay(600); 
        return [
            { id: 1, table: 'clients', field: 'email', issue: 'Invalid Format', count: 12, sample: 'john-doe@', status: 'Detected', severity: 'High'},
            { id: 2, table: 'cases', field: 'status', issue: 'Inconsistent Casing', count: 5, sample: 'closed', status: 'Fixed', severity: 'Low'},
            { id: 3, table: 'documents', field: 'metadata', issue: 'Missing Author', count: 142, sample: 'NULL', status: 'Detected', severity: 'Medium'},
        ]; 
    },
    
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
        try {
            // Fetch from backend data-sources API
            const response = await fetch(`${API_PREFIX}/integrations/data-sources`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
                },
            });
            if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
                const connections = await response.json();
                // Transform backend response to connector format
                return connections.map((conn: any) => ({
                    id: conn.id,
                    name: conn.name,
                    type: conn.type,
                    status: conn.status === 'active' ? 'Healthy' : conn.status === 'syncing' ? 'Syncing' : 'Disconnected',
                    color: conn.type === 'PostgreSQL' ? 'text-blue-600' : 
                           conn.type === 'Snowflake' ? 'text-sky-500' : 'text-gray-600'
                }));
            }
        } catch (error) {
            // Silently fail - backend not available
        }
        
        // Backend not available - return disconnected connectors based on backend support
        await delay(200);
        return [
          { id: 'c1', name: 'Primary Warehouse', type: 'Snowflake', status: 'Disconnected', color: 'text-sky-500' },
          { id: 'c2', name: 'Legacy Archive', type: 'PostgreSQL', status: 'Disconnected', color: 'text-blue-600' },
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
    },

    getApiSpec: async (): Promise<ApiServiceSpec[]> => {
        await delay(100);
        return MOCK_API_SPEC;
    }
};
