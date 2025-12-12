import { useQuery, useMutation, useSubscription } from '@apollo/client';
import {
  GET_CASES,
  GET_CASE,
  CREATE_CASE,
  UPDATE_CASE,
  DELETE_CASE,
  ADD_PARTY,
  ADD_TEAM_MEMBER,
  CREATE_MOTION,
  CREATE_DOCKET_ENTRY,
  GET_CASE_METRICS,
} from '../queries/case.queries';
import {
  CASE_CREATED_SUBSCRIPTION,
  CASE_UPDATED_SUBSCRIPTION,
  CASE_DELETED_SUBSCRIPTION,
} from '../subscriptions';

export const useCases = (filter?: any, pagination?: any) => {
  const { data, loading, error, refetch, fetchMore } = useQuery(GET_CASES, {
    variables: { filter, pagination },
  });

  return {
    cases: data?.cases?.edges?.map((edge: any) => edge.node) || [],
    pageInfo: data?.cases?.pageInfo,
    totalCount: data?.cases?.totalCount || 0,
    loading,
    error,
    refetch,
    fetchMore,
  };
};

export const useCase = (id: string) => {
  const { data, loading, error, refetch } = useQuery(GET_CASE, {
    variables: { id },
    skip: !id,
  });

  return {
    case: data?.case,
    loading,
    error,
    refetch,
  };
};

export const useCreateCase = () => {
  const [createCase, { data, loading, error }] = useMutation(CREATE_CASE, {
    refetchQueries: [{ query: GET_CASES }],
  });

  return {
    createCase: (input: any) => createCase({ variables: { input } }),
    case: data?.createCase,
    loading,
    error,
  };
};

export const useUpdateCase = () => {
  const [updateCase, { data, loading, error }] = useMutation(UPDATE_CASE);

  return {
    updateCase: (id: string, input: any) => updateCase({ variables: { id, input } }),
    case: data?.updateCase,
    loading,
    error,
  };
};

export const useDeleteCase = () => {
  const [deleteCase, { loading, error }] = useMutation(DELETE_CASE, {
    refetchQueries: [{ query: GET_CASES }],
  });

  return {
    deleteCase: (id: string) => deleteCase({ variables: { id } }),
    loading,
    error,
  };
};

export const useAddParty = () => {
  const [addParty, { data, loading, error }] = useMutation(ADD_PARTY);

  return {
    addParty: (input: any) => addParty({ variables: { input } }),
    case: data?.addParty,
    loading,
    error,
  };
};

export const useAddTeamMember = () => {
  const [addTeamMember, { data, loading, error }] = useMutation(ADD_TEAM_MEMBER);

  return {
    addTeamMember: (input: any) => addTeamMember({ variables: { input } }),
    case: data?.addTeamMember,
    loading,
    error,
  };
};

export const useCreateMotion = () => {
  const [createMotion, { data, loading, error }] = useMutation(CREATE_MOTION);

  return {
    createMotion: (input: any) => createMotion({ variables: { input } }),
    case: data?.createMotion,
    loading,
    error,
  };
};

export const useCreateDocketEntry = () => {
  const [createDocketEntry, { data, loading, error }] = useMutation(CREATE_DOCKET_ENTRY);

  return {
    createDocketEntry: (input: any) => createDocketEntry({ variables: { input } }),
    case: data?.createDocketEntry,
    loading,
    error,
  };
};

export const useCaseMetrics = () => {
  const { data, loading, error, refetch } = useQuery(GET_CASE_METRICS);

  return {
    metrics: data?.caseMetrics,
    loading,
    error,
    refetch,
  };
};

// Subscription hooks
export const useCaseCreatedSubscription = (onData?: (data: any) => void) => {
  const { data, loading, error } = useSubscription(CASE_CREATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (onData && data?.data?.caseCreated) {
        onData(data.data.caseCreated);
      }
    },
  });

  return {
    case: data?.caseCreated,
    loading,
    error,
  };
};

export const useCaseUpdatedSubscription = (caseId?: string, onData?: (data: any) => void) => {
  const { data, loading, error } = useSubscription(CASE_UPDATED_SUBSCRIPTION, {
    variables: { caseId },
    skip: !caseId,
    onData: ({ data }) => {
      if (onData && data?.data?.caseUpdated) {
        onData(data.data.caseUpdated);
      }
    },
  });

  return {
    case: data?.caseUpdated,
    loading,
    error,
  };
};

export const useCaseDeletedSubscription = (onData?: (caseId: string) => void) => {
  const { data, loading, error } = useSubscription(CASE_DELETED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (onData && data?.data?.caseDeleted) {
        onData(data.data.caseDeleted);
      }
    },
  });

  return {
    deletedCaseId: data?.caseDeleted,
    loading,
    error,
  };
};
