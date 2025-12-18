/**
 * Constants for Data Sources Management
 * 
 * Centralized configuration values that rarely change.
 */

import { Database, HardDrive, Cloud } from 'lucide-react';
import type { DataProvider } from './types';

/**
 * Available data provider configurations
 * Used for rendering provider selection UI
 */
export const DATA_PROVIDERS: readonly DataProvider[] = [
  { 
    id: 'snowflake', 
    name: 'Snowflake', 
    icon: Database, 
    color: 'text-blue-500' 
  },
  { 
    id: 'postgres', 
    name: 'PostgreSQL', 
    icon: Database, 
    color: 'text-indigo-500' 
  },
  { 
    id: 'mongo', 
    name: 'MongoDB', 
    icon: HardDrive, 
    color: 'text-green-500' 
  },
  { 
    id: 's3', 
    name: 'S3', 
    icon: Cloud, 
    color: 'text-orange-500' 
  },
] as const;

/**
 * Services that have backend API integration when PostgreSQL is active
 */
export const BACKEND_ENABLED_SERVICES: readonly string[] = [
  'cases', 'docket', 'documents', 'evidence', 'billing', 'users',
  'pleadings', 'trustAccounts', 'billingAnalytics', 'reports', 
  'processingJobs', 'casePhases', 'caseTeams', 'motions', 'parties',
  'clauses', 'legalHolds', 'depositions', 'discoveryRequests', 
  'esiSources', 'privilegeLog', 'productions', 'custodianInterviews',
  'conflictChecks', 'ethicalWalls', 'auditLogs', 'permissions',
  'rlsPolicies', 'complianceReports', 'rateTables', 'feeAgreements',
  'custodians', 'examinations', 'discoveryMain', 'search', 'ocr', 
  'serviceJobs', 'messaging', 'complianceMain', 'tokenBlacklist', 
  'analytics', 'judgeStats', 'outcomePredictions', 'documentVersions', 
  'dataSourcesIntegration', 'metrics', 'production'
] as const;

/**
 * Default regions for data sources
 */
export const DEFAULT_REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'] as const;

/**
 * Default form values for new connection
 */
export const DEFAULT_CONNECTION_FORM = {
  name: '',
  host: '',
  region: 'us-east-1'
} as const;
