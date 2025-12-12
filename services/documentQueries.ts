import { gql } from '@apollo/client';

// Document Queries
export const GET_DOCUMENTS = gql`
  query GetDocuments(
    $caseId: String
    $type: String
    $status: String
    $search: String
    $page: Int
    $limit: Int
  ) {
    documents(
      caseId: $caseId
      type: $type
      status: $status
      search: $search
      page: $page
      limit: $limit
    ) {
      data {
        id
        title
        description
        type
        caseId
        status
        filename
        mimeType
        fileSize
        currentVersion
        author
        pageCount
        wordCount
        language
        tags
        ocrProcessed
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

export const GET_DOCUMENT = gql`
  query GetDocument($id: ID!) {
    document(id: $id) {
      id
      title
      description
      type
      caseId
      status
      filename
      filePath
      mimeType
      fileSize
      checksum
      currentVersion
      author
      pageCount
      wordCount
      language
      tags
      customFields
      fullTextContent
      ocrProcessed
      ocrProcessedAt
      createdAt
      updatedAt
      createdBy
      updatedBy
    }
  }
`;

export const CREATE_DOCUMENT = gql`
  mutation CreateDocument($input: CreateDocumentInput!) {
    createDocument(input: $input) {
      id
      title
      type
      caseId
      status
      filename
      mimeType
      fileSize
      createdAt
    }
  }
`;

export const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument($id: ID!, $input: UpdateDocumentInput!) {
    updateDocument(id: $id, input: $input) {
      id
      title
      description
      status
      tags
      updatedAt
    }
  }
`;

export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id) {
      success
      message
    }
  }
`;

// Template Queries
export const GET_TEMPLATES = gql`
  query GetTemplates($category: String, $isActive: Boolean) {
    documentTemplates(category: $category, isActive: $isActive) {
      id
      name
      description
      category
      tags
      variables
      isActive
      usageCount
      lastUsedAt
      createdAt
    }
  }
`;

export const GET_TEMPLATE = gql`
  query GetTemplate($id: ID!) {
    documentTemplate(id: $id) {
      id
      name
      description
      content
      category
      tags
      variables
      defaultVariables
      isActive
      usageCount
      lastUsedAt
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($input: CreateTemplateInput!) {
    createTemplate(input: $input) {
      id
      name
      description
      content
      category
      isActive
      createdAt
    }
  }
`;

export const UPDATE_TEMPLATE = gql`
  mutation UpdateTemplate($id: ID!, $input: UpdateTemplateInput!) {
    updateTemplate(id: $id, input: $input) {
      id
      name
      description
      content
      category
      isActive
      updatedAt
    }
  }
`;

export const DELETE_TEMPLATE = gql`
  mutation DeleteTemplate($id: ID!) {
    deleteTemplate(id: $id) {
      success
      message
    }
  }
`;

export const GENERATE_FROM_TEMPLATE = gql`
  mutation GenerateFromTemplate($templateId: ID!, $variables: JSON!) {
    generateFromTemplate(templateId: $templateId, variables: $variables) {
      content
    }
  }
`;

// Version Queries
export const GET_VERSION_HISTORY = gql`
  query GetVersionHistory($documentId: ID!) {
    versionHistory(documentId: $documentId) {
      id
      documentId
      version
      filename
      mimeType
      fileSize
      checksum
      changeDescription
      metadata
      createdAt
      createdBy
    }
  }
`;

export const GET_VERSION = gql`
  query GetVersion($documentId: ID!, $version: Int!) {
    documentVersion(documentId: $documentId, version: $version) {
      id
      documentId
      version
      filename
      filePath
      mimeType
      fileSize
      checksum
      changeDescription
      metadata
      createdAt
      createdBy
    }
  }
`;

export const CREATE_VERSION = gql`
  mutation CreateVersion($input: CreateVersionInput!) {
    createVersion(input: $input) {
      id
      documentId
      version
      filename
      changeDescription
      createdAt
    }
  }
`;

export const COMPARE_VERSIONS = gql`
  query CompareVersions($documentId: ID!, $version1: Int!, $version2: Int!) {
    compareVersions(
      documentId: $documentId
      version1: $version1
      version2: $version2
    ) {
      version1 {
        id
        version
        filename
        fileSize
      }
      version2 {
        id
        version
        filename
        fileSize
      }
      differences {
        fileSize
        pageCount
        wordCount
        checksumMatch
      }
    }
  }
`;

export const RESTORE_VERSION = gql`
  mutation RestoreVersion($documentId: ID!, $version: Int!, $caseId: String!) {
    restoreVersion(documentId: $documentId, version: $version, caseId: $caseId) {
      id
      documentId
      version
      changeDescription
      createdAt
    }
  }
`;

// Clause Queries
export const GET_CLAUSES = gql`
  query GetClauses(
    $category: String
    $search: String
    $tag: String
    $isActive: Boolean
  ) {
    clauses(category: $category, search: $search, tag: $tag, isActive: $isActive) {
      id
      title
      content
      description
      category
      tags
      variables
      isActive
      usageCount
      lastUsedAt
      createdAt
    }
  }
`;

export const GET_CLAUSE = gql`
  query GetClause($id: ID!) {
    clause(id: $id) {
      id
      title
      content
      description
      category
      tags
      variables
      isActive
      usageCount
      lastUsedAt
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_CLAUSE = gql`
  mutation CreateClause($input: CreateClauseInput!) {
    createClause(input: $input) {
      id
      title
      content
      category
      isActive
      createdAt
    }
  }
`;

export const UPDATE_CLAUSE = gql`
  mutation UpdateClause($id: ID!, $input: UpdateClauseInput!) {
    updateClause(id: $id, input: $input) {
      id
      title
      content
      description
      category
      tags
      variables
      isActive
      updatedAt
    }
  }
`;

export const DELETE_CLAUSE = gql`
  mutation DeleteClause($id: ID!) {
    deleteClause(id: $id) {
      success
      message
    }
  }
`;

export const INTERPOLATE_CLAUSE = gql`
  mutation InterpolateClause($id: ID!, $variables: JSON!) {
    interpolateClause(id: $id, variables: $variables) {
      clause {
        id
        title
      }
      interpolatedContent
    }
  }
`;

export const PREVIEW_CLAUSE = gql`
  mutation PreviewClause($id: ID!, $variables: JSON!) {
    previewClause(id: $id, variables: $variables) {
      original
      interpolated
      variables
      missingVariables
    }
  }
`;
