
import { useQuery, useMutation, queryClient } from '../../../hooks/useQueryHooks';
import { DataService } from '../../../services/data/dataService';
// ✅ Migrated to backend API (2025-12-21)
import { Category } from './EntitySidebar';

export const useAdminData = (activeCategory: Category) => {
  // Independent Queries
  const usersQuery = useQuery(['users', 'all'], () => DataService.users.getAll());
  const casesQuery = useQuery(['cases', 'all'], () => DataService.cases.getAll());
  const clientsQuery = useQuery(['clients', 'all'], () => DataService.clients.getAll());
  const clausesQuery = useQuery(['clauses', 'all'], () => DataService.clauses.getAll());
  const docsQuery = useQuery(['documents', 'all'], () => DataService.documents.getAll());

  const dataMap: {
      users: any[];
      cases: any[];
      clients: any[];
      clauses: any[];
      documents: any[];
  } = {
      users: usersQuery.data || [],
      cases: casesQuery.data || [],
      clients: clientsQuery.data || [],
      clauses: clausesQuery.data || [],
      documents: docsQuery.data || []
  };

  // Generic Mutation Handler
  const { mutate: saveItem } = useMutation(
    async (payload: { category: Category, item: unknown, isNew: boolean }) => {
        // In a real app, switch on category to call specific DataService methods
        // For this mock admin panel, we just return the item to simulate success
        // Actual persistence logic would go here
        return payload.item;
    },
    {
        onSuccess: (savedItem: any, variables) => {
            const key = [
                variables.category === 'users' ? 'users' :
                variables.category === 'cases' ? 'cases' :
                variables.category === 'clients' ? 'clients' :
                variables.category === 'clauses' ? 'clauses' : 'documents',
                'all'
            ];

            const currentData = queryClient.getQueryState<any[]>(key)?.data || [];
            let newData;
            if (variables.isNew) {
                newData = [savedItem, ...currentData];
            } else {
                newData = currentData.map(i => i.id === savedItem.id ? savedItem : i);
            }
            queryClient.setQueryData(key, newData);
        }
    }
  );

  const { mutate: deleteItem } = useMutation(
      async (payload: { category: Category, id: string }) => {
           return payload.id;
      },
      {
          onSuccess: (id, variables) => {
            const key = [
                variables.category === 'users' ? 'users' : 
                variables.category === 'cases' ? 'cases' : 
                variables.category === 'clients' ? 'clients' :
                variables.category === 'clauses' ? 'clauses' : 'documents',
                'all'
            ];
            const currentData = queryClient.getQueryState<any[]>(key)?.data || [];
            queryClient.setQueryData(key, currentData.filter(i => i.id !== id));
          }
      }
  );

  return {
      items: dataMap[activeCategory] as any[],
      counts: {
        users: dataMap.users.length,
        cases: dataMap.cases.length,
        clients: dataMap.clients.length,
        clauses: dataMap.clauses.length,
        documents: dataMap.documents.length
      },
      saveItem,
      deleteItem
  };
};
