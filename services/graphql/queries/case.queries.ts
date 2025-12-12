import { gql } from '@apollo/client';

export const CASE_FRAGMENT = gql`
  fragment CaseFields on CaseType {
    id
    caseNumber
    title
    type
    status
    description
    court
    jurisdiction
    filingDate
    closedDate
    createdAt
    updatedAt
    createdBy {
      id
      fullName
      email
    }
  }
`;

export const GET_CASES = gql`
  ${CASE_FRAGMENT}
  query GetCases($filter: CaseFilterInput, $pagination: PaginationInput) {
    cases(filter: $filter, pagination: $pagination) {
      edges {
        node {
          ...CaseFields
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

export const GET_CASE = gql`
  ${CASE_FRAGMENT}
  query GetCase($id: ID!) {
    case(id: $id) {
      ...CaseFields
      parties {
        id
        name
        role
        email
        phone
        createdAt
        updatedAt
      }
      teamMembers {
        id
        user {
          id
          fullName
          email
          role
        }
        role
        billable
        joinedAt
      }
      phases {
        id
        name
        status
        description
        startDate
        endDate
        createdAt
      }
      motions {
        id
        title
        type
        status
        description
        filedDate
        hearingDate
        createdAt
      }
      docketEntries {
        id
        entryNumber
        description
        filedDate
        filedBy
        createdAt
      }
      documents {
        id
        title
        documentType
        status
        fileName
        createdAt
      }
    }
  }
`;

export const CREATE_CASE = gql`
  ${CASE_FRAGMENT}
  mutation CreateCase($input: CreateCaseInput!) {
    createCase(input: $input) {
      ...CaseFields
    }
  }
`;

export const UPDATE_CASE = gql`
  ${CASE_FRAGMENT}
  mutation UpdateCase($id: ID!, $input: UpdateCaseInput!) {
    updateCase(id: $id, input: $input) {
      ...CaseFields
    }
  }
`;

export const DELETE_CASE = gql`
  mutation DeleteCase($id: ID!) {
    deleteCase(id: $id)
  }
`;

export const ADD_PARTY = gql`
  ${CASE_FRAGMENT}
  mutation AddParty($input: AddPartyInput!) {
    addParty(input: $input) {
      ...CaseFields
    }
  }
`;

export const ADD_TEAM_MEMBER = gql`
  ${CASE_FRAGMENT}
  mutation AddTeamMember($input: AddTeamMemberInput!) {
    addTeamMember(input: $input) {
      ...CaseFields
    }
  }
`;

export const CREATE_MOTION = gql`
  ${CASE_FRAGMENT}
  mutation CreateMotion($input: CreateMotionInput!) {
    createMotion(input: $input) {
      ...CaseFields
    }
  }
`;

export const CREATE_DOCKET_ENTRY = gql`
  ${CASE_FRAGMENT}
  mutation CreateDocketEntry($input: CreateDocketEntryInput!) {
    createDocketEntry(input: $input) {
      ...CaseFields
    }
  }
`;

export const GET_CASE_METRICS = gql`
  query GetCaseMetrics {
    caseMetrics {
      totalCases
      activeCases
      closedCases
      pendingCases
      byType {
        type
        count
      }
      byStatus {
        status
        count
      }
    }
  }
`;
