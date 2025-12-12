/**
 * API Services Index
 * Central export for all API services
 */

// Core services
export * as authService from './authService';
export * as usersService from './usersService';

// Case management
export * as casesService from './casesService';
export * as partiesService from './partiesService';
export * as motionsService from './motionsService';
export * as docketService from './docketService';

// Document management
export * as documentsService from './documentsService';

// Billing services
export * as timeEntriesService from './timeEntriesService';
export * as invoicesService from './invoicesService';
export * as expensesService from './expensesService';

// Other services
export * as billingService from './billingService';
export * as analyticsService from './analyticsService';
export * as complianceService from './complianceService';
export * as discoveryService from './discoveryService';
export * as reportsService from './reportsService';
export * as searchService from './searchService';
export * as notificationsService from './notificationsService';

// Utilities
export * from './apiClient';
export * from './config';
export * from './errors';

// Default export with all services
export default {
  auth: require('./authService'),
  users: require('./usersService'),
  cases: require('./casesService'),
  parties: require('./partiesService'),
  motions: require('./motionsService'),
  docket: require('./docketService'),
  documents: require('./documentsService'),
  timeEntries: require('./timeEntriesService'),
  invoices: require('./invoicesService'),
  expenses: require('./expensesService'),
  billing: require('./billingService'),
  analytics: require('./analyticsService'),
  compliance: require('./complianceService'),
  discovery: require('./discoveryService'),
  reports: require('./reportsService'),
  search: require('./searchService'),
  notifications: require('./notificationsService'),
};
