import { AuditLogEntry, RLSPolicy, RolePermission, ApiKey, PipelineJob, DataAnomaly, UUID } from '../../types';
import { db, STORES } from '../db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data for RLS Policies
let policiesStore: RLSPolicy[] = [
    { id: 'pol-1' as UUID, name: 'tenant_isolation', table: 'all_tables', cmd: 'ALL', roles: ['All'], using: "org_id = current_setting('app.current_org_id')::uuid", status: 'Active' },
    { id: 'pol-2' as UUID, name: 'client_case_access', table: 'cases', cmd: 'SELECT', roles: ['Client'], using: "EXISTS (SELECT 1 FROM case_parties WHERE case_id = cases.id AND party_id = current_user_id())", status: 'Active' },
    { id: 'pol-3' as UUID, name: 'ethical_wall_barrier', table: 'documents', cmd: 'ALL', roles: ['All'], using: "NOT EXISTS (SELECT 1 FROM ethical_walls WHERE case_id = documents.case_id AND current_user_id() = ANY(restricted_users))", status: 'Active' },
    { id: 'pol-4' as UUID, name: 'admin_override', table: 'audit_logs', cmd: 'SELECT', roles: ['Administrator'], using: "true", status: 'Active' }
];

// Mock Data for Permissions Matrix
let permissionsStore: RolePermission[] = [
    // Cases
    { id: 'perm-1' as UUID, role: 'Administrator', resource: 'Cases', access: 'Full' },
    { id: 'perm-2' as UUID, role: 'Partner', resource: 'Cases', access: 'Full' },
    { id: 'perm-3' as UUID, role: 'Associate', resource: 'Cases', access: 'Write' },
    { id: 'perm-4' as UUID, role: 'Paralegal', resource: 'Cases', access: 'Write' },
    { id: 'perm-5' as UUID, role: 'Client', resource: 'Cases', access: 'Own' },
    
    // Financials
    { id: 'perm-6' as UUID, role: 'Administrator', resource: 'Financials', access: 'Full' },
    { id: 'perm-7' as UUID, role: 'Partner', resource: 'Financials', access: 'Full' },
    { id: 'perm-8' as UUID, role: 'Associate', resource: 'Financials', access: 'None' },
    { id: 'perm-9' as UUID, role: 'Paralegal', resource: 'Financials', access: 'None' },
    { id: 'perm-10' as UUID, role