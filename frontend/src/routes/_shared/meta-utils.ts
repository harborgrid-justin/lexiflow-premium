/**
 * Meta Tag Utilities for React Router v7 Routes
 *
 * Provides type-safe meta tag generation for:
 * - Standard page titles
 * - Open Graph tags
 * - SEO meta tags
 * - Case-specific meta
 * - Detail page meta
 *
 * @module routes/_shared/meta-utils
 */

import type { MetaConfig } from './types';

/**
 * Application name used in all page titles
 */
const APP_NAME = 'LexiFlow';

/**
 * Default OG image for social sharing
 */
const DEFAULT_OG_IMAGE = '/og-image.png';

/**
 * Create standard meta tags for a route
 *
 * @example
 * ```tsx
 * export function meta() {
 *   return createMeta({
 *     title: 'Cases',
 *     description: 'Manage your legal cases and matters',
 *   });
 * }
 * ```
 */
export function createMeta(config: MetaConfig) {
  const { title, description, ogTitle, ogDescription, ogImage, noIndex } = config;

  const fullTitle = `${title} - ${APP_NAME}`;
  const metaTags: Array<Record<string, string>> = [
    { title: fullTitle },
  ];

  if (description) {
    metaTags.push({ name: 'description', content: description });
  }

  // Open Graph tags
  metaTags.push({ property: 'og:title', content: ogTitle || title });

  if (description || ogDescription) {
    metaTags.push({
      property: 'og:description',
      content: ogDescription || description || '',
    });
  }

  metaTags.push({ property: 'og:image', content: ogImage || DEFAULT_OG_IMAGE });
  metaTags.push({ property: 'og:type', content: 'website' });

  // Twitter card
  metaTags.push({ name: 'twitter:card', content: 'summary_large_image' });
  metaTags.push({ name: 'twitter:title', content: ogTitle || title });

  if (description || ogDescription) {
    metaTags.push({
      name: 'twitter:description',
      content: ogDescription || description || '',
    });
  }

  // noindex for pages that shouldn't be indexed
  if (noIndex) {
    metaTags.push({ name: 'robots', content: 'noindex, nofollow' });
  }

  return metaTags;
}

/**
 * Create meta tags for case-related pages
 *
 * @example
 * ```tsx
 * export function meta({ data }: Route.MetaArgs) {
 *   return createCaseMeta({
 *     caseTitle: data?.caseData?.title,
 *     caseNumber: data?.caseData?.caseNumber,
 *     section: 'Overview',
 *   });
 * }
 * ```
 */
export function createCaseMeta(config: {
  caseTitle?: string;
  caseNumber?: string;
  section?: string;
  description?: string;
}) {
  const { caseTitle, caseNumber, section, description } = config;

  let title = 'Case Details';

  if (caseTitle) {
    title = section ? `${caseTitle} - ${section}` : caseTitle;
  } else if (section) {
    title = `Case ${section}`;
  }

  const defaultDescription = caseNumber
    ? `View details for case ${caseNumber}`
    : 'View case details and information';

  return createMeta({
    title,
    description: description || defaultDescription,
    noIndex: true, // Case data should not be indexed
  });
}

/**
 * Create meta tags for detail pages (documents, dockets, etc.)
 *
 * @example
 * ```tsx
 * export function meta({ data }: Route.MetaArgs) {
 *   return createDetailMeta({
 *     entityType: 'Document',
 *     entityName: data?.document?.title,
 *     entityId: data?.document?.id,
 *   });
 * }
 * ```
 */
export function createDetailMeta(config: {
  entityType: string;
  entityName?: string;
  entityId?: string;
  description?: string;
}) {
  const { entityType, entityName, entityId, description } = config;

  const title = entityName || `${entityType} Details`;
  const defaultDescription = entityId
    ? `View ${entityType.toLowerCase()} ${entityId}`
    : `View ${entityType.toLowerCase()} details`;

  return createMeta({
    title,
    description: description || defaultDescription,
    noIndex: true, // Detail pages should not be indexed
  });
}

/**
 * Create meta tags for list/index pages
 *
 * @example
 * ```tsx
 * export function meta({ data }: Route.MetaArgs) {
 *   return createListMeta({
 *     entityType: 'Cases',
 *     count: data?.cases?.length,
 *   });
 * }
 * ```
 */
export function createListMeta(config: {
  entityType: string;
  count?: number;
  description?: string;
}) {
  const { entityType, count, description } = config;

  const title = count !== undefined ? `${entityType} (${count})` : entityType;
  const defaultDescription = `Manage your ${entityType.toLowerCase()}`;

  return createMeta({
    title,
    description: description || defaultDescription,
  });
}

/**
 * Create meta tags for admin/settings pages
 */
export function createAdminMeta(config: {
  section: string;
  description?: string;
}) {
  const { section, description } = config;

  return createMeta({
    title: `Admin - ${section}`,
    description: description || `Manage ${section.toLowerCase()} settings`,
    noIndex: true, // Admin pages should not be indexed
  });
}
