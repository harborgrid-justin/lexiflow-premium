import { useQuery, useMutation, useSubscription } from '@apollo/client';
import {
  GET_DOCUMENTS,
  GET_DOCUMENT,
  CREATE_DOCUMENT,
  UPDATE_DOCUMENT,
  DELETE_DOCUMENT,
  UPLOAD_DOCUMENT,
  PROCESS_DOCUMENT,
  SEARCH_DOCUMENTS,
} from '../queries/document.queries';
import {
  DOCUMENT_CREATED_SUBSCRIPTION,
  DOCUMENT_UPDATED_SUBSCRIPTION,
  DOCUMENT_PROCESSED_SUBSCRIPTION,
} from '../subscriptions';

export const useDocuments = (filter?: any, pagination?: any) => {
  const { data, loading, error, refetch, fetchMore } = useQuery(GET_DOCUMENTS, {
    variables: { filter, pagination },
  });

  return {
    documents: data?.documents?.edges?.map((edge: any) => edge.node) || [],
    pageInfo: data?.documents?.pageInfo,
    totalCount: data?.documents?.totalCount || 0,
    loading,
    error,
    refetch,
    fetchMore,
  };
};

export const useDocument = (id: string) => {
  const { data, loading, error, refetch } = useQuery(GET_DOCUMENT, {
    variables: { id },
    skip: !id,
  });

  return {
    document: data?.document,
    loading,
    error,
    refetch,
  };
};

export const useCreateDocument = () => {
  const [createDocument, { data, loading, error }] = useMutation(CREATE_DOCUMENT, {
    refetchQueries: [{ query: GET_DOCUMENTS }],
  });

  return {
    createDocument: (input: any) => createDocument({ variables: { input } }),
    document: data?.createDocument,
    loading,
    error,
  };
};

export const useUpdateDocument = () => {
  const [updateDocument, { data, loading, error }] = useMutation(UPDATE_DOCUMENT);

  return {
    updateDocument: (id: string, input: any) => updateDocument({ variables: { id, input } }),
    document: data?.updateDocument,
    loading,
    error,
  };
};

export const useDeleteDocument = () => {
  const [deleteDocument, { loading, error }] = useMutation(DELETE_DOCUMENT, {
    refetchQueries: [{ query: GET_DOCUMENTS }],
  });

  return {
    deleteDocument: (id: string) => deleteDocument({ variables: { id } }),
    loading,
    error,
  };
};

export const useUploadDocument = () => {
  const [uploadDocument, { data, loading, error }] = useMutation(UPLOAD_DOCUMENT, {
    refetchQueries: [{ query: GET_DOCUMENTS }],
  });

  return {
    uploadDocument: (input: any) => uploadDocument({ variables: { input } }),
    document: data?.uploadDocument,
    loading,
    error,
  };
};

export const useProcessDocument = () => {
  const [processDocument, { data, loading, error }] = useMutation(PROCESS_DOCUMENT);

  return {
    processDocument: (id: string) => processDocument({ variables: { id } }),
    document: data?.processDocument,
    loading,
    error,
  };
};

export const useSearchDocuments = (query: string, filters?: any) => {
  const { data, loading, error, refetch } = useQuery(SEARCH_DOCUMENTS, {
    variables: { query, filters },
    skip: !query,
  });

  return {
    documents: data?.searchDocuments || [],
    loading,
    error,
    refetch,
  };
};

// Subscription hooks
export const useDocumentCreatedSubscription = (caseId?: string, onData?: (data: any) => void) => {
  const { data, loading, error } = useSubscription(DOCUMENT_CREATED_SUBSCRIPTION, {
    variables: { caseId },
    onData: ({ data }) => {
      if (onData && data?.data?.documentCreated) {
        onData(data.data.documentCreated);
      }
    },
  });

  return {
    document: data?.documentCreated,
    loading,
    error,
  };
};

export const useDocumentUpdatedSubscription = (
  documentId?: string,
  caseId?: string,
  onData?: (data: any) => void,
) => {
  const { data, loading, error } = useSubscription(DOCUMENT_UPDATED_SUBSCRIPTION, {
    variables: { documentId, caseId },
    onData: ({ data }) => {
      if (onData && data?.data?.documentUpdated) {
        onData(data.data.documentUpdated);
      }
    },
  });

  return {
    document: data?.documentUpdated,
    loading,
    error,
  };
};

export const useDocumentProcessedSubscription = (documentId?: string, onData?: (data: any) => void) => {
  const { data, loading, error } = useSubscription(DOCUMENT_PROCESSED_SUBSCRIPTION, {
    variables: { documentId },
    skip: !documentId,
    onData: ({ data }) => {
      if (onData && data?.data?.documentProcessed) {
        onData(data.data.documentProcessed);
      }
    },
  });

  return {
    document: data?.documentProcessed,
    loading,
    error,
  };
};
