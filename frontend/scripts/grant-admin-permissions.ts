/**
 * @script grant-admin-permissions
 * @description Grants complete global permissions to the admin user (usr-admin-justin)
 * 
 * Run this script in browser console:
 * 1. Open DevTools Console (F12)
 * 2. Copy and paste this script
 * 3. Execute it
 * 4. Refresh the page
 * 
 * Or import this module and call grantAdminPermissions() from your code
 */

import { db, STORES } from '../services/db';
import { ExtendedUserProfile, GranularPermission } from '../types';

/**
 * Creates comprehensive global permissions for all system resources
 */
const createGlobalPermissions = (): GranularPermission[] => {
  const resources = [
    // Core Resources
    'cases',
    'documents',
    'pleadings',
    'evidence',
    'docket',
    'correspondence',
    
    // Financial
    'billing',
    'billing.invoices',
    'billing.timesheets',
    'billing.expenses',
    'financials',
    
    // HR & Personnel
    'hr',
    'hr.employees',
    'hr.payroll',
    'personnel',
    
    // Operations
    'workflow',
    'operations',
    'tasks',
    'calendar',
    
    // Discovery & Trial
    'discovery',
    'trial',
    'depositions',
    'interrogatories',
    
    // Compliance & Security
    'compliance',
    'audit',
    'audit.logs',
    'security',
    'security.settings',
    'security.access',
    
    // Administration
    'admin',
    'admin.settings',
    'admin.users',
    'admin.roles',
    'admin.permissions',
    
    // Integrations
    'integrations',
    'api.keys',
    'webhooks',
    'data.sources',
    
    // Knowledge & Research
    'knowledge',
    'knowledge.base',
    'legal.research',
    'citation.analysis',
    
    // Client Management
    'crm',
    'clients',
    'contacts',
    
    // Analytics & Reports
    'analytics',
    'reports',
    'dashboards',
    'metrics',
    
    // Quality Assurance
    'quality',
    'quality.control',
    'quality.audits',
    
    // Catalog & Backup
    'catalog',
    'backup',
    'backup.restore',
    
    // Marketing
    'marketing',
    'marketing.campaigns',
    
    // Jurisdiction
    'jurisdiction',
    'jurisdiction.data',
    
    // System
    'system',
    'system.admin',
    'system.config',
    'database',
    'database.management'
  ];

  return resources.map((resource, index) => ({
    id: `perm-global-${index + 1}`,
    resource,
    action: '*' as const, // Full control
    effect: 'Allow' as const,
    scope: 'Global' as const,
    conditions: [],
    reason: 'Super Admin - Complete System Access'
  }));
};

/**
 * Grants complete global permissions to the admin user
 */
export async function grantAdminPermissions(): Promise<void> {
  try {
    console.log('🔐 Granting complete global permissions to admin user...');

    // Initialize database
    await db.init();

    // Get current admin user
    const adminUserId = 'usr-admin-justin';
    const user = await db.get<ExtendedUserProfile>(STORES.USERS, adminUserId);

    if (!user) {
      console.error('❌ Admin user not found. Run seeder first.');
      return;
    }

    console.log(`📋 Current user:`, user.name);
    console.log(`📊 Current permissions: ${user.accessMatrix?.length || 0}`);

    // Create comprehensive global permissions
    const globalPermissions = createGlobalPermissions();

    // Update user with new permissions
    const updatedUser: ExtendedUserProfile = {
      ...user,
      role: 'Administrator',
      accessMatrix: globalPermissions,
      title: user.title || 'System Administrator',
      department: user.department || 'Administration',
      entityId: user.entityId || ('ent-admin' as any),
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
        lastPasswordChange: new Date().toISOString().split('T')[0],
        passwordExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        activeSessions: [
          { 
            id: 'sess-1', 
            device: 'Current Device', 
            ip: '127.0.0.1', 
            lastActive: 'Just now', 
            current: true 
          }
        ]
      },
      skills: user.skills || ['System Administration', 'Legal Operations', 'Security Management'],
      barAdmissions: user.barAdmissions || []
    };

    // Save updated user
    await db.put(STORES.USERS, updatedUser);

    console.log(`✅ Successfully granted ${globalPermissions.length} global permissions!`);
    console.log('📋 Permissions granted for resources:', globalPermissions.map(p => p.resource));
    console.log('🔄 Please refresh the page to see changes.');
    
    // Show success message
    alert(`✅ Complete global permissions granted!\n\n${globalPermissions.length} permissions created\n\nPlease refresh the page.`);

  } catch (error) {
    console.error('❌ Error granting permissions:', error);
    throw error;
  }
}

// Auto-execute if running in browser console
if (typeof window !== 'undefined') {
  console.log('🎯 Admin Permission Script Loaded');
  console.log('Run grantAdminPermissions() to grant complete global access');
}
