/**
 * GraphQL Queries for Documents
 */

import { gql } from '@apollo/client';

// Fragment for document fields
export const DOCUMENT_FRAGMENT = gql`
  fragment DocumentFields on Document {
    id
    filename
    title
    description
    fileType
    fileSize
    mimeType
    url
    thumbnailUrl
    caseId
    uploadedBy
    uploadedByUser {
      id
      firstName
      lastName
    }
    uploadDate
    tags
    category
    isPrivileged
    confidentialityLevel
    status
    version
    checksum
    ocrStatus
    ocrText
    metadata
    accessCount
    lastAccessedAt
    createdAt
    updatedAt
  }
`;

// Get all documents with pagination
export const GET_DOCUMENTS = gql`
  ${DOCUMENT_FRAGMENT}
  query GetDocuments($page: Int, $limit: Int, $filters: DocumentFiltersInput) {
    documents(page: $page, limit: $limit, filters: $filters) {
      data {
        ...DocumentFields
      }
      total
      page
      limit
      hasMore
    }
  }
`;

// Get document by ID
export const GET_DOCUMENT_BY_ID = gql`
  ${DOCUMENT_FRAGMENT}
  query GetDocumentById($id: ID!) {
    document(id: $id) {
      ...DocumentFields
      versions {
        id
        version
        filename
        fileSize
        uploadedBy
        uploadedAt
        changeDescription
      }
      accessLog {
        id
        userId
        user {
          id
          firstName
          lastName
        }
        action
        timestamp
        ipAddress
      }
      shares {
        id
        sharedWith
        sharedBy
        expiresAt
        canDownload
        canEdit
      }
    }
  }
`;

// Search documents
export const SEARCH_DOCUMENTS = gql`
  ${DOCUMENT_FRAGMENT}
  query SearchDocuments($query: String!, $filters: DocumentFiltersInput, $page: Int, $limit: Int) {
    searchDocuments(query: $query, filters: $filters, page: $page, limit: $limit) {
      data {
        ...DocumentFields
        _score
        highlights
      }
      total
      page
      limit
    }
  }
`;

// Get document versions
export const GET_DOCUMENT_VERSIONS = gql`
  query GetDocumentVersions($documentId: ID!) {
    documentVersions(documentId: $documentId) {
      id
      documentId
      version
      filename
      fileSize
      uploadedBy
      uploadedByUser {
        id
        firstName
        lastName
      }
      uploadedAt
      changeDescription
      checksum
    }
  }
`;

// Get document tags
export const GET_DOCUMENT_TAGS = gql`
  query GetDocumentTags {
    documentTags {
      tag
      count
    }
  }
`;

// Get recent documents
export const GET_RECENT_DOCUMENTS = gql`
  ${DOCUMENT_FRAGMENT}
  query GetRecentDocuments($limit: Int) {
    recentDocuments(limit: $limit) {
      ...DocumentFields
    }
  }
`;

// Get document statistics
export const GET_DOCUMENT_STATISTICS = gql`
  query GetDocumentStatistics($caseId: ID) {
    documentStatistics(caseId: $caseId) {
      total
      totalSize
      byFileType {
        fileType
        count
        size
      }
      byCategory {
        category
        count
      }
      byStatus {
        status
        count
      }
      privilegedCount
      ocrProcessed
      ocrPending
    }
  }
`;

export default {
  GET_DOCUMENTS,
  GET_DOCUMENT_BY_ID,
  SEARCH_DOCUMENTS,
  GET_DOCUMENT_VERSIONS,
  GET_DOCUMENT_TAGS,
  GET_RECENT_DOCUMENTS,
  GET_DOCUMENT_STATISTICS,
};
