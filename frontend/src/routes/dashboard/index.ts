// routes/dashboard/index.ts
// ============================================================================
// Dashboard Route Context Exports
// ============================================================================
// Domain-specific context for dashboard data and widgets

export {
  DataProvider,
  useData,
  useDataActions,
  useDataState,
} from "./data/DataContext";
export type { DashboardItem, DataContextValue } from "./data/DataContext";

export {
  DataSourceProvider,
  useDataSource,
  useDataSourceActions,
  useDataSourceState,
} from "./data/DataSourceContext";
export type { DataSourceType } from "./data/DataSourceContext.types";
