/**
 * Unified GraphQL Subscriptions for LexiFlow AI Legal Suite
 *
 * This module exports all GraphQL subscriptions for real-time updates
 */

// Import all subscriptions from query files
import {
  CASE_CREATED_SUBSCRIPTION,
  CASE_UPDATED_SUBSCRIPTION,
  CASE_STATUS_CHANGED_SUBSCRIPTION,
  NEW_CASE_EVENT_SUBSCRIPTION,
  TASK_ASSIGNED_SUBSCRIPTION,
} from './caseQueries';

import {
  DOCUMENT_UPLOADED_SUBSCRIPTION,
  DOCUMENT_UPDATED_SUBSCRIPTION,
  DOCUMENT_PROCESSING_STATUS_SUBSCRIPTION,
  DOCUMENT_SHARED_SUBSCRIPTION,
} from './documentQueries';

import {
  NOTIFICATION_RECEIVED_SUBSCRIPTION,
  USER_STATUS_CHANGED_SUBSCRIPTION,
  USER_ONLINE_STATUS_SUBSCRIPTION,
} from './userQueries';

import {
  ANALYTICS_UPDATED_SUBSCRIPTION,
  METRIC_ALERT_SUBSCRIPTION,
  REPORT_GENERATED_SUBSCRIPTION,
} from './analyticsQueries';

// ============ CASE SUBSCRIPTIONS ============

export {
  CASE_CREATED_SUBSCRIPTION,
  CASE_UPDATED_SUBSCRIPTION,
  CASE_STATUS_CHANGED_SUBSCRIPTION,
  NEW_CASE_EVENT_SUBSCRIPTION,
  TASK_ASSIGNED_SUBSCRIPTION,
};

// ============ DOCUMENT SUBSCRIPTIONS ============

export {
  DOCUMENT_UPLOADED_SUBSCRIPTION,
  DOCUMENT_UPDATED_SUBSCRIPTION,
  DOCUMENT_PROCESSING_STATUS_SUBSCRIPTION,
  DOCUMENT_SHARED_SUBSCRIPTION,
};

// ============ USER SUBSCRIPTIONS ============

export {
  NOTIFICATION_RECEIVED_SUBSCRIPTION,
  USER_STATUS_CHANGED_SUBSCRIPTION,
  USER_ONLINE_STATUS_SUBSCRIPTION,
};

// ============ ANALYTICS SUBSCRIPTIONS ============

export {
  ANALYTICS_UPDATED_SUBSCRIPTION,
  METRIC_ALERT_SUBSCRIPTION,
  REPORT_GENERATED_SUBSCRIPTION,
};

// ============ SUBSCRIPTION GROUPS ============

/**
 * All case-related subscriptions
 */
export const CASE_SUBSCRIPTIONS = {
  CASE_CREATED: CASE_CREATED_SUBSCRIPTION,
  CASE_UPDATED: CASE_UPDATED_SUBSCRIPTION,
  CASE_STATUS_CHANGED: CASE_STATUS_CHANGED_SUBSCRIPTION,
  NEW_CASE_EVENT: NEW_CASE_EVENT_SUBSCRIPTION,
  TASK_ASSIGNED: TASK_ASSIGNED_SUBSCRIPTION,
};

/**
 * All document-related subscriptions
 */
export const DOCUMENT_SUBSCRIPTIONS = {
  DOCUMENT_UPLOADED: DOCUMENT_UPLOADED_SUBSCRIPTION,
  DOCUMENT_UPDATED: DOCUMENT_UPDATED_SUBSCRIPTION,
  DOCUMENT_PROCESSING_STATUS: DOCUMENT_PROCESSING_STATUS_SUBSCRIPTION,
  DOCUMENT_SHARED: DOCUMENT_SHARED_SUBSCRIPTION,
};

/**
 * All user-related subscriptions
 */
export const USER_SUBSCRIPTIONS = {
  NOTIFICATION_RECEIVED: NOTIFICATION_RECEIVED_SUBSCRIPTION,
  USER_STATUS_CHANGED: USER_STATUS_CHANGED_SUBSCRIPTION,
  USER_ONLINE_STATUS: USER_ONLINE_STATUS_SUBSCRIPTION,
};

/**
 * All analytics-related subscriptions
 */
export const ANALYTICS_SUBSCRIPTIONS = {
  ANALYTICS_UPDATED: ANALYTICS_UPDATED_SUBSCRIPTION,
  METRIC_ALERT: METRIC_ALERT_SUBSCRIPTION,
  REPORT_GENERATED: REPORT_GENERATED_SUBSCRIPTION,
};

/**
 * All subscriptions grouped by category
 */
export const ALL_SUBSCRIPTIONS = {
  CASE: CASE_SUBSCRIPTIONS,
  DOCUMENT: DOCUMENT_SUBSCRIPTIONS,
  USER: USER_SUBSCRIPTIONS,
  ANALYTICS: ANALYTICS_SUBSCRIPTIONS,
};

/**
 * Get subscription by name
 */
export function getSubscription(category: string, name: string): any {
  const categorySubscriptions = (ALL_SUBSCRIPTIONS as any)[category.toUpperCase()];
  if (!categorySubscriptions) {
    throw new Error(`Subscription category '${category}' not found`);
  }

  const subscription = categorySubscriptions[name.toUpperCase()];
  if (!subscription) {
    throw new Error(`Subscription '${name}' not found in category '${category}'`);
  }

  return subscription;
}

/**
 * Get all subscriptions for a category
 */
export function getCategorySubscriptions(category: string): any[] {
  const categorySubscriptions = (ALL_SUBSCRIPTIONS as any)[category.toUpperCase()];
  if (!categorySubscriptions) {
    throw new Error(`Subscription category '${category}' not found`);
  }

  return Object.values(categorySubscriptions);
}

/**
 * Get all subscription names
 */
export function getAllSubscriptionNames(): string[] {
  const names: string[] = [];

  Object.entries(ALL_SUBSCRIPTIONS).forEach(([category, subscriptions]) => {
    Object.keys(subscriptions).forEach((name) => {
      names.push(`${category}.${name}`);
    });
  });

  return names;
}

export default {
  // Subscription groups
  CASE_SUBSCRIPTIONS,
  DOCUMENT_SUBSCRIPTIONS,
  USER_SUBSCRIPTIONS,
  ANALYTICS_SUBSCRIPTIONS,
  ALL_SUBSCRIPTIONS,

  // Utilities
  getSubscription,
  getCategorySubscriptions,
  getAllSubscriptionNames,
};
