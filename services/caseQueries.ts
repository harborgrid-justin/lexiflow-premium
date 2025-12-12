import { gql } from '@apollo/client';

/**
 * GraphQL queries for case management
 */

export const GET_CASES = gql`
  query GetCases(
    $search: String
    $status: String
    $type: String
    $page: Int
    $limit: Int
  ) {
    cases(
      search: $search
      status: $status
      type: $type
      page: $page
      limit: $limit
    ) {
      data {
        id
        title
        caseNumber
        description
        type
        status
        practiceArea
        jurisdiction
        court
        judge
        filingDate
        trialDate
        closeDate
        assignedTeamId
        leadAttorneyId
        isArchived
        createdAt
        updatedAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_CASE = gql`
  query GetCase($id: ID!) {
    case(id: $id) {
      id
      title
      caseNumber
      description
      type
      status
      practiceArea
      jurisdiction
      court
      judge
      filingDate
      trialDate
      closeDate
      assignedTeamId
      leadAttorneyId
      metadata
      isArchived
      createdAt
      updatedAt
    }
  }
`;

export const GET_CASE_WITH_DETAILS = gql`
  query GetCaseWithDetails($id: ID!) {
    case(id: $id) {
      id
      title
      caseNumber
      description
      type
      status
      practiceArea
      jurisdiction
      court
      judge
      filingDate
      trialDate
      closeDate
      assignedTeamId
      leadAttorneyId
      metadata
      isArchived
      createdAt
      updatedAt
      parties {
        id
        name
        type
        role
        email
        phone
      }
      team {
        id
        userId
        name
        role
        email
        assignedDate
      }
      motions {
        id
        title
        type
        status
        filedDate
        hearingDate
      }
    }
  }
`;

export const GET_CASE_TIMELINE = gql`
  query GetCaseTimeline($caseId: ID!, $eventType: String, $limit: Int) {
    caseTimeline(caseId: $caseId, eventType: $eventType, limit: $limit) {
      id
      caseId
      eventType
      title
      description
      userId
      userName
      metadata
      changes {
        field
        oldValue
        newValue
      }
      eventDate
      createdAt
    }
  }
`;

export const GET_CASE_STATISTICS = gql`
  query GetCaseStatistics($caseId: ID!) {
    caseStatistics(caseId: $caseId) {
      totalEvents
      eventsByType
      recentActivityCount
    }
  }
`;

export const CREATE_CASE = gql`
  mutation CreateCase($input: CreateCaseInput!) {
    createCase(input: $input) {
      id
      title
      caseNumber
      type
      status
      createdAt
    }
  }
`;

export const UPDATE_CASE = gql`
  mutation UpdateCase($id: ID!, $input: UpdateCaseInput!) {
    updateCase(id: $id, input: $input) {
      id
      title
      status
      updatedAt
    }
  }
`;

export const DELETE_CASE = gql`
  mutation DeleteCase($id: ID!) {
    deleteCase(id: $id)
  }
`;

export const ARCHIVE_CASE = gql`
  mutation ArchiveCase($id: ID!) {
    archiveCase(id: $id) {
      id
      isArchived
    }
  }
`;

export const GET_CASE_PARTIES = gql`
  query GetCaseParties($caseId: ID!) {
    caseParties(caseId: $caseId) {
      id
      name
      type
      role
      organization
      email
      phone
      address
      city
      state
      zipCode
      country
      counsel
      notes
    }
  }
`;

export const GET_CASE_TEAM = gql`
  query GetCaseTeam($caseId: ID!) {
    caseTeam(caseId: $caseId) {
      id
      userId
      name
      role
      email
      phone
      hourlyRate
      assignedDate
      isActive
    }
  }
`;

export const GET_CASE_MOTIONS = gql`
  query GetCaseMotions($caseId: ID!) {
    caseMotions(caseId: $caseId) {
      id
      title
      type
      status
      description
      filedBy
      filedDate
      hearingDate
      decisionDate
      relief
      decision
      assignedAttorneyId
    }
  }
`;

export const GET_CASE_DEADLINES = gql`
  query GetCaseDeadlines($caseId: ID!) {
    caseDeadlines(caseId: $caseId) {
      id
      motionId
      type
      title
      description
      dueDate
      status
      assignedToUserId
      assignedToUserName
      reminderDaysBefore
      completedDate
    }
  }
`;

export const GET_DEADLINE_ALERTS = gql`
  query GetDeadlineAlerts($userId: ID, $days: Int) {
    deadlineAlerts(userId: $userId, days: $days) {
      deadline {
        id
        title
        dueDate
        status
        type
      }
      daysUntilDue
      severity
      message
    }
  }
`;
