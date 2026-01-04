export interface PermissionDefinition {
  id: string;
  resource: string;
  action: string;
  description: string;
  category: string;
}

export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  // Cases
  {
    id: "cases:create",
    resource: "cases",
    action: "create",
    description: "Create new cases",
    category: "Case Management",
  },
  {
    id: "cases:read",
    resource: "cases",
    action: "read",
    description: "View case details",
    category: "Case Management",
  },
  {
    id: "cases:update",
    resource: "cases",
    action: "update",
    description: "Update case information",
    category: "Case Management",
  },
  {
    id: "cases:delete",
    resource: "cases",
    action: "delete",
    description: "Delete cases",
    category: "Case Management",
  },

  // Documents
  {
    id: "documents:create",
    resource: "documents",
    action: "create",
    description: "Upload new documents",
    category: "Document Management",
  },
  {
    id: "documents:read",
    resource: "documents",
    action: "read",
    description: "View documents",
    category: "Document Management",
  },
  {
    id: "documents:update",
    resource: "documents",
    action: "update",
    description: "Edit document metadata",
    category: "Document Management",
  },
  {
    id: "documents:delete",
    resource: "documents",
    action: "delete",
    description: "Delete documents",
    category: "Document Management",
  },

  // Billing
  {
    id: "billing:create",
    resource: "billing",
    action: "create",
    description: "Create invoices and time entries",
    category: "Billing",
  },
  {
    id: "billing:read",
    resource: "billing",
    action: "read",
    description: "View billing information",
    category: "Billing",
  },
  {
    id: "billing:update",
    resource: "billing",
    action: "update",
    description: "Edit billing records",
    category: "Billing",
  },
  {
    id: "billing:approve",
    resource: "billing",
    action: "approve",
    description: "Approve time and expenses",
    category: "Billing",
  },

  // Discovery
  {
    id: "discovery:create",
    resource: "discovery",
    action: "create",
    description: "Create legal holds and custodians",
    category: "Discovery",
  },
  {
    id: "discovery:read",
    resource: "discovery",
    action: "read",
    description: "View discovery materials",
    category: "Discovery",
  },
  {
    id: "discovery:update",
    resource: "discovery",
    action: "update",
    description: "Update discovery status",
    category: "Discovery",
  },
  {
    id: "discovery:produce",
    resource: "discovery",
    action: "produce",
    description: "Create productions",
    category: "Discovery",
  },

  // Admin
  {
    id: "admin:users",
    resource: "admin",
    action: "users",
    description: "Manage user accounts",
    category: "Administration",
  },
  {
    id: "admin:roles",
    resource: "admin",
    action: "roles",
    description: "Manage roles and permissions",
    category: "Administration",
  },
  {
    id: "admin:settings",
    resource: "admin",
    action: "settings",
    description: "Configure system settings",
    category: "Administration",
  },
  {
    id: "admin:audit",
    resource: "admin",
    action: "audit",
    description: "View audit logs",
    category: "Administration",
  },
];
