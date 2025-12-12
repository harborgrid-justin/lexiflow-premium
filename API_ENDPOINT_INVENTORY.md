# LexiFlow AI Legal Suite - API Endpoint Inventory

**Generated:** December 12, 2025  
**Agent:** PhD Software Engineer Agent 10 - GraphQL & REST API Integration Specialist

---

## Overview

LexiFlow AI Legal Suite provides comprehensive API access through:
- **GraphQL API** (`/graphql`) - Primary API with real-time subscriptions
- **REST API V2** (`/api/v2/*`) - Modern REST API with enhanced features
- **REST API V1** (`/api/v1/*`) - Legacy REST API (deprecated, sunset: June 1, 2025)

---

## GraphQL API (`/graphql`)

### Queries

#### Cases
- `case(id: ID!)` - Get single case by ID
- `caseByNumber(caseNumber: String!)` - Get case by case number
- `cases(filter, sort, pagination)` - Get paginated list of cases
- `myCases(status, pagination)` - Get current user's cases
- `searchCases(query, filters)` - Full-text search for cases
- `caseStatistics(dateRange)` - Get case statistics
- `casesByStatus()` - Get case counts by status
- `casesByPriority()` - Get case counts by priority

#### Documents
- `document(id: ID!)` - Get single document by ID
- `documents(filter, sort, pagination)` - Get paginated list of documents
- `searchDocuments(query, filters)` - Full-text search for documents
- `fullTextSearch(query, caseId, documentTypes)` - Advanced document search
- `folder(id: ID!)` - Get folder details
- `folders(caseId)` - Get folders for case
- `documentVersions(documentId)` - Get document version history
- `documentAnalysis(documentId)` - Get AI analysis of document
- `compareDocuments(id1, id2)` - Compare two documents
- `tags(category)` - Get document tags
- `popularTags(limit)` - Get popular tags
- `documentStatistics(caseId, dateRange)` - Get document statistics

#### Users
- `me()` - Get current user profile
- `myProfile()` - Get current user's detailed profile
- `user(id: ID!)` - Get user by ID
- `userByEmail(email: String!)` - Get user by email
- `users(filter, sort, pagination)` - Get paginated list of users
- `searchUsers(query, filters)` - Search for users
- `myPermissions()` - Get current user's permissions
- `checkPermission(resource, action)` - Check specific permission
- `myNotifications(filter, pagination)` - Get current user's notifications
- `myActivity(pagination)` - Get current user's activity log
- `mySessions()` - Get current user's active sessions
- `organization(id: ID!)` - Get organization details
- `myOrganization()` - Get current user's organization
- `team(id: ID!)` - Get team details
- `teams(organizationId)` - Get teams
- `myTeams()` - Get current user's teams
- `userAnalytics(userId, dateRange)` - Get user analytics

#### Analytics
- `dashboardAnalytics(dateRange)` - Get comprehensive dashboard analytics
- `timeSeriesAnalytics(metric, dateRange, aggregation, interval)` - Time series data
- `comparativeAnalytics(metric, currentPeriod, previousPeriod)` - Period comparison
- `cohortAnalysis(cohortType, dateRange, metrics)` - Cohort analysis
- `funnelAnalytics(funnelName, dateRange)` - Funnel metrics
- `heatmapData(metric, xAxis, yAxis, dateRange)` - Heatmap visualization data
- `distributionAnalytics(metric, dateRange, bucketCount)` - Distribution analysis
- `predictiveAnalytics(model, horizon, features)` - AI predictions
- `customReport(id: ID!)` - Get custom report
- `customReports(category, isFavorite)` - Get custom reports
- `exportAnalytics(reportType, dateRange, format)` - Export analytics
- `revenueProjection(months, includeHistorical)` - Revenue forecasting

#### Compliance
- `compliancePolicy(id: ID!)` - Get compliance policy
- `compliancePolicies(filter, pagination)` - Get compliance policies
- `complianceAudit(id: ID!)` - Get compliance audit
- `complianceAudits(filter, pagination)` - Get compliance audits
- `riskAssessment(id: ID!)` - Get risk assessment
- `riskAssessments(filter, pagination)` - Get risk assessments
- `complianceIncident(id: ID!)` - Get compliance incident
- `complianceIncidents(filter, pagination)` - Get compliance incidents
- `complianceTraining(id: ID!)` - Get compliance training
- `complianceTrainings(category, status)` - Get compliance trainings
- `myTrainings(status)` - Get current user's trainings
- `complianceDashboard(dateRange)` - Get compliance dashboard
- `complianceScore()` - Get compliance score
- `complianceReport(type, dateRange)` - Generate compliance report

### Mutations

#### Cases
- `createCase(input)` - Create new case
- `updateCase(id, input)` - Update case
- `deleteCase(id)` - Delete case
- `archiveCase(id)` - Archive case
- `changeCaseStatus(id, status)` - Change case status
- `assignCase(id, userId, role)` - Assign user to case
- `unassignCase(id, userId)` - Unassign user from case
- `addPhase(caseId, input)` - Add case phase
- `updatePhase(id, input)` - Update case phase
- `deletePhase(id)` - Delete case phase
- `addEvent(caseId, input)` - Add case event
- `updateEvent(id, input)` - Update case event
- `deleteEvent(id)` - Delete case event
- `addTask(caseId, input)` - Add case task
- `updateTask(id, input)` - Update case task
- `completeTask(id)` - Complete task
- `deleteTask(id)` - Delete task

#### Documents
- `uploadDocument(input)` - Upload document
- `createDocument(input)` - Create document
- `updateDocument(id, input)` - Update document
- `updateDocumentMetadata(id, metadata)` - Update document metadata
- `createDocumentVersion(documentId, file, changeDescription)` - Create new version
- `restoreDocumentVersion(versionId)` - Restore previous version
- `moveDocument(id, folderId)` - Move document to folder
- `addDocumentTags(id, tags)` - Add tags to document
- `removeDocumentTags(id, tags)` - Remove tags from document
- `createFolder(input)` - Create folder
- `updateFolder(id, input)` - Update folder
- `deleteFolder(id, deleteDocuments)` - Delete folder
- `moveFolder(id, parentId)` - Move folder
- `requestOCR(documentId)` - Request OCR processing
- `requestAIAnalysis(documentId)` - Request AI analysis
- `cancelProcessing(documentId)` - Cancel processing
- `updateAccessControl(documentId, accessControl)` - Update access control
- `shareDocument(documentId, userIds, permissions)` - Share document
- `archiveDocument(id)` - Archive document
- `deleteDocument(id)` - Delete document
- `permanentlyDeleteDocument(id)` - Permanently delete document
- `restoreDocument(id)` - Restore document

#### Users
- `updateMyProfile(input)` - Update current user's profile
- `updateAvatar(file)` - Update avatar
- `changePassword(currentPassword, newPassword)` - Change password
- `updatePreferences(input)` - Update preferences
- `updateNotificationSettings(input)` - Update notification settings
- `enableTwoFactor()` - Enable 2FA
- `disableTwoFactor(code)` - Disable 2FA
- `verifyTwoFactor(code)` - Verify 2FA code
- `markNotificationRead(id)` - Mark notification as read
- `markAllNotificationsRead()` - Mark all notifications as read
- `deleteNotification(id)` - Delete notification
- `revokeSession(sessionId)` - Revoke session
- `revokeAllSessions()` - Revoke all sessions
- `createUser(input)` - Create user (admin)
- `updateUser(id, input)` - Update user (admin)
- `deleteUser(id)` - Delete user (admin)
- `suspendUser(id, reason)` - Suspend user (admin)
- `unsuspendUser(id)` - Unsuspend user (admin)
- `activateUser(id)` - Activate user (admin)
- `deactivateUser(id)` - Deactivate user (admin)
- `createTeam(input)` - Create team
- `updateTeam(id, input)` - Update team
- `deleteTeam(id)` - Delete team
- `addTeamMember(teamId, userId, role)` - Add team member
- `removeTeamMember(teamId, userId)` - Remove team member

#### Analytics
- `createCustomReport(input)` - Create custom report
- `updateCustomReport(id, input)` - Update custom report
- `deleteCustomReport(id)` - Delete custom report
- `runCustomReport(id)` - Run custom report
- `scheduleReport(id, schedule)` - Schedule report
- `shareReport(id, userIds)` - Share report
- `favoriteReport(id, favorite)` - Favorite/unfavorite report
- `trainPredictionModel(input)` - Train AI prediction model
- `refreshAnalyticsCache(reportType)` - Refresh analytics cache

#### Compliance
- `createCompliancePolicy(input)` - Create compliance policy
- `updateCompliancePolicy(id, input)` - Update compliance policy
- `deleteCompliancePolicy(id)` - Delete compliance policy
- `approvePolicy(id)` - Approve policy
- `addRequirement(policyId, input)` - Add requirement
- `updateRequirement(id, input)` - Update requirement
- `verifyRequirement(id)` - Verify requirement
- `addControl(policyId, input)` - Add control
- `updateControl(id, input)` - Update control
- `assessControl(id, effectiveness)` - Assess control
- `createAudit(input)` - Create audit
- `updateAudit(id, input)` - Update audit
- `completeAudit(id)` - Complete audit
- `createFinding(auditId, input)` - Create finding
- `updateFinding(id, input)` - Update finding
- `resolveFinding(id, resolution)` - Resolve finding
- `createRiskAssessment(input)` - Create risk assessment
- `updateRiskAssessment(id, input)` - Update risk assessment
- `approveRiskAssessment(id)` - Approve risk assessment
- `addRisk(assessmentId, input)` - Add risk
- `updateRisk(id, input)` - Update risk
- `createTreatmentPlan(riskId, input)` - Create treatment plan
- `reportIncident(input)` - Report incident
- `updateIncident(id, input)` - Update incident
- `closeIncident(id, summary)` - Close incident
- `createTraining(input)` - Create training
- `updateTraining(id, input)` - Update training
- `publishTraining(id)` - Publish training
- `enrollInTraining(trainingId)` - Enroll in training
- `completeTraining(enrollmentId, score)` - Complete training

### Subscriptions

#### Cases
- `caseCreated` - New case created
- `caseUpdated(caseId)` - Case updated
- `caseStatusChanged(caseId)` - Case status changed
- `newCaseEvent(caseId)` - New case event
- `taskAssigned(userId)` - Task assigned to user

#### Documents
- `documentUploaded(caseId)` - Document uploaded
- `documentUpdated(documentId)` - Document updated
- `documentProcessingStatus(documentId)` - Document processing status
- `documentShared(userId)` - Document shared with user

#### Users
- `notificationReceived(userId)` - Notification received
- `userStatusChanged(userId)` - User status changed
- `userOnlineStatus(userId)` - User online status

#### Analytics
- `analyticsUpdated(reportType)` - Analytics updated
- `metricAlert(userId)` - Metric alert
- `reportGenerated(reportId)` - Report generated

#### Compliance
- `incidentReported` - Incident reported
- `findingCreated(auditId)` - Finding created
- `riskLevelChanged` - Risk level changed
- `trainingDue(userId)` - Training due
- `complianceAlerts` - Compliance alerts

---

## REST API V2 (`/api/v2/*`)

### Cases (`/api/v2/cases`)

#### GET Endpoints
- `GET /api/v2/cases` - List all cases with advanced filtering
  - Query params: cursor, limit, status[], priority[], practiceArea, assignedToMe, search, fields, sort
- `GET /api/v2/cases/:id` - Get case by ID
  - Query params: include (documents, timeline, billing)
- `GET /api/v2/cases/:id/ai-insights` - Get AI insights for case
- `GET /api/v2/cases/:id/metrics` - Get case metrics
- `GET /api/v2/cases/:id/export` - Export case data
  - Query params: format (json, pdf, csv)

#### POST Endpoints
- `POST /api/v2/cases` - Create new case
- `POST /api/v2/cases/bulk` - Bulk create cases
- `POST /api/v2/cases/:id/team` - Assign user to case team
- `POST /api/v2/cases/:id/status` - Change case status
- `POST /api/v2/cases/:id/analyze` - Request AI analysis

#### PATCH Endpoints
- `PATCH /api/v2/cases/:id` - Partially update case
- `PATCH /api/v2/cases/bulk` - Bulk update cases

#### PUT Endpoints
- `PUT /api/v2/cases/:id` - Fully update case

#### DELETE Endpoints
- `DELETE /api/v2/cases/:id` - Delete case (soft delete)
- `DELETE /api/v2/cases/:id/team/:userId` - Remove user from case team

---

## REST API V1 (`/api/v1/*`) - DEPRECATED

⚠️ **DEPRECATED** - Will be sunset on June 1, 2025. Please migrate to V2 or GraphQL.

### Cases (`/api/v1/cases`)

#### GET Endpoints
- `GET /api/v1/cases` - List all cases
  - Query params: page, limit, status
- `GET /api/v1/cases/:id` - Get case by ID
- `GET /api/v1/cases/:id/documents` - Get case documents
- `GET /api/v1/cases/:id/timeline` - Get case timeline

#### POST Endpoints
- `POST /api/v1/cases` - Create new case
- `POST /api/v1/cases/:id/assign` - Assign case to user

#### PUT Endpoints
- `PUT /api/v1/cases/:id` - Update case

#### DELETE Endpoints
- `DELETE /api/v1/cases/:id` - Delete case

---

## API Endpoints Summary

### Total Endpoints by Category

**GraphQL API:**
- Queries: 70+
- Mutations: 100+
- Subscriptions: 20+
- **Total: 190+ operations**

**REST API V2:**
- Cases: 13 endpoints
- Additional modules to be implemented
- **Total: 13+ endpoints** (Cases module only)

**REST API V1 (Deprecated):**
- Cases: 8 endpoints
- **Total: 8+ endpoints**

### Authentication

All endpoints require authentication via:
- **JWT Bearer Token**: `Authorization: Bearer <token>`
- **API Key** (server-to-server): `X-API-Key: <key>`
- **OAuth 2.0**: Authorization code flow

### Rate Limits

- Standard: 1000 requests/hour
- Premium: 5000 requests/hour
- Enterprise: Custom limits

### Documentation URLs

- GraphQL Playground: `http://localhost:3000/graphql`
- REST API V2 Docs: `http://localhost:3000/api/docs/v2`
- REST API V1 Docs: `http://localhost:3000/api/docs/v1`
- Main Docs: `http://localhost:3000/api/docs`

### API Specifications

- V2 OpenAPI Spec: `http://localhost:3000/api/docs/v2/json`
- V1 OpenAPI Spec: `http://localhost:3000/api/docs/v1/json`

---

## Migration Guide

For migrating from V1 to V2 or GraphQL:
- Migration Guide: https://docs.lexiflow.ai/migration/v1-to-v2
- GraphQL Migration: https://docs.lexiflow.ai/migration/rest-to-graphql

---

**End of API Endpoint Inventory**
