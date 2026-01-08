import { queryClient, useMutation, useQuery } from "@/hooks/backend";
import { DataService } from "@/services/data/dataService";
// ✅ Migrated to backend API (2025-12-21)
import { Category } from "./EntitySidebar";

export const useAdminData = (activeCategory: Category) => {
  // Independent Queries
  const usersQuery = useQuery(["users", "all"], () =>
    DataService.users.getAll()
  );
  const casesQuery = useQuery(["cases", "all"], () =>
    DataService.cases.getAll()
  );
  const clientsQuery = useQuery(["clients", "all"], () =>
    DataService.clients.getAll()
  );
  const clausesQuery = useQuery(["clauses", "all"], () =>
    DataService.clauses.getAll()
  );
  const docsQuery = useQuery(["documents", "all"], () =>
    DataService.documents.getAll()
  );

  const dataMap: Record<Category, unknown[]> = {
    users: (usersQuery.data as unknown[]) || [],
    cases: (casesQuery.data as unknown[]) || [],
    clients: (clientsQuery.data as unknown[]) || [],
    clauses: (clausesQuery.data as unknown[]) || [],
    documents: (docsQuery.data as unknown[]) || [],
  };

  // Generic Mutation Handler with real backend API calls
  const { mutate: saveItem } = useMutation(
    async (payload: { category: Category; item: unknown; isNew: boolean }) => {
      const { category, item, isNew } = payload;
      const typedItem = item as any;

      switch (category) {
        case "users":
          return isNew
            ? await DataService.users.create(typedItem)
            : await DataService.users.update(typedItem.id, typedItem);

        case "cases":
          return isNew
            ? await DataService.cases.add(typedItem)
            : await DataService.cases.update(typedItem.id, typedItem);

        case "clients":
          return isNew
            ? await DataService.clients.create(typedItem)
            : await DataService.clients.update(typedItem.id, typedItem);

        case "clauses":
          return isNew
            ? await DataService.clauses.create(typedItem)
            : await DataService.clauses.update(typedItem.id, typedItem);

        case "documents":
          return isNew
            ? await DataService.documents.create(typedItem)
            : await DataService.documents.update(typedItem.id, typedItem);

        default:
          throw new Error(`Unknown category: ${category}`);
      }
    },
    {
      onSuccess: (savedItem: unknown, variables) => {
        const key = [
          variables.category === "users"
            ? "users"
            : variables.category === "cases"
              ? "cases"
              : variables.category === "clients"
                ? "clients"
                : variables.category === "clauses"
                  ? "clauses"
                  : "documents",
          "all",
        ];

        const currentData =
          queryClient.getQueryState<unknown[]>(key)?.data || [];
        let newData;
        if (variables.isNew) {
          newData = [savedItem, ...currentData];
        } else {
          newData = currentData.map((i: unknown) =>
            (i as any).id === (savedItem as any).id ? savedItem : i
          );
        }
        queryClient.setQueryData(key, newData);
      },
    }
  );

  const { mutate: deleteItem } = useMutation(
    async (payload: { category: Category; id: string }) => {
      const { category, id } = payload;

      switch (category) {
        case "users":
          await DataService.users.delete(id);
          break;
        case "cases":
          await DataService.cases.delete(id);
          break;
        case "clients":
          await DataService.clients.delete(id);
          break;
        case "clauses":
          await DataService.clauses.delete(id);
          break;
        case "documents":
          await DataService.documents.delete(id);
          break;
        default:
          throw new Error(`Unknown category: ${category}`);
      }

      return id;
    },
    {
      onSuccess: (id, variables) => {
        const key = [
          variables.category === "users"
            ? "users"
            : variables.category === "cases"
              ? "cases"
              : variables.category === "clients"
                ? "clients"
                : variables.category === "clauses"
                  ? "clauses"
                  : "documents",
          "all",
        ];
        const currentData =
          queryClient.getQueryState<unknown[]>(key)?.data || [];
        queryClient.setQueryData(
          key,
          currentData.filter((i: unknown) => (i as any).id !== id)
        );
      },
    }
  );

  return {
    items: dataMap[activeCategory],
    counts: {
      users: dataMap.users.length,
      cases: dataMap.cases.length,
      clients: dataMap.clients.length,
      clauses: dataMap.clauses.length,
      documents: dataMap.documents.length,
    },
    saveItem,
    deleteItem,
  };
};
