import { gql } from '@apollo/client';

/**
 * GraphQL Queries and Mutations for Document Management
 */

// ============ FRAGMENTS ============

export const DOCUMENT_FRAGMENT = gql`
  fragment DocumentFields on Document {
    id
    title
    fileName
    fileSize
    mimeType
    documentType
    category
    status
    version
    url
    downloadUrl
    thumbnailUrl
    pageCount
    wordCount
    confidentialityLevel
    createdAt
    updatedAt
  }
`;

export const DOCUMENT_DETAIL_FRAGMENT = gql`
  ${DOCUMENT_FRAGMENT}
  fragment DocumentDetailFields on Document {
    ...DocumentFields
    description
    extractedText
    language
    case {
      id
      caseNumber
      title
    }
    uploadedBy {
      id
      firstName
      lastName
      email
    }
    folder {
      id
      name
      path
    }
    tags {
      id
      name
      color
      category
    }
    aiAnalysis {
      id
      summary
      keyPoints
      sentiment {
        overall
        score
      }
      complexity {
        score
        level
      }
      processedAt
      confidence
    }
    entities {
      id
      type
      text
      confidence
    }
    clauses {
      id
      type
      title
      text
      riskLevel
    }
    accessControl {
      isPublic
      permissions {
        canView
        canEdit
        canDelete
        canShare
        canDownload
      }
    }
  }
`;

// ============ QUERIES ============

export const GET_DOCUMENT = gql`
  ${DOCUMENT_DETAIL_FRAGMENT}
  query GetDocument($id: ID!) {
    document(id: $id) {
      ...DocumentDetailFields
    }
  }
`;

export const GET_DOCUMENTS = gql`
  ${DOCUMENT_FRAGMENT}
  query GetDocuments(
    $filter: DocumentFilter
    $sort: DocumentSort
    $pagination: PaginationInput
  ) {
    documents(filter: $filter, sort: $sort, pagination: $pagination) {
      edges {
        node {
          ...DocumentFields
          uploadedBy {
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

export const SEARCH_DOCUMENTS = gql`
  ${DOCUMENT_FRAGMENT}
  query SearchDocuments($query: String!, $filters: DocumentFilter) {
    searchDocuments(query: $query, filters: $filters) {
      ...DocumentFields
    }
  }
`;

export const FULL_TEXT_SEARCH = gql`
  query FullTextSearch(
    $query: String!
    $caseId: ID
    $documentTypes: [DocumentType!]
  ) {
    fullTextSearch(query: $query, caseId: $caseId, documentTypes: $documentTypes) {
      document {
        id
        title
        fileName
        documentType
      }
      score
      highlights {
        field
        snippet
        matches
      }
      context
    }
  }
`;

export const GET_FOLDER = gql`
  query GetFolder($id: ID!) {
    folder(id: $id) {
      id
      name
      path
      color
      icon
      parent {
        id
        name
      }
      children {
        id
        name
        path
      }
      documents {
        id
        title
        fileName
        documentType
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_FOLDERS = gql`
  query GetFolders($caseId: ID) {
    folders(caseId: $caseId) {
      id
      name
      path
      color
      icon
      children {
        id
        name
      }
    }
  }
`;

export const GET_DOCUMENT_VERSIONS = gql`
  query GetDocumentVersions($documentId: ID!) {
    documentVersions(documentId: $documentId) {
      id
      versionNumber
      fileName
      fileSize
      changeDescription
      isCurrent
      createdBy {
        id
        firstName
        lastName
      }
      createdAt
    }
  }
`;

export const GET_DOCUMENT_ANALYSIS = gql`
  query GetDocumentAnalysis($documentId: ID!) {
    documentAnalysis(documentId: $documentId) {
      id
      summary
      keyPoints
      sentiment {
        overall
        score
        positive
        negative
        neutral
      }
      topics {
        name
        relevance
        keywords
      }
      complexity {
        score
        level
        factors
      }
      legalIssues {
        category
        description
        severity
        recommendations
      }
      riskFactors {
        category
        description
        severity
        likelihood
      }
      recommendations
      processedAt
      confidence
    }
  }
`;

export const COMPARE_DOCUMENTS = gql`
  query CompareDocuments($id1: ID!, $id2: ID!) {
    compareDocuments(id1: $id1, id2: $id2) {
      id
      document1 {
        id
        title
      }
      document2 {
        id
        title
      }
      differences {
        type
        section
        oldText
        newText
        severity
      }
      similarity
      comparedAt
    }
  }
`;

export const GET_TAGS = gql`
  query GetTags($category: String) {
    tags(category: $category) {
      id
      name
      color
      category
      usageCount
    }
  }
`;

export const GET_POPULAR_TAGS = gql`
  query GetPopularTags($limit: Int = 20) {
    popularTags(limit: $limit) {
      id
      name
      color
      usageCount
    }
  }
`;

export const GET_DOCUMENT_STATISTICS = gql`
  query GetDocumentStatistics($caseId: ID, $dateRange: DateRangeInput) {
    documentStatistics(caseId: $caseId, dateRange: $dateRange) {
      totalDocuments
      totalSize
      documentsByType {
        type
        count
      }
      documentsByStatus {
        status
        count
      }
      uploadsOverTime {
        timestamp
        value
      }
      averageProcessingTime
    }
  }
`;

// ============ MUTATIONS ============

export const UPLOAD_DOCUMENT = gql`
  ${DOCUMENT_DETAIL_FRAGMENT}
  mutation UploadDocument($input: UploadDocumentInput!) {
    uploadDocument(input: $input) {
      ...DocumentDetailFields
    }
  }
`;

export const CREATE_DOCUMENT = gql`
  ${DOCUMENT_DETAIL_FRAGMENT}
  mutation CreateDocument($input: CreateDocumentInput!) {
    createDocument(input: $input) {
      ...DocumentDetailFields
    }
  }
`;

export const UPDATE_DOCUMENT = gql`
  ${DOCUMENT_DETAIL_FRAGMENT}
  mutation UpdateDocument($id: ID!, $input: UpdateDocumentInput!) {
    updateDocument(id: $id, input: $input) {
      ...DocumentDetailFields
    }
  }
`;

export const UPDATE_DOCUMENT_METADATA = gql`
  ${DOCUMENT_DETAIL_FRAGMENT}
  mutation UpdateDocumentMetadata($id: ID!, $metadata: JSON!) {
    updateDocumentMetadata(id: $id, metadata: $metadata) {
      ...DocumentDetailFields
    }
  }
`;

export const CREATE_DOCUMENT_VERSION = gql`
  mutation CreateDocumentVersion(
    $documentId: ID!
    $file: Upload!
    $changeDescription: String
  ) {
    createDocumentVersion(
      documentId: $documentId
      file: $file
      changeDescription: $changeDescription
    ) {
      id
      versionNumber
      fileName
      isCurrent
      createdAt
    }
  }
`;

export const RESTORE_DOCUMENT_VERSION = gql`
  ${DOCUMENT_DETAIL_FRAGMENT}
  mutation RestoreDocumentVersion($versionId: ID!) {
    restoreDocumentVersion(versionId: $versionId) {
      ...DocumentDetailFields
    }
  }
`;

export const MOVE_DOCUMENT = gql`
  ${DOCUMENT_DETAIL_FRAGMENT}
  mutation MoveDocument($id: ID!, $folderId: ID!) {
    moveDocument(id: $id, folderId: $folderId) {
      ...DocumentDetailFields
    }
  }
`;

export const ADD_DOCUMENT_TAGS = gql`
  ${DOCUMENT_DETAIL_FRAGMENT}
  mutation AddDocumentTags($id: ID!, $tags: [String!]!) {
    addDocumentTags(id: $id, tags: $tags) {
      ...DocumentDetailFields
    }
  }
`;

export const REMOVE_DOCUMENT_TAGS = gql`
  ${DOCUMENT_DETAIL_FRAGMENT}
  mutation RemoveDocumentTags($id: ID!, $tags: [String!]!) {
    removeDocumentTags(id: $id, tags: $tags) {
      ...DocumentDetailFields
    }
  }
`;

export const CREATE_FOLDER = gql`
  mutation CreateFolder($input: CreateFolderInput!) {
    createFolder(input: $input) {
      id
      name
      path
      color
      icon
    }
  }
`;

export const UPDATE_FOLDER = gql`
  mutation UpdateFolder($id: ID!, $input: UpdateFolderInput!) {
    updateFolder(id: $id, input: $input) {
      id
      name
      color
      icon
    }
  }
`;

export const DELETE_FOLDER = gql`
  mutation DeleteFolder($id: ID!, $deleteDocuments: Boolean = false) {
    deleteFolder(id: $id, deleteDocuments: $deleteDocuments)
  }
`;

export const MOVE_FOLDER = gql`
  mutation MoveFolder($id: ID!, $parentId: ID) {
    moveFolder(id: $id, parentId: $parentId) {
      id
      path
    }
  }
`;

export const REQUEST_OCR = gql`
  mutation RequestOCR($documentId: ID!) {
    requestOCR(documentId: $documentId) {
      id
      status
      text
      confidence
    }
  }
`;

export const REQUEST_AI_ANALYSIS = gql`
  mutation RequestAIAnalysis($documentId: ID!) {
    requestAIAnalysis(documentId: $documentId) {
      id
      summary
      keyPoints
      processedAt
      confidence
    }
  }
`;

export const CANCEL_PROCESSING = gql`
  mutation CancelProcessing($documentId: ID!) {
    cancelProcessing(documentId: $documentId)
  }
`;

export const UPDATE_ACCESS_CONTROL = gql`
  ${DOCUMENT_DETAIL_FRAGMENT}
  mutation UpdateAccessControl($documentId: ID!, $accessControl: AccessControlInput!) {
    updateAccessControl(documentId: $documentId, accessControl: $accessControl) {
      ...DocumentDetailFields
    }
  }
`;

export const SHARE_DOCUMENT = gql`
  ${DOCUMENT_DETAIL_FRAGMENT}
  mutation ShareDocument(
    $documentId: ID!
    $userIds: [ID!]!
    $permissions: PermissionsInput!
  ) {
    shareDocument(documentId: $documentId, userIds: $userIds, permissions: $permissions) {
      ...DocumentDetailFields
    }
  }
`;

export const ARCHIVE_DOCUMENT = gql`
  ${DOCUMENT_FRAGMENT}
  mutation ArchiveDocument($id: ID!) {
    archiveDocument(id: $id) {
      ...DocumentFields
    }
  }
`;

export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id)
  }
`;

export const PERMANENTLY_DELETE_DOCUMENT = gql`
  mutation PermanentlyDeleteDocument($id: ID!) {
    permanentlyDeleteDocument(id: $id)
  }
`;

export const RESTORE_DOCUMENT = gql`
  ${DOCUMENT_DETAIL_FRAGMENT}
  mutation RestoreDocument($id: ID!) {
    restoreDocument(id: $id) {
      ...DocumentDetailFields
    }
  }
`;

// ============ SUBSCRIPTIONS ============

export const DOCUMENT_UPLOADED_SUBSCRIPTION = gql`
  ${DOCUMENT_FRAGMENT}
  subscription OnDocumentUploaded($caseId: ID) {
    documentUploaded(caseId: $caseId) {
      ...DocumentFields
      uploadedBy {
        id
        firstName
        lastName
      }
    }
  }
`;

export const DOCUMENT_UPDATED_SUBSCRIPTION = gql`
  ${DOCUMENT_DETAIL_FRAGMENT}
  subscription OnDocumentUpdated($documentId: ID) {
    documentUpdated(documentId: $documentId) {
      ...DocumentDetailFields
    }
  }
`;

export const DOCUMENT_PROCESSING_STATUS_SUBSCRIPTION = gql`
  subscription OnDocumentProcessingStatus($documentId: ID!) {
    documentProcessingStatus(documentId: $documentId) {
      documentId
      status
      progress
      message
      completedAt
    }
  }
`;

export const DOCUMENT_SHARED_SUBSCRIPTION = gql`
  subscription OnDocumentShared($userId: ID!) {
    documentShared(userId: $userId) {
      document {
        id
        title
        documentType
      }
      sharedBy {
        id
        firstName
        lastName
      }
      sharedWith {
        id
        firstName
        lastName
      }
      permissions {
        canView
        canEdit
        canDownload
      }
      sharedAt
      message
    }
  }
`;

export default {
  // Fragments
  DOCUMENT_FRAGMENT,
  DOCUMENT_DETAIL_FRAGMENT,

  // Queries
  GET_DOCUMENT,
  GET_DOCUMENTS,
  SEARCH_DOCUMENTS,
  FULL_TEXT_SEARCH,
  GET_FOLDER,
  GET_FOLDERS,
  GET_DOCUMENT_VERSIONS,
  GET_DOCUMENT_ANALYSIS,
  COMPARE_DOCUMENTS,
  GET_TAGS,
  GET_POPULAR_TAGS,
  GET_DOCUMENT_STATISTICS,

  // Mutations
  UPLOAD_DOCUMENT,
  CREATE_DOCUMENT,
  UPDATE_DOCUMENT,
  UPDATE_DOCUMENT_METADATA,
  CREATE_DOCUMENT_VERSION,
  RESTORE_DOCUMENT_VERSION,
  MOVE_DOCUMENT,
  ADD_DOCUMENT_TAGS,
  REMOVE_DOCUMENT_TAGS,
  CREATE_FOLDER,
  UPDATE_FOLDER,
  DELETE_FOLDER,
  MOVE_FOLDER,
  REQUEST_OCR,
  REQUEST_AI_ANALYSIS,
  CANCEL_PROCESSING,
  UPDATE_ACCESS_CONTROL,
  SHARE_DOCUMENT,
  ARCHIVE_DOCUMENT,
  DELETE_DOCUMENT,
  PERMANENTLY_DELETE_DOCUMENT,
  RESTORE_DOCUMENT,

  // Subscriptions
  DOCUMENT_UPLOADED_SUBSCRIPTION,
  DOCUMENT_UPDATED_SUBSCRIPTION,
  DOCUMENT_PROCESSING_STATUS_SUBSCRIPTION,
  DOCUMENT_SHARED_SUBSCRIPTION,
};
