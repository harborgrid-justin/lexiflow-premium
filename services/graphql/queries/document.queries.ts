import { gql } from '@apollo/client';

export const DOCUMENT_FRAGMENT = gql`
  fragment DocumentFields on DocumentType {
    id
    title
    documentType
    status
    accessLevel
    description
    fileName
    fileSize
    mimeType
    storageKey
    s3Url
    ocrProcessed
    tags
    createdAt
    updatedAt
    createdBy {
      id
      fullName
      email
    }
  }
`;

export const GET_DOCUMENTS = gql`
  ${DOCUMENT_FRAGMENT}
  query GetDocuments($filter: DocumentFilterInput, $pagination: PaginationInput) {
    documents(filter: $filter, pagination: $pagination) {
      edges {
        node {
          ...DocumentFields
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

export const GET_DOCUMENT = gql`
  ${DOCUMENT_FRAGMENT}
  query GetDocument($id: ID!) {
    document(id: $id) {
      ...DocumentFields
      extractedText
      versions {
        id
        versionNumber
        fileName
        fileSize
        mimeType
        storageKey
        changeDescription
        createdBy {
          id
          fullName
        }
        createdAt
      }
      clauses {
        id
        title
        content
        category
        createdAt
      }
    }
  }
`;

export const CREATE_DOCUMENT = gql`
  ${DOCUMENT_FRAGMENT}
  mutation CreateDocument($input: CreateDocumentInput!) {
    createDocument(input: $input) {
      ...DocumentFields
    }
  }
`;

export const UPDATE_DOCUMENT = gql`
  ${DOCUMENT_FRAGMENT}
  mutation UpdateDocument($id: ID!, $input: UpdateDocumentInput!) {
    updateDocument(id: $id, input: $input) {
      ...DocumentFields
    }
  }
`;

export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id)
  }
`;

export const UPLOAD_DOCUMENT = gql`
  ${DOCUMENT_FRAGMENT}
  mutation UploadDocument($input: UploadDocumentInput!) {
    uploadDocument(input: $input) {
      ...DocumentFields
    }
  }
`;

export const PROCESS_DOCUMENT = gql`
  ${DOCUMENT_FRAGMENT}
  mutation ProcessDocument($id: ID!) {
    processDocument(id: $id) {
      ...DocumentFields
    }
  }
`;

export const SEARCH_DOCUMENTS = gql`
  ${DOCUMENT_FRAGMENT}
  query SearchDocuments($query: String!, $filters: DocumentFilterInput) {
    searchDocuments(query: $query, filters: $filters) {
      ...DocumentFields
    }
  }
`;
