import { VersioningType } from '@nestjs/common';

/**
 * API Versioning Configuration for LexiFlow AI Legal Suite
 *
 * This configuration supports multiple versioning strategies:
 * - URI Versioning: /api/v1/cases, /api/v2/cases
 * - Header Versioning: X-API-Version: 1
 * - Media Type Versioning: Accept: application/vnd.lexiflow.v1+json
 */

export interface ApiVersion {
  version: string;
  releaseDate: Date;
  deprecationDate?: Date;
  sunsetDate?: Date;
  status: VersionStatus;
  changelog: VersionChangelog[];
  supportLevel: SupportLevel;
}

export enum VersionStatus {
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  SUNSET = 'sunset',
  BETA = 'beta',
  PREVIEW = 'preview',
}

export enum SupportLevel {
  FULL = 'full',
  MAINTENANCE = 'maintenance',
  SECURITY_ONLY = 'security_only',
  UNSUPPORTED = 'unsupported',
}

export interface VersionChangelog {
  date: Date;
  type: ChangeType;
  description: string;
  breakingChange: boolean;
  migration?: string;
}

export enum ChangeType {
  FEATURE = 'feature',
  ENHANCEMENT = 'enhancement',
  FIX = 'fix',
  SECURITY = 'security',
  DEPRECATION = 'deprecation',
  BREAKING = 'breaking',
}

export const API_VERSIONS: Record<string, ApiVersion> = {
  '1': {
    version: '1.0.0',
    releaseDate: new Date('2024-01-01'),
    deprecationDate: new Date('2025-01-01'),
    sunsetDate: new Date('2025-06-01'),
    status: VersionStatus.ACTIVE,
    supportLevel: SupportLevel.FULL,
    changelog: [
      {
        date: new Date('2024-01-01'),
        type: ChangeType.FEATURE,
        description: 'Initial API release with core legal case management',
        breakingChange: false,
      },
      {
        date: new Date('2024-03-15'),
        type: ChangeType.ENHANCEMENT,
        description: 'Enhanced document processing capabilities',
        breakingChange: false,
      },
      {
        date: new Date('2024-06-01'),
        type: ChangeType.SECURITY,
        description: 'Improved authentication and authorization',
        breakingChange: false,
      },
    ],
  },
  '2': {
    version: '2.0.0',
    releaseDate: new Date('2024-07-01'),
    status: VersionStatus.ACTIVE,
    supportLevel: SupportLevel.FULL,
    changelog: [
      {
        date: new Date('2024-07-01'),
        type: ChangeType.BREAKING,
        description: 'GraphQL-first API with improved type safety',
        breakingChange: true,
        migration: 'https://docs.lexiflow.ai/migration/v1-to-v2',
      },
      {
        date: new Date('2024-07-01'),
        type: ChangeType.FEATURE,
        description: 'Real-time subscriptions for case updates',
        breakingChange: false,
      },
      {
        date: new Date('2024-07-01'),
        type: ChangeType.FEATURE,
        description: 'Advanced AI analysis with multi-model support',
        breakingChange: false,
      },
      {
        date: new Date('2024-07-01'),
        type: ChangeType.FEATURE,
        description: 'Compliance and risk management modules',
        breakingChange: false,
      },
      {
        date: new Date('2024-08-15'),
        type: ChangeType.ENHANCEMENT,
        description: 'Improved document comparison algorithms',
        breakingChange: false,
      },
      {
        date: new Date('2024-09-01'),
        type: ChangeType.FEATURE,
        description: 'Advanced analytics and predictive insights',
        breakingChange: false,
      },
    ],
  },
};

export const DEFAULT_API_VERSION = '2';
export const MINIMUM_SUPPORTED_VERSION = '1';
export const LATEST_API_VERSION = '2';

export const API_VERSIONING_CONFIG = {
  type: VersioningType.URI,
  defaultVersion: DEFAULT_API_VERSION,
  prefix: 'api/',
};

export const VERSION_HEADER_NAME = 'X-API-Version';
export const DEPRECATION_HEADER_NAME = 'X-API-Deprecation';
export const SUNSET_HEADER_NAME = 'X-API-Sunset';
export const API_VERSION_HEADER_NAME = 'X-API-Current-Version';

/**
 * Check if a version is deprecated
 */
export function isVersionDeprecated(version: string): boolean {
  const apiVersion = API_VERSIONS[version];
  if (!apiVersion) return true;

  return (
    apiVersion.status === VersionStatus.DEPRECATED ||
    (apiVersion.deprecationDate && new Date() >= apiVersion.deprecationDate)
  );
}

/**
 * Check if a version is sunset (no longer supported)
 */
export function isVersionSunset(version: string): boolean {
  const apiVersion = API_VERSIONS[version];
  if (!apiVersion) return true;

  return (
    apiVersion.status === VersionStatus.SUNSET ||
    (apiVersion.sunsetDate && new Date() >= apiVersion.sunsetDate)
  );
}

/**
 * Get deprecation date for a version
 */
export function getDeprecationDate(version: string): Date | undefined {
  return API_VERSIONS[version]?.deprecationDate;
}

/**
 * Get sunset date for a version
 */
export function getSunsetDate(version: string): Date | undefined {
  return API_VERSIONS[version]?.sunsetDate;
}

/**
 * Get version changelog
 */
export function getVersionChangelog(version: string): VersionChangelog[] {
  return API_VERSIONS[version]?.changelog || [];
}

/**
 * Get breaking changes for a version
 */
export function getBreakingChanges(version: string): VersionChangelog[] {
  return getVersionChangelog(version).filter((change) => change.breakingChange);
}

/**
 * Get supported versions
 */
export function getSupportedVersions(): string[] {
  return Object.keys(API_VERSIONS).filter(
    (version) => !isVersionSunset(version),
  );
}

/**
 * Get active versions (not deprecated or sunset)
 */
export function getActiveVersions(): string[] {
  return Object.keys(API_VERSIONS).filter(
    (version) =>
      !isVersionDeprecated(version) && !isVersionSunset(version),
  );
}

/**
 * Validate if a version is supported
 */
export function isVersionSupported(version: string): boolean {
  return getSupportedVersions().includes(version);
}

/**
 * Get migration path from one version to another
 */
export function getMigrationPath(
  fromVersion: string,
  toVersion: string,
): string | undefined {
  const targetVersion = API_VERSIONS[toVersion];
  const breakingChanges = getBreakingChanges(toVersion);

  if (breakingChanges.length > 0 && breakingChanges[0].migration) {
    return breakingChanges[0].migration;
  }

  return undefined;
}

/**
 * Get recommended version for new integrations
 */
export function getRecommendedVersion(): string {
  return LATEST_API_VERSION;
}

/**
 * Get version support level
 */
export function getSupportLevel(version: string): SupportLevel {
  return API_VERSIONS[version]?.supportLevel || SupportLevel.UNSUPPORTED;
}

export default {
  API_VERSIONS,
  DEFAULT_API_VERSION,
  MINIMUM_SUPPORTED_VERSION,
  LATEST_API_VERSION,
  API_VERSIONING_CONFIG,
  VERSION_HEADER_NAME,
  DEPRECATION_HEADER_NAME,
  SUNSET_HEADER_NAME,
  API_VERSION_HEADER_NAME,
  isVersionDeprecated,
  isVersionSunset,
  getDeprecationDate,
  getSunsetDate,
  getVersionChangelog,
  getBreakingChanges,
  getSupportedVersions,
  getActiveVersions,
  isVersionSupported,
  getMigrationPath,
  getRecommendedVersion,
  getSupportLevel,
};
