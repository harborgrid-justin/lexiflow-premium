/**
 * GraphQL Queries for Cases
 */

import { gql } from '@apollo/client';

// Fragment for case fields
export const CASE_FRAGMENT = gql`
  fragment CaseFields on Case {
    id
    caseNumber
    title
    description
    status
    caseType
    courtName
    judge
    filingDate
    trialDate
    closedDate
    priority
    estimatedValue
    actualValue
    clientId
    client {
      id
      name
      email
    }
    assignedAttorneyId
    assignedAttorney {
      id
      firstName
      lastName
      email
    }
    tags
    isArchived
    createdAt
    updatedAt
  }
`;

// Get all cases with pagination
export const GET_CASES = gql`
  ${CASE_FRAGMENT}
  query GetCases($page: Int, $limit: Int, $filters: CaseFiltersInput) {
    cases(page: $page, limit: $limit, filters: $filters) {
      data {
        ...CaseFields
      }
      total
      page
      limit
      hasMore
    }
  }
`;

// Get single case by ID
export const GET_CASE_BY_ID = gql`
  ${CASE_FRAGMENT}
  query GetCaseById($id: ID!) {
    case(id: $id) {
      ...CaseFields
      parties {
        id
        type
        fullName
        organizationName
        role
        email
        phoneNumber
      }
      team {
        id
        userId
        user {
          id
          firstName
          lastName
          email
        }
        role
        isPrimary
      }
      relatedCases {
        id
        caseNumber
        title
        relationship
      }
    }
  }
`;

// Get case statistics
export const GET_CASE_STATISTICS = gql`
  query GetCaseStatistics($filters: CaseFiltersInput) {
    caseStatistics(filters: $filters) {
      total
      byStatus {
        status
        count
      }
      byType {
        type
        count
      }
      byPriority {
        priority
        count
      }
      totalValue
      averageValue
    }
  }
`;

// Get case timeline
export const GET_CASE_TIMELINE = gql`
  query GetCaseTimeline($caseId: ID!, $limit: Int) {
    caseTimeline(caseId: $caseId, limit: $limit) {
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

// Get case documents
export const GET_CASE_DOCUMENTS = gql`
  query GetCaseDocuments($caseId: ID!, $page: Int, $limit: Int) {
    caseDocuments(caseId: $caseId, page: $page, limit: $limit) {
      data {
        id
        filename
        title
        description
        fileType
        fileSize
        uploadDate
        uploadedBy
        tags
        isPrivileged
        status
      }
      total
      page
      limit
    }
  }
`;

// Search cases
export const SEARCH_CASES = gql`
  ${CASE_FRAGMENT}
  query SearchCases($query: String!, $filters: CaseFiltersInput, $page: Int, $limit: Int) {
    searchCases(query: $query, filters: $filters, page: $page, limit: $limit) {
      data {
        ...CaseFields
        _score
        highlights
      }
      total
      page
      limit
    }
  }
`;

// Get my assigned cases
export const GET_MY_CASES = gql`
  ${CASE_FRAGMENT}
  query GetMyCases($page: Int, $limit: Int) {
    myCases(page: $page, limit: $limit) {
      data {
        ...CaseFields
      }
      total
      page
      limit
    }
  }
`;

// Get recent cases
export const GET_RECENT_CASES = gql`
  ${CASE_FRAGMENT}
  query GetRecentCases($limit: Int) {
    recentCases(limit: $limit) {
      ...CaseFields
    }
  }
`;

export default {
  GET_CASES,
  GET_CASE_BY_ID,
  GET_CASE_STATISTICS,
  GET_CASE_TIMELINE,
  GET_CASE_DOCUMENTS,
  SEARCH_CASES,
  GET_MY_CASES,
  GET_RECENT_CASES,
};
