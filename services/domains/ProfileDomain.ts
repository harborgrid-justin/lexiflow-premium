
import { ExtendedUserProfile, GranularPermission, UserId, EntityId } from '../../types';
import { db, STORES } from '../db';
import { MOCK_USERS } from '../../data/models/user';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_PROFILE: ExtendedUserProfile = {
    // FIX: Cast string to branded type UserId
    id: 'usr-admin-justin' as UserId,
    name: 'Justin Jeffrey Saadein-Morales',
    email: 'justin.saadein@harborgrid.com',
    role: 'Administrator',
    // FIX: Cast string to branded type EntityId
    entityId: 'ent-usr-001' as EntityId,
    title: 'Senior Partner',
    department: 'Litigation',
    userType: 'Internal',
    office: 'Washington, DC',
    status: 'online',
    skills: ['Commercial Litigation', 'Class Action', 'Bankruptcy', 'Negotiation'],
    barAdmissions: [
        { state: 'VA', number: '99823', status: 'Active' },
        { state: 'DC', number: '445210', status: 'Active' }
    ],
    preferences: {
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
    security: {
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
    accessMatrix: [
        { id: 'perm-1', resource: 'cases', action: '*', effect: 'Allow', scope: 'Global' },
        { id: 'perm-2', resource: 'billing.invoices', action: 'approve', effect: 'Allow', scope: 'Region', conditions: [{ type: 'Location', operator: 'Equals', value: 'US' }] },
        { id: 'perm-3', resource: 'hr.salaries', action: 'read', effect: 'Deny', scope: 'Global', reason: 'Conflict of Interest' },
        { id: 'perm-4', resource: 'admin.security', action: 'update', effect: 'Allow', scope: 'Global', expiration: '2024-12-31' }
    ]
};

export const ProfileDomain = {
    getCurrentProfile: async (): Promise<ExtendedUserProfile> => {
        await delay(300);
        // In a real app, resolve based on current auth session
        return { ...MOCK_PROFILE };
    },

    updateProfile: async (updates: Partial<ExtendedUserProfile>): Promise<ExtendedUserProfile> => {
        await delay(500);
        const updated = { ...MOCK_PROFILE, ...updates };
        // Ideally update local mock store
        return updated;
    },

    updatePreferences: async (prefs: Partial<ExtendedUserProfile['preferences']>): Promise<void> => {
        await delay(300);
        console.log("Preferences updated:", prefs);
    },

    updateSecurity: async (sec: Partial<ExtendedUserProfile['security']>): Promise<void> => {
        await delay(800);
        console.log("Security settings updated:", sec);
    },

    addPermission: async (perm: GranularPermission): Promise<GranularPermission> => {
        await delay(400);
        return { ...perm, id: `perm-${Date.now()}` };
    },

    revokePermission: async (id: string): Promise<void> => {
        await delay(300);
        console.log(`Permission ${id} revoked`);
    },

    getAuditLog: async (userId: string) => {
        await delay(300);
        return [
            { id: 'log-1', action: 'Login', timestamp: new Date().toISOString(), ip: '192.168.1.55', device: 'MacBook Pro' },
            { id: 'log-2', action: 'View Case', resource: 'Martinez v. TechCorp', timestamp: new Date(Date.now() - 3600000).toISOString() },
            { id: 'log-3', action: 'Export Report', resource: 'Billing Q1', timestamp: new Date(Date.now() - 7200000).toISOString() }
        ];
    }
};