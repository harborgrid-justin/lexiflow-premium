/**
 * Swagger/OpenAPI Tags Configuration
 *
 * Defines tags for organizing API endpoints in the documentation
 */

export interface ApiTag {
  name: string;
  description: string;
  externalDocs?: {
    description: string;
    url: string;
  };
}

/**
 * API Tags for V2 (Latest)
 */
export const V2_API_TAGS: ApiTag[] = [
  {
    name: 'Cases (V2)',
    description: 'Legal case management operations including creation, updates, team management, and AI insights',
    externalDocs: {
      description: 'Case Management Guide',
      url: 'https://docs.lexiflow.ai/v2/cases',
    },
  },
  {
    name: 'Documents (V2)',
    description: 'Document management, upload, processing, OCR, AI analysis, and version control',
    externalDocs: {
      description: 'Document Management Guide',
      url: 'https://docs.lexiflow.ai/v2/documents',
    },
  },
  {
    name: 'Billing (V2)',
    description: 'Time tracking, expense management, invoicing, and payment processing',
    externalDocs: {
      description: 'Billing Guide',
      url: 'https://docs.lexiflow.ai/v2/billing',
    },
  },
  {
    name: 'Users (V2)',
    description: 'User management, authentication, profiles, preferences, and permissions',
    externalDocs: {
      description: 'User Management Guide',
      url: 'https://docs.lexiflow.ai/v2/users',
    },
  },
  {
    name: 'Analytics (V2)',
    description: 'Business intelligence, dashboards, reports, and predictive analytics',
    externalDocs: {
      description: 'Analytics Guide',
      url: 'https://docs.lexiflow.ai/v2/analytics',
    },
  },
  {
    name: 'Compliance (V2)',
    description: 'Compliance policies, audits, risk assessments, incidents, and training',
    externalDocs: {
      description: 'Compliance Management Guide',
      url: 'https://docs.lexiflow.ai/v2/compliance',
    },
  },
  {
    name: 'AI & ML (V2)',
    description: 'AI-powered document analysis, case predictions, and intelligent insights',
    externalDocs: {
      description: 'AI Features Guide',
      url: 'https://docs.lexiflow.ai/v2/ai',
    },
  },
  {
    name: 'Search (V2)',
    description: 'Full-text search, semantic search, and advanced filtering',
    externalDocs: {
      description: 'Search Guide',
      url: 'https://docs.lexiflow.ai/v2/search',
    },
  },
  {
    name: 'Notifications (V2)',
    description: 'Real-time notifications, alerts, and webhooks',
    externalDocs: {
      description: 'Notifications Guide',
      url: 'https://docs.lexiflow.ai/v2/notifications',
    },
  },
  {
    name: 'Integrations (V2)',
    description: 'Third-party integrations, OAuth providers, and API connections',
    externalDocs: {
      description: 'Integrations Guide',
      url: 'https://docs.lexiflow.ai/v2/integrations',
    },
  },
  {
    name: 'Webhooks (V2)',
    description: 'Configure and manage webhooks for real-time event notifications',
    externalDocs: {
      description: 'Webhooks Guide',
      url: 'https://docs.lexiflow.ai/v2/webhooks',
    },
  },
  {
    name: 'Admin (V2)',
    description: 'Administrative operations, system configuration, and organization management',
    externalDocs: {
      description: 'Admin Guide',
      url: 'https://docs.lexiflow.ai/v2/admin',
    },
  },
];

/**
 * API Tags for V1 (Deprecated)
 */
export const V1_API_TAGS: ApiTag[] = [
  {
    name: 'Cases (V1 - Deprecated)',
    description: '⚠️ DEPRECATED: Legacy case management API. Please migrate to V2 or GraphQL.',
    externalDocs: {
      description: 'Migration Guide',
      url: 'https://docs.lexiflow.ai/migration/v1-to-v2',
    },
  },
  {
    name: 'Documents (V1 - Deprecated)',
    description: '⚠️ DEPRECATED: Legacy document management API. Please migrate to V2 or GraphQL.',
    externalDocs: {
      description: 'Migration Guide',
      url: 'https://docs.lexiflow.ai/migration/v1-to-v2',
    },
  },
  {
    name: 'Billing (V1 - Deprecated)',
    description: '⚠️ DEPRECATED: Legacy billing API. Please migrate to V2 or GraphQL.',
    externalDocs: {
      description: 'Migration Guide',
      url: 'https://docs.lexiflow.ai/migration/v1-to-v2',
    },
  },
  {
    name: 'Users (V1 - Deprecated)',
    description: '⚠️ DEPRECATED: Legacy user management API. Please migrate to V2 or GraphQL.',
    externalDocs: {
      description: 'Migration Guide',
      url: 'https://docs.lexiflow.ai/migration/v1-to-v2',
    },
  },
];

/**
 * All API Tags
 */
export const ALL_API_TAGS: ApiTag[] = [...V2_API_TAGS, ...V1_API_TAGS];

/**
 * Tag Groups for better organization
 */
export const TAG_GROUPS = {
  core: ['Cases (V2)', 'Documents (V2)', 'Users (V2)'],
  financial: ['Billing (V2)'],
  intelligence: ['Analytics (V2)', 'AI & ML (V2)', 'Search (V2)'],
  governance: ['Compliance (V2)'],
  integration: ['Notifications (V2)', 'Integrations (V2)', 'Webhooks (V2)'],
  admin: ['Admin (V2)'],
  deprecated: [
    'Cases (V1 - Deprecated)',
    'Documents (V1 - Deprecated)',
    'Billing (V1 - Deprecated)',
    'Users (V1 - Deprecated)',
  ],
};

/**
 * Get tags for a specific API version
 */
export function getTagsForVersion(version: string): ApiTag[] {
  switch (version) {
    case '1':
      return V1_API_TAGS;
    case '2':
      return V2_API_TAGS;
    default:
      return V2_API_TAGS;
  }
}

/**
 * Get tags for a specific group
 */
export function getTagsForGroup(group: keyof typeof TAG_GROUPS): string[] {
  return TAG_GROUPS[group] || [];
}

/**
 * Check if a tag is deprecated
 */
export function isTagDeprecated(tagName: string): boolean {
  return tagName.includes('Deprecated') || tagName.includes('V1');
}

/**
 * Get tag metadata
 */
export function getTagMetadata(tagName: string): ApiTag | undefined {
  return ALL_API_TAGS.find((tag) => tag.name === tagName);
}

export default {
  V2_API_TAGS,
  V1_API_TAGS,
  ALL_API_TAGS,
  TAG_GROUPS,
  getTagsForVersion,
  getTagsForGroup,
  isTagDeprecated,
  getTagMetadata,
};
