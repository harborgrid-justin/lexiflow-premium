# Admin Permissions Setup Guide

This guide shows you how to grant complete global permissions to your user profile in LexiFlow.

## Method 1: Automatic (Reset Database)

The easiest way is to **reset your database** - this will recreate all data including the admin user with full permissions.

### Steps:

1. Open LexiFlow in your browser
2. Navigate to **Database Management** page
3. Click the **"Reset Database"** button
4. Confirm the reset
5. Wait for data to reload
6. Refresh the page

The seeder will automatically create the admin user (`usr-admin-justin`) with **45+ global permissions** covering all system resources.

---

## Method 2: Browser Console Script (Keep Existing Data)

If you want to **keep your existing data** and just update permissions, use this method:

### Steps:

1. Open your browser DevTools (Press `F12`)
2. Go to the **Console** tab
3. Copy and paste this script:

```javascript
// Grant Complete Global Permissions to Admin User
(async function grantAdminPermissions() {
  try {
    console.log('🔐 Granting complete global permissions...');
    
    // Access the database
    const dbName = 'LexiFlowDB';
    const request = indexedDB.open(dbName);
    
    request.onsuccess = async (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      
      // Get admin user
      const getRequest = store.get('usr-admin-justin');
      
      getRequest.onsuccess = () => {
        const user = getRequest.result;
        
        if (!user) {
          console.error('❌ Admin user not found');
          return;
        }
        
        // Create comprehensive permissions
        const resources = [
          'cases', 'documents', 'pleadings', 'evidence', 'docket', 'correspondence',
          'billing', 'billing.invoices', 'billing.timesheets', 'billing.expenses', 'financials',
          'hr', 'hr.employees', 'hr.payroll', 'personnel',
          'workflow', 'operations', 'tasks', 'calendar',
          'discovery', 'trial', 'depositions', 'interrogatories',
          'compliance', 'audit', 'audit.logs', 'security', 'security.settings', 'security.access',
          'admin', 'admin.settings', 'admin.users', 'admin.roles', 'admin.permissions',
          'integrations', 'api.keys', 'webhooks', 'data.sources',
          'knowledge', 'knowledge.base', 'legal.research', 'citation.analysis',
          'crm', 'clients', 'contacts',
          'analytics', 'reports', 'dashboards', 'metrics',
          'quality', 'quality.control', 'quality.audits',
          'catalog', 'backup', 'backup.restore',
          'marketing', 'marketing.campaigns',
          'jurisdiction', 'jurisdiction.data',
          'system', 'system.admin', 'system.config', 'database', 'database.management'
        ];
        
        const permissions = resources.map((resource, index) => ({
          id: `perm-global-${index + 1}`,
          resource,
          action: '*',
          effect: 'Allow',
          scope: 'Global',
          conditions: [],
          reason: 'Super Admin - Complete System Access'
        }));
        
        // Update user
        user.accessMatrix = permissions;
        user.role = 'Administrator';
        
        const putRequest = store.put(user);
        
        putRequest.onsuccess = () => {
          console.log(`✅ Successfully granted ${permissions.length} global permissions!`);
          console.log('📋 Resources:', resources);
          alert(`✅ Complete global permissions granted!\n\n${permissions.length} permissions created\n\nPlease refresh the page.`);
        };
        
        putRequest.onerror = () => {
          console.error('❌ Failed to update user');
        };
      };
    };
    
    request.onerror = () => {
      console.error('❌ Failed to open database');
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
```

4. Press `Enter` to execute
5. You should see: `✅ Successfully granted X global permissions!`
6. **Refresh the page** to see changes

---

## Method 3: Using TypeScript Module (Development)

For development/testing, you can import and run the permission script:

```typescript
import { grantAdminPermissions } from './scripts/grant-admin-permissions';

// Call this function when needed
await grantAdminPermissions();
```

---

## Verifying Permissions

After granting permissions, verify they were applied:

1. Go to **User Profile** (click your name in the header)
2. Navigate to **Security & Access** → **Access Matrix**
3. You should see **45+ permissions** listed with:
   - **Resource**: Various system resources
   - **Action**: `*` (full control)
   - **Effect**: `Allow`
   - **Scope**: `Global`

### Expected Permissions List:

The admin user should have full `*` (wildcard) permissions for all these resources:

**Core Legal**
- cases, documents, pleadings, evidence, docket, correspondence

**Financial**
- billing, billing.invoices, billing.timesheets, billing.expenses, financials

**HR & Personnel**
- hr, hr.employees, hr.payroll, personnel

**Operations**
- workflow, operations, tasks, calendar

**Discovery & Trial**
- discovery, trial, depositions, interrogatories

**Compliance & Security**
- compliance, audit, audit.logs, security, security.settings, security.access

**Administration**
- admin, admin.settings, admin.users, admin.roles, admin.permissions

**Integrations**
- integrations, api.keys, webhooks, data.sources

**Knowledge Management**
- knowledge, knowledge.base, legal.research, citation.analysis

**CRM**
- crm, clients, contacts

**Analytics**
- analytics, reports, dashboards, metrics

**Quality**
- quality, quality.control, quality.audits

**Backup & Catalog**
- catalog, backup, backup.restore

**Marketing**
- marketing, marketing.campaigns

**Jurisdiction**
- jurisdiction, jurisdiction.data

**System**
- system, system.admin, system.config, database, database.management

---

## Troubleshooting

### Permissions not showing after refresh?
- Clear browser cache and reload
- Check browser console for errors
- Try Method 1 (reset database)

### "Admin user not found" error?
- The database hasn't been seeded yet
- Navigate to any page to trigger seeding
- Wait a few seconds, then try again

### Still can't see everything?
- Ensure you're logged in as `usr-admin-justin`
- Check the user switcher in the sidebar
- Some features may require backend integration

---

## Security Note

⚠️ **Important**: These permissions grant **complete system access**. In a production environment:

1. Use role-based access control (RBAC)
2. Grant minimum required permissions
3. Implement audit logging for permission changes
4. Review and revoke temporary permissions regularly
5. Use the `expiration` field for time-limited access

The LexiFlow permission system supports:
- **Effect**: `Allow` or `Deny` (Deny takes precedence)
- **Scope**: `Global`, `Region`, `Office`, `Personal`
- **Conditions**: Time-based, location-based, etc.
- **Expiration**: Automatic permission revocation

---

## Next Steps

After setting up permissions:

1. ✅ Verify all admin features are accessible
2. ✅ Test creating/editing sensitive data (billing, security settings)
3. ✅ Review audit logs to ensure permission changes are tracked
4. ✅ Configure additional users with appropriate role-based permissions
5. ✅ Set up MFA for the admin account (User Profile → Security & Sessions)

For questions or issues, check the [main README](../README.md) or [documentation](.).
