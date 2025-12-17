# Backend to Frontend API Service Mapping

## ✅ Fully Covered Backend Endpoints

1. **api/v1/auth** → AuthApiService
2. **api/v1/cases** → CasesApiService  
3. **api/v1/users** → UsersApiService
4. **api/v1/documents** → DocumentsApiService
5. **api/v1/billing** → BillingApiService
6. **api/v1/billing/rates** → RateTablesApiService
7. **api/v1/billing/fee-agreements** → FeeAgreementsApiService
8. **api/v1/billing/expenses** → ExpensesApiService
9. **api/v1/billing/time-entries** → TimeEntriesApiService
10. **api/v1/billing/invoices** → InvoicesApiService
11. **api/v1/billing/trust-accounts** → TrustAccountsApiService
12. **api/v1/billing** (analytics) → BillingAnalyticsApiService
13. **api/v1/tasks** → TasksApiService
14. **api/v1/risks** → RisksApiService
15. **api/v1/hr** → HRApiService
16. **api/v1/workflow/templates** → WorkflowTemplatesApiService
17. **api/v1/trial** → TrialApiService
18. **api/v1/exhibits** → ExhibitsApiService
19. **api/v1/clients** → ClientsApiService
20. **api/v1/citations** → CitationsApiService
21. **api/v1/calendar** → CalendarApiService
22. **api/v1/messenger** → MessengerApiService
23. **api/v1/war-room** → WarRoomApiService
24. **api/v1/analytics/dashboard** → AnalyticsDashboardApiService
25. **api/v1/knowledge** → KnowledgeBaseApiService
26. **api/v1/reports** → ReportsApiService
27. **api/v1/processing-jobs** → ProcessingJobsApiService
28. **api/v1/dashboard** → DashboardApiService
29. **api/v1** (case-phases) → CasePhasesApiService
30. **api/v1** (case-teams) → CaseTeamsApiService
31. **api/v1** (motions) → MotionsApiService
32. **api/v1** (parties) → PartiesApiService
33. **api/v1/pleadings** → PleadingsApiService
34. **api/v1/clauses** → ClausesApiService
35. **api/v1/discovery/legal-holds** → LegalHoldsApiService
36. **api/v1/discovery/depositions** → DepositionsApiService
37. **api/v1/discovery/requests** → DiscoveryRequestsApiService
38. **api/v1/discovery/esi-sources** → ESISourcesApiService
39. **api/v1/discovery/privilege-log** → PrivilegeLogApiService
40. **api/v1/discovery/productions** → ProductionsApiService
41. **api/v1/discovery/interviews** → CustodianInterviewsApiService
42. **api/v1/discovery/custodians** → CustodiansApiService
43. **api/v1/discovery/examinations** → ExaminationsApiService
44. **api/v1/discovery/evidence** → EvidenceApiService
45. **api/v1/compliance/conflicts** → ConflictChecksApiService
46. **api/v1/compliance/ethical-walls** → EthicalWallsApiService
47. **api/v1/audit-logs** → AuditLogsApiService
48. **api/v1/security/permissions** → PermissionsApiService
49. **api/v1/security/rls-policies** → RLSPoliciesApiService
50. **api/v1/compliance/reports** → ComplianceReportsApiService
51. **api/v1/projects** → ProjectsApiService
52. **api/v1** (communications/correspondence) → CommunicationsApiService
53. **api/v1/webhooks** → WebhooksApiService
54. **api/v1/notifications** → NotificationsApiService
55. **api/v1/admin/api-keys** → ApiKeysApiService
56. **api/v1** (docket) → DocketApiService

## ❌ Missing Frontend API Services

1. **api/v1/discovery** (main controller) - DiscoveryApiService
2. **api/v1/search** - SearchApiService
3. **api/v1/ocr** - OCRApiService
4. **api/v1/service-jobs** - ServiceJobsApiService
5. **api/v1** (messaging) - MessagingApiService
6. **api/v1/compliance** (main controller) - ComplianceApiService
7. **api/v1/admin/blacklist** - TokenBlacklistAdminApiService
8. **api/v1/analytics/billing** - (covered by BillingAnalyticsApiService)
9. **api/v1/analytics** (case-analytics, discovery-analytics) - AnalyticsApiService
10. **api/v1/analytics/judge-stats** - JudgeStatsApiService
11. **api/v1/analytics/outcome-predictions** - OutcomePredictionsApiService
12. **api/v1/documents/:documentId/versions** - DocumentVersionsApiService
13. **health** - HealthApiService (already in apiClient)
14. **metrics** - MetricsApiService
15. **production** - ProductionApiService (different from productions)
16. **communications** (main controller) - (partially covered)
17. **integrations/data-sources** - DataSourcesApiService

## Summary

- **Total Backend Endpoints**: ~75
- **Covered**: ~56
- **Missing**: ~19
- **Coverage**: ~75%

## Action Required

Create missing API services to achieve 100% coverage.
