/**
 * API Gateways
 *
 * Domain-specific wrappers for backend API operations.
 * Features consume gateways, not raw API clients.
 *
 * @module services/data/api/gateways
 */

export { userGateway } from "./userGateway";
export type { UpdateUserDto, UserIdentity } from "./userGateway";

export { billingGateway } from "./billingGateway";
export type {
  BillingMetrics,
  Invoice,
  InvoiceItem,
  Payment,
} from "./billingGateway";

export { reportingGateway } from "./reportingGateway";
export type {
  AnalyticsSummary,
  Report,
  ReportParameter,
  ReportTemplate,
  TimeSeriesData,
} from "./reportingGateway";

export { adminGateway } from "./adminGateway";
export type {
  AuditLog,
  BillingSettings,
  EmailSettings,
  GeneralSettings,
  SecuritySettings,
  SystemHealth,
  SystemSettings,
} from "./adminGateway";
