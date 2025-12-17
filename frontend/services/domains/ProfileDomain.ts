import { ExtendedUserProfile, GranularPermission, UserId, EntityId } from '../../types';
import { delay } from '../../utils/async';
import { db, STORES } from '../db';
import { IntegrationOrchestrator } from '../integrationOrchestrator';

const CURRENT_USER_ID = 'usr-admin-justin';
export const ProfileDomain = {
    getCurrentProfile: async (): Promise<ExtendedUserProfile> => {
        // In a real app, this comes from session. Here we fetch the admin user from DB.
        const user = await db.get<any>(STORES.USERS, CURRENT_USER_ID);
        
        // Fallback if DB is empty or user missing (e.g. before seed)
        if (!user) {
             return {
                id: 'usr-guest' as UserId,
                name: 'Guest User',
                email: 'guest@example.com',
                role: 'Associate',
                entityId: 'ent-guest' as EntityId,
                title: 'Visitor',
                department: 'External',
                userType: 'External',
                preferences: { theme: 'light', notifications: { email: false, push: false, slack: false, digestFrequency: 'Weekly' }, dashboardLayout: [], density: 'comfortable', locale: 'en-US', timezone: 'UTC' },
                security: { mfaEnabled: false, mfaMethod: 'App', lastPasswordChange: '', passwordExpiry: '', activeSessions: [] },
                accessMatrix: [],
                skills: [],
                barAdmissions: []
             };
        }
        // Merge with extended profile data structure
        // In a real DB, these fields would likely be on the user record or joined from a profile table.
        return {
            ...user,
            title: user.title || 'Senior Partner',
            department: user.department || 'Litigation',
            status: user.status || 'online',
            skills: user.skills || ['Commercial Litigation', 'Class Action', 'Bankruptcy', 'Negotiation'],
            barAdmissions: user.barAdmissions || [
                { state: 'VA', number: '99823', status: 'Active' },
                { state: 'DC', number: '445210', status: 'Active' }
            ],
            preferences: user.preferences || {
                theme: 'system',
                notifications: {
                    email: true,
                    push: true,
                    slack: false,
                    digestFrequency: 'Daily'
                },
                dashboardLayout: ['metrics', 'tasks', 'calendar'],
                density: 'comfortable',
                locale: 'en-US',
                timezone: 'America/New_York'
            },
            security: user.security || {
                mfaEnabled: true,
                mfaMethod: 'App',
                lastPasswordChange: '2024-01-15',
                passwordExpiry: '2024-04-15',
                ipWhitelist: ['192.168.1.1'],
                activeSessions: [
                    { id: 'sess-1', device: 'MacBook Pro', ip: '192.168.1.55', lastActive: 'Just now', current: true },
                    { id: 'sess-2', device: 'iPhone 15', ip: '10.0.0.5', lastActive: '2 hours ago', current: false }
                ]
            },
            accessMatrix: user.accessMatrix || [
                // Global Admin Permissions - Full System Access
                { id: 'perm-1', resource: 'cases', action: '*', effect: 'Allow', scope: 'Global', reason: 'Administrator - Full Access' },
                { id: 'perm-2', resource: 'documents', action: '*', effect: 'Allow', scope: 'Global', reason: 'Administrator - Full Access' },
                { id: 'perm-3', resource: 'billing', action: '*', effect: 'Allow', scope: 'Global', reason: 'Administrator - Full Access' },
                { id: 'perm-4', resource: 'billing.invoices', action: '*', effect: 'Allow', scope: 'Global', reason: 'Administrator - Full Access' },
                { id: 'perm-5', resource: 'hr', action: '*', effect: 'Allow', scope: 'Global', reason: 'Administrator - Full Access' },
                { id: 'perm-6', resource: 'admin', action: '*', effect: 'Allow', scope: 'Global', reason: 'Administrator - Full Access' },
                { id: 'perm-7', resource: 'security', action: '*', effect: 'Allow', scope: 'Global', reason: 'Administrator - Full Access' },
                { id: 'perm-8', resource: 'compliance', action: '*', effect: 'Allow', scope: 'Global', reason: 'Administrator - Full Access' },
                { id: 'perm-9', resource: 'audit', action: '*', effect: 'Allow', scope: 'Global', reason: 'Administrator - Full Access' },
                { id: 'perm-10', resource: 'analytics', action: '*', effect: 'Allow', scope: 'Global', reason: 'Administrator - Full Access' },
                { id: 'perm-11', resource: 'integrations', action: '*', effect: 'Allow', scope: 'Global', reason: 'Administrator - Full Access' },
                { id: 'perm-12', resource: 'api.keys', action: '*', effect: 'Allow', scope: 'Global', reason: 'Administrator - Full Access' },
                { id: 'perm-13', resource: 'system', action: '*', effect: 'Allow', scope: 'Global', reason: 'Administrator - Full Access' },
                { id: 'perm-14', resource: 'database', action: '*', effect: 'Allow', scope: 'Global', reason: 'Administrator - Full Access' },
                { id: 'perm-15', resource: '*', action: '*', effect: 'Allow', scope: 'Global', reason: 'Super Admin - Unrestricted Access' }
            ]
        };
    },
    updateProfile: async (updates: Partial<ExtendedUserProfile>): Promise<ExtendedUserProfile> => {
        const current = await ProfileDomain.getCurrentProfile();
        const updated = { ...current, ...updates };
        await db.put(STORES.USERS, updated);
        return updated;
    },
    updatePreferences: async (prefs: Partial<ExtendedUserProfile['preferences']>): Promise<void> => {
        const current = await ProfileDomain.getCurrentProfile();
        const updated = { ...current, preferences: { ...current.preferences, ...prefs } };
        await db.put(STORES.USERS, updated);
    },
    updateSecurity: async (sec: Partial<ExtendedUserProfile['security']>): Promise<void> => {
        const current = await ProfileDomain.getCurrentProfile();
        await delay(500); // Simulate secure handshake
        const updated = { ...current, security: { ...current.security, ...sec } };
        await db.put(STORES.USERS, updated);
    },
    addPermission: async (perm: GranularPermission): Promise<GranularPermission> => {
        const current = await ProfileDomain.getCurrentProfile();
        const newPerm = { ...perm, id: `perm-${Date.now()}` };
        const updated = { ...current, accessMatrix: [...current.accessMatrix, newPerm] };
        await db.put(STORES.USERS, updated);
        return newPerm;
    },
    revokePermission: async (id: string): Promise<void> => {
        const current = await ProfileDomain.getCurrentProfile();
        const updated = { ...current, accessMatrix: current.accessMatrix.filter(p => p.id !== id) };
        await db.put(STORES.USERS, updated);
    },
    getAuditLog: async (userId: string) => {
        // Fetch real audit logs for this user
        const logs = await db.getByIndex<any>(STORES.LOGS, 'userId', userId);
        if (logs.length === 0) {
             return [
                { id: 'log-1', action: 'Login', timestamp: new Date().toISOString(), ip: '192.168.1.55', device: 'MacBook Pro' },
                { id: 'log-2', action: 'View Case', resource: 'Martinez v. TechCorp', timestamp: new Date(Date.now() - 3600000).toISOString() },
            ];
        }
        return logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);
    }
};
