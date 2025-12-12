/**
 * GraphQL Client - Apollo Client setup
 * Provides GraphQL query/mutation capabilities with caching and real-time subscriptions
 */

// Note: This is a TypeScript implementation without Apollo Client dependency
// For production, install: @apollo/client graphql
// For now, we'll create a lightweight GraphQL client using fetch

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

interface GraphQLRequestOptions {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

class GraphQLClient {
  private endpoint: string;
  private headers: Record<string, string>;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.cache = new Map();
  }

  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.headers['Authorization'];
  }

  setHeader(key: string, value: string) {
    this.headers[key] = value;
  }

  private getCacheKey(query: string, variables?: Record<string, any>): string {
    return `${query}-${JSON.stringify(variables || {})}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache() {
    this.cache.clear();
  }

  async request<T = any>(
    options: GraphQLRequestOptions,
    useCache: boolean = false
  ): Promise<T> {
    const { query, variables, operationName } = options;

    // Check cache for queries
    if (useCache && query.trim().startsWith('query')) {
      const cacheKey = this.getCacheKey(query, variables);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.debug('[GraphQL] Cache hit:', operationName || 'query');
        return cached;
      }
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query,
          variables,
          operationName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        const errorMessage = result.errors.map(e => e.message).join(', ');
        throw new Error(`GraphQL Error: ${errorMessage}`);
      }

      if (!result.data) {
        throw new Error('No data received from GraphQL server');
      }

      // Cache successful query results
      if (useCache && query.trim().startsWith('query')) {
        const cacheKey = this.getCacheKey(query, variables);
        this.setCache(cacheKey, result.data);
      }

      return result.data;
    } catch (error) {
      console.error('[GraphQL] Request failed:', error);
      throw error;
    }
  }

  // Helper for queries
  async query<T = any>(
    query: string,
    variables?: Record<string, any>,
    useCache: boolean = true
  ): Promise<T> {
    return this.request<T>({ query, variables }, useCache);
  }

  // Helper for mutations
  async mutate<T = any>(
    mutation: string,
    variables?: Record<string, any>
  ): Promise<T> {
    return this.request<T>({ query: mutation, variables }, false);
  }
}

// GraphQL endpoint configuration
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql';

// Create and export client instance
export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT);

// Common GraphQL queries and mutations
export const queries = {
  // User queries
  GET_CURRENT_USER: `
    query GetCurrentUser {
      currentUser {
        id
        email
        name
        role
        avatar
        preferences
      }
    }
  `,

  GET_USERS: `
    query GetUsers($page: Int, $limit: Int, $search: String) {
      users(page: $page, limit: $limit, search: $search) {
        items {
          id
          email
          name
          role
          status
          createdAt
        }
        total
        page
        limit
      }
    }
  `,

  // Case queries
  GET_CASES: `
    query GetCases($page: Int, $limit: Int, $status: String) {
      cases(page: $page, limit: $limit, status: $status) {
        items {
          id
          title
          caseNumber
          status
          priority
          client {
            id
            name
          }
          assignedTo {
            id
            name
          }
          createdAt
          updatedAt
        }
        total
      }
    }
  `,

  GET_CASE_BY_ID: `
    query GetCaseById($id: ID!) {
      case(id: $id) {
        id
        title
        caseNumber
        description
        status
        priority
        client {
          id
          name
          email
        }
        assignedTo {
          id
          name
          email
        }
        documents {
          id
          title
          type
          uploadedAt
        }
        timeline {
          id
          event
          description
          createdAt
        }
        createdAt
        updatedAt
      }
    }
  `,

  // Document queries
  GET_DOCUMENTS: `
    query GetDocuments($caseId: ID, $page: Int, $limit: Int) {
      documents(caseId: $caseId, page: $page, limit: $limit) {
        items {
          id
          title
          type
          size
          status
          uploadedBy {
            id
            name
          }
          uploadedAt
        }
        total
      }
    }
  `,

  // Analytics queries
  GET_DASHBOARD_STATS: `
    query GetDashboardStats {
      dashboardStats {
        totalCases
        activeCases
        totalClients
        totalDocuments
        recentActivity {
          id
          type
          description
          createdAt
        }
      }
    }
  `,
};

export const mutations = {
  // Case mutations
  CREATE_CASE: `
    mutation CreateCase($input: CreateCaseInput!) {
      createCase(input: $input) {
        id
        title
        caseNumber
        status
      }
    }
  `,

  UPDATE_CASE: `
    mutation UpdateCase($id: ID!, $input: UpdateCaseInput!) {
      updateCase(id: $id, input: $input) {
        id
        title
        status
        updatedAt
      }
    }
  `,

  DELETE_CASE: `
    mutation DeleteCase($id: ID!) {
      deleteCase(id: $id) {
        success
        message
      }
    }
  `,

  // Document mutations
  CREATE_DOCUMENT: `
    mutation CreateDocument($input: CreateDocumentInput!) {
      createDocument(input: $input) {
        id
        title
        type
        status
      }
    }
  `,

  // User mutations
  UPDATE_USER_PROFILE: `
    mutation UpdateUserProfile($input: UpdateUserInput!) {
      updateUserProfile(input: $input) {
        id
        name
        email
        avatar
      }
    }
  `,
};

// GraphQL subscription support (placeholder - requires WebSocket)
export const subscriptions = {
  CASE_UPDATED: `
    subscription OnCaseUpdated($caseId: ID!) {
      caseUpdated(caseId: $caseId) {
        id
        status
        updatedAt
      }
    }
  `,

  NOTIFICATION_RECEIVED: `
    subscription OnNotificationReceived {
      notificationReceived {
        id
        type
        message
        createdAt
      }
    }
  `,
};

export default graphqlClient;
