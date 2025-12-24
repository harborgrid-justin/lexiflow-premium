import { AuditLogEntry, RLSPolicy, RolePermission, ApiKey, PipelineJob, DataAnomaly, UUID, PermissionLevel, TenantConfig, Connector, GovernanceRule, GovernancePolicy, ApiServiceSpec } from '../../types';
/**
 * ? Migrated to backend API (2025-12-21)
 */
import { adminApi } from "@/api/domains/admin.api";
import { ChainService } from '../infrastructure/chainService';
import { MOCK_API_SPEC } from '@/api/data/mockApiSpec';
import { API_PREFIX } from '../../config/network/api.config';
import { delay } from '@/utils/async';

export const AdminService = {
    // Real backend API access
    getLogs: async (): Promise<AuditLogEntry[]> => {
        try {
            const response = await adminApi.auditLogs?.getAll?.();
            if (!response) return [];

            // Handle paginated response from backend
            const logs: AuditLogEntry[] = Array.isArray(response) ? response :
                (response && typeof response === 'object' && 'data' in response ? (response as { data: AuditLogEntry[] }).data : []);

            return logs.sort((a: AuditLogEntry, b: AuditLogEntry) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
        } catch (error) {
            console.error('[AdminService.getLogs] Error fetching audit logs:', error);
            return [];
        }
    },
    
    // Integrations from backend
    getIntegrations: async (): Promise<Array<{ id: string; name: string; type: string; status: string; icon: string; color: string }>> => {
        try {
            // Use integrations API from backend
            const response = await fetch(`${API_PREFIX}/integrations`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
                },
            });

            if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
                const integrations = await response.json();
                return integrations.map((int: { id: string; name: string; type: string; status: string }) => ({
                    id: int.id,
                    name: int.name,
                    type: int.type,
                    status: int.status,
                    icon: int.name.charAt(0).toUpperCase(),
                    color: int.status === 'Connected' ? 'bg-blue-600' : int.status === 'Error' ? 'bg-red-600' : 'bg-gray-600'
                }));
            }
        } catch (error) {
            console.error('[AdminService.getIntegrations] Backend unavailable:', error);
        }

        // Fallback to mock data for development
        await delay(500);
        return [
            { id: 'int1', name: 'Outlook 365', type: 'Email & Calendar', status: 'Connected', icon: 'O', color: 'bg-blue-600' },
            { id: 'int2', name: 'Salesforce', type: 'CRM', status: 'Error', icon: 'S', color: 'bg-sky-500' },
            { id: 'int3', name: 'QuickBooks', type: 'Accounting', status: 'Disconnected', icon: 'Q', color: 'bg-green-600' },
            { id: 'int4', name: 'Clio', type: 'Practice Mgmt', status: 'Connected', icon: 'C', color: 'bg-indigo-600' },
        ];
    },

    getSecuritySettings: async (): Promise<Array<{ id: string; label: string; desc: string; type: string; enabled: boolean }>> => {
        try {
            // Attempt to fetch from backend
            const response = await fetch(`${API_PREFIX}/admin/security-settings`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
                },
            });

            if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
                return await response.json();
            }
        } catch (error) {
            console.error('[AdminService.getSecuritySettings] Backend unavailable:', error);
        }

        // Fallback to default security settings
        await delay(300);
        return [
            { id: 'sec1', label: 'Require MFA', desc: 'All internal users must use 2-factor authentication.', type: 'Lock', enabled: true },
            { id: 'sec2', label: 'Session Timeout', desc: 'Inactive sessions are logged out after 4 hours.', type: 'Clock', enabled: true },
            { id: 'sec3', label: 'IP Whitelisting', desc: 'Restrict access to specific IP ranges.', type: 'Globe', enabled: false },
        ];
    },

    // RLS Policies from backend
    getRLSPolicies: async (): Promise<RLSPolicy[]> => { 
        const policies = await adminApi.rlsPolicies?.getAll?.();
        if (policies && policies.length > 0) return policies;
        
        // Fallback to mock data
        await delay(200); 
        return [
            { id: 'rls1', name: 'tenant_isolation_cases', table: 'cases', cmd: 'ALL', roles: ['All'], using: "org_id = current_setting('app.current_org_id')::uuid", status: 'Active' },
            { id: 'rls2', name: 'partner_view_billing', table: 'billing', cmd: 'SELECT', roles: ['Partner'], using: "true", status: 'Active' },
            { id: 'rls3', name: 'associate_edit_own_time', table: 'time_entries', cmd: 'UPDATE', roles: ['Associate'], using: "user_id = auth.uid()", status: 'Active' }
        ]; 
    },
    saveRLSPolicy: async (policy: Partial<RLSPolicy>): Promise<unknown> => { 
        return adminApi.rlsPolicies?.create?.(policy) || policy;
    },
    deleteRLSPolicy: async (id: string): Promise<void> => { 
        await adminApi.rlsPolicies?.delete?.(id);
    },
    
    // Permissions from backend
    getPermissions: async (): Promise<RolePermission[]> => { 
        return adminApi.permissions?.getAll?.() || [{id: 'p1', role: 'Associate', resource: 'Financials', access: 'Read'}];
    },
    updatePermission: async (payload: { role: string, resource: string, level: string }): Promise<unknown> => { 
        return adminApi.permissions?.update?.(payload) || payload;
    },
    
    // Data Platform - ETL Pipelines
    getPipelines: async (): Promise<PipelineJob[]> => { 
        return adminApi.pipelines?.getAll?.() || [];
    },
    getApiKeys: async (): Promise<ApiKey[]> => { 
        return adminApi.apiKeys?.getAll?.() || [{id: 'key_1', name: 'Default Key', prefix: 'pk_live_ab12...', created: '2024-01-01', status: 'Active'}];
    },
    
    getAnomalies: async (): Promise<DataAnomaly[]> => {
        try {
            // Use data quality API endpoint
            const response = await fetch(`${API_PREFIX}/data-platform/anomalies`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
                },
            });

            if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
                return await response.json();
            }
        } catch (error) {
            console.error('[AdminService.getAnomalies] Backend unavailable:', error);
        }

        // Fallback to mock data for development
        await delay(600);
        return [
            { id: 1, table: 'clients', field: 'email', issue: 'Invalid Format', count: 12, sample: 'john-doe@', status: 'Detected', severity: 'High'},
            { id: 2, table: 'cases', field: 'status', issue: 'Inconsistent Casing', count: 5, sample: 'closed', status: 'Fixed', severity: 'Low'},
            { id: 3, table: 'documents', field: 'metadata', issue: 'Missing Author', count: 142, sample: 'NULL', status: 'Detected', severity: 'Medium'},
        ];
    },
    
    getDataDomains: async (): Promise<Array<{ name: string; count: number; desc: string }>> => {
        try {
            // Use data platform API endpoint
            const response = await fetch(`${API_PREFIX}/data-platform/domains`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
                },
            });

            if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
                return await response.json();
            }
        } catch (error) {
            console.error('[AdminService.getDataDomains] Backend unavailable:', error);
        }

        // Fallback to default domains
        await delay(200);
        return [
            { name: 'Legal', count: 12, desc: 'Core case and litigation data.'},
            { name: 'Finance', count: 8, desc: 'Billing, invoices, and trust accounts.' },
            { name: 'HR', count: 4, desc: 'Staff, roles, and performance data.' },
        ];
    },
    
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
                return connections.map((conn: unknown) => ({
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
