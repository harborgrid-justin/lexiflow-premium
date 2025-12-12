/**
 * GraphQL Mutations for Cases
 */

import { gql } from '@apollo/client';
import { CASE_FRAGMENT } from '../queries/caseQueries';

// Create case
export const CREATE_CASE = gql`
  ${CASE_FRAGMENT}
  mutation CreateCase($input: CreateCaseInput!) {
    createCase(input: $input) {
      ...CaseFields
    }
  }
`;

// Update case
export const UPDATE_CASE = gql`
  ${CASE_FRAGMENT}
  mutation UpdateCase($id: ID!, $input: UpdateCaseInput!) {
    updateCase(id: $id, input: $input) {
      ...CaseFields
    }
  }
`;

// Delete case
export const DELETE_CASE = gql`
  mutation DeleteCase($id: ID!) {
    deleteCase(id: $id) {
      success
      message
    }
  }
`;

// Archive case
export const ARCHIVE_CASE = gql`
  ${CASE_FRAGMENT}
  mutation ArchiveCase($id: ID!) {
    archiveCase(id: $id) {
      ...CaseFields
    }
  }
`;

// Restore archived case
export const RESTORE_CASE = gql`
  ${CASE_FRAGMENT}
  mutation RestoreCase($id: ID!) {
    restoreCase(id: $id) {
      ...CaseFields
    }
  }
`;

// Add party to case
export const ADD_CASE_PARTY = gql`
  mutation AddCaseParty($caseId: ID!, $input: AddPartyInput!) {
    addCaseParty(caseId: $caseId, input: $input) {
      id
      caseId
      type
      fullName
      organizationName
      role
      email
      phoneNumber
      isPrimary
    }
  }
`;

// Remove party from case
export const REMOVE_CASE_PARTY = gql`
  mutation RemoveCaseParty($caseId: ID!, $partyId: ID!) {
    removeCaseParty(caseId: $caseId, partyId: $partyId) {
      success
      message
    }
  }
`;

// Add team member to case
export const ADD_CASE_TEAM_MEMBER = gql`
  mutation AddCaseTeamMember($caseId: ID!, $input: AddTeamMemberInput!) {
    addCaseTeamMember(caseId: $caseId, input: $input) {
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
  }
`;

// Remove team member from case
export const REMOVE_CASE_TEAM_MEMBER = gql`
  mutation RemoveCaseTeamMember($caseId: ID!, $userId: ID!) {
    removeCaseTeamMember(caseId: $caseId, userId: $userId) {
      success
      message
    }
  }
`;

// Link cases
export const LINK_CASES = gql`
  mutation LinkCases($caseId: ID!, $relatedCaseId: ID!, $relationship: String!) {
    linkCases(caseId: $caseId, relatedCaseId: $relatedCaseId, relationship: $relationship) {
      success
      message
    }
  }
`;

// Unlink cases
export const UNLINK_CASES = gql`
  mutation UnlinkCases($caseId: ID!, $relatedCaseId: ID!) {
    unlinkCases(caseId: $caseId, relatedCaseId: $relatedCaseId) {
      success
      message
    }
  }
`;

// Update case status
export const UPDATE_CASE_STATUS = gql`
  ${CASE_FRAGMENT}
  mutation UpdateCaseStatus($id: ID!, $status: String!) {
    updateCaseStatus(id: $id, status: $status) {
      ...CaseFields
    }
  }
`;

// Assign attorney to case
export const ASSIGN_ATTORNEY = gql`
  ${CASE_FRAGMENT}
  mutation AssignAttorney($caseId: ID!, $attorneyId: ID!) {
    assignAttorney(caseId: $caseId, attorneyId: $attorneyId) {
      ...CaseFields
    }
  }
`;

export default {
  CREATE_CASE,
  UPDATE_CASE,
  DELETE_CASE,
  ARCHIVE_CASE,
  RESTORE_CASE,
  ADD_CASE_PARTY,
  REMOVE_CASE_PARTY,
  ADD_CASE_TEAM_MEMBER,
  REMOVE_CASE_TEAM_MEMBER,
  LINK_CASES,
  UNLINK_CASES,
  UPDATE_CASE_STATUS,
  ASSIGN_ATTORNEY,
};
