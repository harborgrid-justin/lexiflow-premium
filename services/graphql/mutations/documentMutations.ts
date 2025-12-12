/**
 * GraphQL Mutations for Documents
 */

import { gql } from '@apollo/client';
import { DOCUMENT_FRAGMENT } from '../queries/documentQueries';

// Upload document
export const UPLOAD_DOCUMENT = gql`
  ${DOCUMENT_FRAGMENT}
  mutation UploadDocument($input: UploadDocumentInput!) {
    uploadDocument(input: $input) {
      ...DocumentFields
    }
  }
`;

// Update document
export const UPDATE_DOCUMENT = gql`
  ${DOCUMENT_FRAGMENT}
  mutation UpdateDocument($id: ID!, $input: UpdateDocumentInput!) {
    updateDocument(id: $id, input: $input) {
      ...DocumentFields
    }
  }
`;

// Delete document
export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id) {
      success
      message
    }
  }
`;

// Request OCR processing
export const REQUEST_OCR = gql`
  ${DOCUMENT_FRAGMENT}
  mutation RequestOcr($id: ID!) {
    requestOcr(id: $id) {
      ...DocumentFields
    }
  }
`;

// Tag document
export const TAG_DOCUMENT = gql`
  ${DOCUMENT_FRAGMENT}
  mutation TagDocument($id: ID!, $tags: [String!]!) {
    tagDocument(id: $id, tags: $tags) {
      ...DocumentFields
    }
  }
`;

// Remove tag from document
export const UNTAG_DOCUMENT = gql`
  ${DOCUMENT_FRAGMENT}
  mutation UntagDocument($id: ID!, $tag: String!) {
    untagDocument(id: $id, tag: $tag) {
      ...DocumentFields
    }
  }
`;

// Share document
export const SHARE_DOCUMENT = gql`
  mutation ShareDocument($id: ID!, $input: ShareDocumentInput!) {
    shareDocument(id: $id, input: $input) {
      id
      documentId
      sharedWith
      sharedBy
      expiresAt
      canDownload
      canEdit
      shareToken
    }
  }
`;

// Revoke document share
export const REVOKE_SHARE = gql`
  mutation RevokeShare($shareId: ID!) {
    revokeShare(shareId: $shareId) {
      success
      message
    }
  }
`;

// Create document version
export const CREATE_DOCUMENT_VERSION = gql`
  mutation CreateDocumentVersion($documentId: ID!, $input: CreateVersionInput!) {
    createDocumentVersion(documentId: $documentId, input: $input) {
      id
      documentId
      version
      filename
      fileSize
      uploadedBy
      uploadedAt
      changeDescription
    }
  }
`;

// Restore document version
export const RESTORE_DOCUMENT_VERSION = gql`
  ${DOCUMENT_FRAGMENT}
  mutation RestoreDocumentVersion($documentId: ID!, $versionId: ID!) {
    restoreDocumentVersion(documentId: $documentId, versionId: $versionId) {
      ...DocumentFields
    }
  }
`;

// Mark document as privileged
export const MARK_AS_PRIVILEGED = gql`
  ${DOCUMENT_FRAGMENT}
  mutation MarkAsPrivileged($id: ID!, $isPrivileged: Boolean!) {
    markAsPrivileged(id: $id, isPrivileged: $isPrivileged) {
      ...DocumentFields
    }
  }
`;

// Set document confidentiality level
export const SET_CONFIDENTIALITY_LEVEL = gql`
  ${DOCUMENT_FRAGMENT}
  mutation SetConfidentialityLevel($id: ID!, $level: String!) {
    setConfidentialityLevel(id: $id, level: $level) {
      ...DocumentFields
    }
  }
`;

// Move document to case
export const MOVE_DOCUMENT = gql`
  ${DOCUMENT_FRAGMENT}
  mutation MoveDocument($id: ID!, $targetCaseId: ID!) {
    moveDocument(id: $id, targetCaseId: $targetCaseId) {
      ...DocumentFields
    }
  }
`;

// Copy document
export const COPY_DOCUMENT = gql`
  ${DOCUMENT_FRAGMENT}
  mutation CopyDocument($id: ID!, $targetCaseId: ID!) {
    copyDocument(id: $id, targetCaseId: $targetCaseId) {
      ...DocumentFields
    }
  }
`;

export default {
  UPLOAD_DOCUMENT,
  UPDATE_DOCUMENT,
  DELETE_DOCUMENT,
  REQUEST_OCR,
  TAG_DOCUMENT,
  UNTAG_DOCUMENT,
  SHARE_DOCUMENT,
  REVOKE_SHARE,
  CREATE_DOCUMENT_VERSION,
  RESTORE_DOCUMENT_VERSION,
  MARK_AS_PRIVILEGED,
  SET_CONFIDENTIALITY_LEVEL,
  MOVE_DOCUMENT,
  COPY_DOCUMENT,
};
