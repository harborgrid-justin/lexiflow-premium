/**
 * GraphQL Subscriptions for Cases (Real-time Updates)
 */

import { gql } from '@apollo/client';
import { CASE_FRAGMENT } from '../queries/caseQueries';

// Subscribe to case updates
export const CASE_UPDATED = gql`
  ${CASE_FRAGMENT}
  subscription OnCaseUpdated($caseId: ID!) {
    caseUpdated(caseId: $caseId) {
      ...CaseFields
      updateType
      updatedBy {
        id
        firstName
        lastName
      }
    }
  }
`;

// Subscribe to new cases
export const NEW_CASE = gql`
  ${CASE_FRAGMENT}
  subscription OnNewCase {
    newCase {
      ...CaseFields
    }
  }
`;

// Subscribe to case status changes
export const CASE_STATUS_CHANGED = gql`
  subscription OnCaseStatusChanged($caseId: ID!) {
    caseStatusChanged(caseId: $caseId) {
      caseId
      oldStatus
      newStatus
      changedBy {
        id
        firstName
        lastName
      }
      timestamp
    }
  }
`;

// Subscribe to case timeline events
export const CASE_TIMELINE_EVENT = gql`
  subscription OnCaseTimelineEvent($caseId: ID!) {
    caseTimelineEvent(caseId: $caseId) {
      id
      caseId
      eventType
      title
      description
      eventDate
      userId
      user {
        id
        firstName
        lastName
      }
      metadata
      createdAt
    }
  }
`;

// Subscribe to case team changes
export const CASE_TEAM_CHANGED = gql`
  subscription OnCaseTeamChanged($caseId: ID!) {
    caseTeamChanged(caseId: $caseId) {
      caseId
      action
      member {
        id
        userId
        user {
          id
          firstName
          lastName
          email
        }
        role
      }
      timestamp
    }
  }
`;

// Subscribe to case document updates
export const CASE_DOCUMENT_UPDATED = gql`
  subscription OnCaseDocumentUpdated($caseId: ID!) {
    caseDocumentUpdated(caseId: $caseId) {
      caseId
      documentId
      action
      document {
        id
        filename
        title
        uploadedBy
        uploadDate
      }
      timestamp
    }
  }
`;

export default {
  CASE_UPDATED,
  NEW_CASE,
  CASE_STATUS_CHANGED,
  CASE_TIMELINE_EVENT,
  CASE_TEAM_CHANGED,
  CASE_DOCUMENT_UPDATED,
};
