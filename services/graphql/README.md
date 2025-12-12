# GraphQL Service Layer

Complete GraphQL integration for LexiFlow Premium with queries, mutations, subscriptions, and React hooks.

## Setup

1. Install dependencies:
```bash
npm install @apollo/client graphql graphql-ws
```

2. Configure environment variables in `.env`:
```
VITE_GRAPHQL_HTTP_URL=http://localhost:3001/graphql
VITE_GRAPHQL_WS_URL=ws://localhost:3001/graphql
```

3. Wrap your app with ApolloProvider:
```tsx
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './services/graphql';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      {/* Your app components */}
    </ApolloProvider>
  );
}
```

## Usage

### Using Hooks

```tsx
import { useCases, useCase, useCreateCase, useCaseUpdatedSubscription } from './services/graphql';

function CasesList() {
  const { cases, loading, error } = useCases();
  const { createCase } = useCreateCase();

  // Subscribe to case updates
  useCaseUpdatedSubscription(undefined, (updatedCase) => {
    console.log('Case updated:', updatedCase);
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {cases.map(case => (
        <div key={case.id}>{case.title}</div>
      ))}
    </div>
  );
}
```

### Using Queries Directly

```tsx
import { useQuery } from '@apollo/client';
import { GET_CASES } from './services/graphql';

function CasesList() {
  const { data, loading, error } = useQuery(GET_CASES, {
    variables: {
      filter: { status: 'ACTIVE' },
      pagination: { first: 10 }
    }
  });

  // ...
}
```

### Using Mutations

```tsx
import { useMutation } from '@apollo/client';
import { CREATE_CASE } from './services/graphql';

function CreateCaseForm() {
  const [createCase, { loading, error }] = useMutation(CREATE_CASE);

  const handleSubmit = async (formData) => {
    try {
      const { data } = await createCase({
        variables: {
          input: formData
        }
      });
      console.log('Case created:', data.createCase);
    } catch (err) {
      console.error('Error creating case:', err);
    }
  };

  // ...
}
```

### Using Subscriptions

```tsx
import { useSubscription } from '@apollo/client';
import { CASE_UPDATED_SUBSCRIPTION } from './services/graphql';

function CaseDetail({ caseId }) {
  const { data, loading } = useSubscription(CASE_UPDATED_SUBSCRIPTION, {
    variables: { caseId }
  });

  useEffect(() => {
    if (data?.caseUpdated) {
      console.log('Case updated:', data.caseUpdated);
      // Update UI accordingly
    }
  }, [data]);

  // ...
}
```

## Available Hooks

### Cases
- `useCases(filter?, pagination?)` - Get list of cases
- `useCase(id)` - Get single case
- `useCreateCase()` - Create new case
- `useUpdateCase()` - Update existing case
- `useDeleteCase()` - Delete case
- `useAddParty()` - Add party to case
- `useAddTeamMember()` - Add team member to case
- `useCreateMotion()` - Create motion
- `useCreateDocketEntry()` - Create docket entry
- `useCaseMetrics()` - Get case metrics
- `useCaseCreatedSubscription()` - Subscribe to case creations
- `useCaseUpdatedSubscription(caseId?)` - Subscribe to case updates
- `useCaseDeletedSubscription()` - Subscribe to case deletions

### Documents
- `useDocuments(filter?, pagination?)` - Get list of documents
- `useDocument(id)` - Get single document
- `useCreateDocument()` - Create new document
- `useUpdateDocument()` - Update existing document
- `useDeleteDocument()` - Delete document
- `useUploadDocument()` - Upload document file
- `useProcessDocument()` - Process document (OCR)
- `useSearchDocuments(query, filters?)` - Search documents
- `useDocumentCreatedSubscription(caseId?)` - Subscribe to document creations
- `useDocumentUpdatedSubscription(documentId?, caseId?)` - Subscribe to document updates
- `useDocumentProcessedSubscription(documentId?)` - Subscribe to document processing

## Features

- ✅ Automatic authentication token management
- ✅ Error handling and retry logic
- ✅ WebSocket subscriptions for real-time updates
- ✅ Query complexity limiting
- ✅ Response caching with Apollo Cache
- ✅ Optimistic UI updates
- ✅ Pagination support
- ✅ TypeScript-ready
- ✅ React hooks for easy integration

## GraphQL Schema

The GraphQL schema includes:
- Case management (CRUD + relationships)
- Document management (upload, processing, OCR)
- User management and authentication
- Billing and invoicing
- Time tracking
- Analytics and reporting
- Discovery management
- Real-time subscriptions for all major events

## Error Handling

The client automatically handles:
- Authentication errors (redirects to login)
- Rate limiting
- Query complexity violations
- Network errors
- GraphQL errors

## Subscriptions

Real-time updates via WebSocket for:
- Case changes (create, update, delete)
- Document changes (create, update, process)
- Time entries
- Invoices
- Notifications
- Chat messages
- Task assignments
- Deadline reminders
