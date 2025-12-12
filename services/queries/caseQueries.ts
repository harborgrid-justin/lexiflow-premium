import { gql } from '@apollo/client';

/**
 * GraphQL Queries and Mutations for Case Management
 */

// ============ FRAGMENTS ============

export const CASE_FRAGMENT = gql`
  fragment CaseFields on Case {
    id
    caseNumber
    title
    description
    status
    priority
    practiceArea
    jurisdiction
    courtName
    judgeAssigned
    filingDate
    trialDate
    closeDate
    tags
    createdAt
    updatedAt
  }
`;

export const CASE_DETAIL_FRAGMENT = gql`
  ${CASE_FRAGMENT}
  fragment CaseDetailFields on Case {
    ...CaseFields
    client {
      id
      name
      email
      type
    }
    assignedAttorneys {
      id
      firstName
      lastName
      email
      title
    }
    caseTeam {
      id
      user {
        id
        firstName
        lastName
        email
      }
      role
      assignedDate
    }
    phases {
      id
      name
      status
      startDate
      endDate
      completionPercentage
    }
    billing {
      totalBilled
      totalPaid
      outstanding
      currency
    }
    aiInsights {
      riskAssessment {
        overallRisk
        riskScore
      }
      predictedOutcome {
        predictedResult
        confidence
      }
    }
  }
`;

// ============ QUERIES ============

export const GET_CASE = gql`
  ${CASE_DETAIL_FRAGMENT}
  query GetCase($id: ID!) {
    case(id: $id) {
      ...CaseDetailFields
    }
  }
`;

export const GET_CASE_BY_NUMBER = gql`
  ${CASE_DETAIL_FRAGMENT}
  query GetCaseByNumber($caseNumber: String!) {
    caseByNumber(caseNumber: $caseNumber) {
      ...CaseDetailFields
    }
  }
`;

export const GET_CASES = gql`
  ${CASE_FRAGMENT}
  query GetCases(
    $filter: CaseFilter
    $sort: CaseSort
    $pagination: PaginationInput
  ) {
    cases(filter: $filter, sort: $sort, pagination: $pagination) {
      edges {
        node {
          ...CaseFields
          client {
            id
            name
          }
          assignedAttorneys {
            id
            firstName
            lastName
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_MY_CASES = gql`
  ${CASE_FRAGMENT}
  query GetMyCases($status: CaseStatus, $pagination: PaginationInput) {
    myCases(status: $status, pagination: $pagination) {
      edges {
        node {
          ...CaseFields
          client {
            id
            name
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const SEARCH_CASES = gql`
  ${CASE_FRAGMENT}
  query SearchCases($query: String!, $filters: CaseFilter) {
    searchCases(query: $query, filters: $filters) {
      ...CaseFields
      client {
        id
        name
      }
    }
  }
`;

export const GET_CASE_STATISTICS = gql`
  query GetCaseStatistics($dateRange: DateRangeInput) {
    caseStatistics(dateRange: $dateRange) {
      totalCases
      activeCases
      closedCases
      averageResolutionTime
      successRate
      casesByMonth {
        month
        count
      }
    }
  }
`;

export const GET_CASES_BY_STATUS = gql`
  query GetCasesByStatus {
    casesByStatus {
      status
      count
    }
  }
`;

export const GET_CASES_BY_PRIORITY = gql`
  query GetCasesByPriority {
    casesByPriority {
      priority
      count
    }
  }
`;

// ============ MUTATIONS ============

export const CREATE_CASE = gql`
  ${CASE_DETAIL_FRAGMENT}
  mutation CreateCase($input: CreateCaseInput!) {
    createCase(input: $input) {
      ...CaseDetailFields
    }
  }
`;

export const UPDATE_CASE = gql`
  ${CASE_DETAIL_FRAGMENT}
  mutation UpdateCase($id: ID!, $input: UpdateCaseInput!) {
    updateCase(id: $id, input: $input) {
      ...CaseDetailFields
    }
  }
`;

export const DELETE_CASE = gql`
  mutation DeleteCase($id: ID!) {
    deleteCase(id: $id)
  }
`;

export const ARCHIVE_CASE = gql`
  ${CASE_FRAGMENT}
  mutation ArchiveCase($id: ID!) {
    archiveCase(id: $id) {
      ...CaseFields
    }
  }
`;

export const CHANGE_CASE_STATUS = gql`
  ${CASE_DETAIL_FRAGMENT}
  mutation ChangeCaseStatus($id: ID!, $status: CaseStatus!) {
    changeCaseStatus(id: $id, status: $status) {
      ...CaseDetailFields
    }
  }
`;

export const ASSIGN_CASE = gql`
  ${CASE_DETAIL_FRAGMENT}
  mutation AssignCase($id: ID!, $userId: ID!, $role: TeamRole!) {
    assignCase(id: $id, userId: $userId, role: $role) {
      ...CaseDetailFields
    }
  }
`;

export const UNASSIGN_CASE = gql`
  ${CASE_DETAIL_FRAGMENT}
  mutation UnassignCase($id: ID!, $userId: ID!) {
    unassignCase(id: $id, userId: $userId) {
      ...CaseDetailFields
    }
  }
`;

export const ADD_CASE_PHASE = gql`
  mutation AddCasePhase($caseId: ID!, $input: CreatePhaseInput!) {
    addPhase(caseId: $caseId, input: $input) {
      id
      name
      description
      status
      startDate
      endDate
      completionPercentage
      order
    }
  }
`;

export const UPDATE_CASE_PHASE = gql`
  mutation UpdateCasePhase($id: ID!, $input: UpdatePhaseInput!) {
    updatePhase(id: $id, input: $input) {
      id
      name
      description
      status
      startDate
      endDate
      completionPercentage
      order
    }
  }
`;

export const DELETE_CASE_PHASE = gql`
  mutation DeleteCasePhase($id: ID!) {
    deletePhase(id: $id)
  }
`;

export const ADD_CASE_EVENT = gql`
  mutation AddCaseEvent($caseId: ID!, $input: CreateEventInput!) {
    addEvent(caseId: $caseId, input: $input) {
      id
      eventType
      title
      description
      eventDate
      location
      participants
      createdAt
    }
  }
`;

export const UPDATE_CASE_EVENT = gql`
  mutation UpdateCaseEvent($id: ID!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      eventType
      title
      description
      eventDate
      location
      participants
    }
  }
`;

export const DELETE_CASE_EVENT = gql`
  mutation DeleteCaseEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

export const ADD_CASE_TASK = gql`
  mutation AddCaseTask($caseId: ID!, $input: CreateTaskInput!) {
    addTask(caseId: $caseId, input: $input) {
      id
      title
      description
      status
      priority
      dueDate
      assignedTo {
        id
        firstName
        lastName
      }
      tags
    }
  }
`;

export const UPDATE_CASE_TASK = gql`
  mutation UpdateCaseTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      description
      status
      priority
      dueDate
      tags
    }
  }
`;

export const COMPLETE_CASE_TASK = gql`
  mutation CompleteCaseTask($id: ID!) {
    completeTask(id: $id) {
      id
      status
      completedAt
    }
  }
`;

export const DELETE_CASE_TASK = gql`
  mutation DeleteCaseTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

// ============ SUBSCRIPTIONS ============

export const CASE_CREATED_SUBSCRIPTION = gql`
  ${CASE_FRAGMENT}
  subscription OnCaseCreated {
    caseCreated {
      ...CaseFields
      client {
        id
        name
      }
    }
  }
`;

export const CASE_UPDATED_SUBSCRIPTION = gql`
  ${CASE_DETAIL_FRAGMENT}
  subscription OnCaseUpdated($caseId: ID) {
    caseUpdated(caseId: $caseId) {
      ...CaseDetailFields
    }
  }
`;

export const CASE_STATUS_CHANGED_SUBSCRIPTION = gql`
  subscription OnCaseStatusChanged($caseId: ID) {
    caseStatusChanged(caseId: $caseId) {
      case {
        id
        caseNumber
        title
        status
      }
      previousStatus
      newStatus
      changedBy {
        id
        firstName
        lastName
      }
      changedAt
    }
  }
`;

export const NEW_CASE_EVENT_SUBSCRIPTION = gql`
  subscription OnNewCaseEvent($caseId: ID!) {
    newCaseEvent(caseId: $caseId) {
      id
      eventType
      title
      description
      eventDate
      createdAt
    }
  }
`;

export const TASK_ASSIGNED_SUBSCRIPTION = gql`
  subscription OnTaskAssigned($userId: ID!) {
    taskAssigned(userId: $userId) {
      id
      title
      description
      priority
      dueDate
      case {
        id
        caseNumber
        title
      }
    }
  }
`;

export default {
  // Fragments
  CASE_FRAGMENT,
  CASE_DETAIL_FRAGMENT,

  // Queries
  GET_CASE,
  GET_CASE_BY_NUMBER,
  GET_CASES,
  GET_MY_CASES,
  SEARCH_CASES,
  GET_CASE_STATISTICS,
  GET_CASES_BY_STATUS,
  GET_CASES_BY_PRIORITY,

  // Mutations
  CREATE_CASE,
  UPDATE_CASE,
  DELETE_CASE,
  ARCHIVE_CASE,
  CHANGE_CASE_STATUS,
  ASSIGN_CASE,
  UNASSIGN_CASE,
  ADD_CASE_PHASE,
  UPDATE_CASE_PHASE,
  DELETE_CASE_PHASE,
  ADD_CASE_EVENT,
  UPDATE_CASE_EVENT,
  DELETE_CASE_EVENT,
  ADD_CASE_TASK,
  UPDATE_CASE_TASK,
  COMPLETE_CASE_TASK,
  DELETE_CASE_TASK,

  // Subscriptions
  CASE_CREATED_SUBSCRIPTION,
  CASE_UPDATED_SUBSCRIPTION,
  CASE_STATUS_CHANGED_SUBSCRIPTION,
  NEW_CASE_EVENT_SUBSCRIPTION,
  TASK_ASSIGNED_SUBSCRIPTION,
};
