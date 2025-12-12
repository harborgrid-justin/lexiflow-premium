/**
 * GraphQL Queries Index
 * Central export for all GraphQL queries
 */

export * from './caseQueries';
export * from './documentQueries';
export * from './billingQueries';

import caseQueries from './caseQueries';
import documentQueries from './documentQueries';
import billingQueries from './billingQueries';

export default {
  case: caseQueries,
  document: documentQueries,
  billing: billingQueries,
};
