import { queryClient, useMutation, useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";
import { queryKeys } from "@/utils/query-keys.service";

// ✅ Migrated to backend API (2025-12-21)
import { type Category } from "./EntitySidebar";

export const useAdminData = (activeCategory: Category) => {
  // Independent Queries
  const usersQuery = useQuery(queryKeys.users.all(), () =>
    DataService.users.getAll(),
  );
  const casesQuery = useQuery(queryKeys.cases.all(), () =>
    DataService.cases.getAll(),
  );
  const clientsQuery = useQuery(queryKeys.clients.all(), () =>
    DataService.clients.getAll(),
  );
  const clausesQuery = useQuery(queryKeys.clauses.all(), () =>
    DataService.clauses.getAll(),
  );
  const docsQuery = useQuery(queryKeys.documents.all(), () =>
    DataService.documents.getAll(),
  );

  const dataMap: Record<Category, unknown[]> = {
    users: (usersQuery.data as unknown[]) || [],
    cases: (casesQuery.data as unknown[]) || [],
    clients: (clientsQuery.data as unknown[]) || [],
    clauses: (clausesQuery.data as unknown[]) || [],
    documents: (docsQuery.data as unknown[]) || [],
  };

  // Generic Mutation Handler
  const { mutate: saveItem } = useMutation(
    async (payload: { category: Category; item: unknown; isNew: boolean }) => {
      // Route to appropriate DataService method based on category
      switch (payload.category) {
        case "users":
          return payload.isNew
            ? await DataService.users.add(payload.item)
            : await DataService.users.update(
                (payload.item as { id: string }).id,
                payload.item,
              );
        case "cases":
          return payload.isNew
            ? await DataService.cases.add(payload.item)
            : await DataService.cases.update(
                (payload.item as { id: string }).id,
                payload.item,
              );
        case "clients":
          return payload.isNew
            ? await DataService.communications.addContact(payload.item)
            : await DataService.communications.updateContact(
                (payload.item as Record<string, unknown>).id as string,
                payload.item,
              );
        case "clauses":
          return payload.isNew
            ? await (
                DataService.clauses as {
                  add: (item: unknown) => Promise<unknown>;
                }
              ).add(payload.item)
            : await (
                DataService.clauses as {
                  update: (id: string, item: unknown) => Promise<unknown>;
                }
              ).update(
                (payload.item as Record<string, unknown>).id as string,
                payload.item,
              );
        case "documents":
          return payload.isNew
            ? await DataService.documents.add(payload.item)
            : await DataService.documents.update(
                (payload.item as Record<string, unknown>).id as string,
                payload.item,
              );
        default:
          return payload.item;
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
            (i as { id: string }).id === (savedItem as { id: string }).id
              ? savedItem
              : i,
          );
        }
        queryClient.setQueryData(key, newData);
      },
    },
  );

  const { mutate: deleteItem } = useMutation(
    async (payload: { category: Category; id: string }) => {
      return payload.id;
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
          currentData.filter((i: unknown) => (i as { id: string }).id !== id),
        );
      },
    },
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
