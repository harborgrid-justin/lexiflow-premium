/**
 * GraphQL Mutations Index
 * Central export for all GraphQL mutations
 */

export * from './caseMutations';
export * from './documentMutations';
export * from './billingMutations';

import caseMutations from './caseMutations';
import documentMutations from './documentMutations';
import billingMutations from './billingMutations';

export default {
  case: caseMutations,
  document: documentMutations,
  billing: billingMutations,
};
