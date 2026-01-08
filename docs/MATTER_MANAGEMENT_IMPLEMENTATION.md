# Matter/Case Management System Implementation

## Overview

This document details the comprehensive Matter/Case Management system built for LexiFlow Legal SaaS. The system provides enterprise-grade matter management, deadline tracking, conflict checking, case relationships, timeline visualization, and court calendar integration.

## Architecture

### Backend Components

#### Entities

Located in `/backend/src/`

##### 1. CaseDeadline Entity (`/cases/entities/case-deadline.entity.ts`)
- Comprehensive deadline tracking with jurisdiction-specific rules
- Supports business days, holidays, and court closures
- Automatic reminder calculation
- Extension request tracking
- Priority and status management
- Links to jurisdiction rules and triggering events

**Key Features:**
- Multiple deadline types (filing, response, discovery, motion, trial, appeal)
- Status tracking (pending, upcoming, due_today, overdue, completed)
- Priority levels (low, medium, high, critical)
- Automatic calculation of days remaining
- Court-imposed and statutory deadline flags

##### 2. CaseRelationship Entity (`/cases/entities/case-relationship.entity.ts`)
- Tracks relationships between cases
- Supports 20+ relationship types
- Bidirectional relationship support
- Relationship strength scoring
- Shared parties and issues tracking

**Relationship Types:**
- Appeal chains (appealed_from, appealed_to)
- Consolidation (lead_case, member_case, consolidated)
- Related cases (related, parallel, companion)
- Case transfers (transferred_from, transferred_to)
- MDL and class action tracking

##### 3. DeadlineRule Entity (`/jurisdictions/entities/deadline-rule.entity.ts`)
- Jurisdiction-specific deadline calculation rules
- Business days vs calendar days
- Holiday exclusions (federal, state, court-specific)
- Extension policies and standards
- Consequence tracking for missed deadlines

**Features:**
- Automatic deadline calculation from trigger events
- Support for FRCP, FRAP, and state-specific rules
- Extension request management
- Jurisdictional vs discretionary deadlines

#### Services

##### 1. Matter Management Service (`/cases/matter-management.service.ts`)

**Core Functionality:**
- Matter lifecycle management (create, update, archive, close, reopen)
- Advanced matter search with filtering
- Matter statistics and analytics
- Case-to-matter linking
- Attorney workload distribution

**Key Methods:**
```typescript
- getMatterWithDetails(matterId) // Enriched matter data with deadlines, conflicts
- searchMatters(filters, page, pageSize) // Advanced search
- getMatterStatistics(filters) // Aggregate statistics
- linkCaseToMatter(caseId, matterId) // Associate cases
- getAttorneyWorkload() // Workload distribution
```

##### 2. Conflict Check Service (`/cases/conflict-check.service.ts`)

**Core Functionality:**
- Comprehensive conflict of interest detection
- Client conflict checking
- Party-based conflict detection
- Case conflict analysis
- Automated recommendations
- Waiver tracking

**Conflict Detection:**
- Direct representation conflicts
- Adverse interest detection
- Concurrent representation
- Former client conflicts
- Related entity conflicts

**Key Methods:**
```typescript
- performConflictCheck(request) // Main conflict check
- checkClientConflicts(clientName, opposingParties)
- checkPartyConflicts(parties, opposing)
- checkCaseConflicts(parties, entities)
- recordWaiver(conflictCheckId, documentId)
```

##### 3. Deadline Calculator Service (`/cases/deadline-calculator.service.ts`)

**Core Functionality:**
- Jurisdiction-specific deadline calculation
- Business days vs calendar days
- Federal and state holiday support
- Deadline extension management
- Automatic reminder scheduling

**Key Features:**
- FRCP, FRAP, and state rule support
- Holiday calendar management
- Automatic extension date calculation
- Reminder notifications (7, 3, 1 days before)
- Overdue deadline tracking

**Key Methods:**
```typescript
- calculateDeadline(request) // Calculate from rules
- createDeadlineFromCalculation(request) // Create deadline
- extendDeadline(deadlineId, days, reason) // Extend deadline
- getUpcomingDeadlines(caseId, days) // Get upcoming
- getOverdueDeadlines(caseId) // Get overdue
- autoCreateDeadlinesFromRules(caseId, jurisdiction)
```

##### 4. Case Timeline Service (`/cases/case-timeline.service.ts`)

**Core Functionality:**
- Chronological event tracking
- Phase-based case progression
- Gantt chart data generation
- Milestone tracking
- Critical path analysis

**Timeline Events:**
- Filing events
- Deadlines
- Hearings
- Motions
- Discovery events
- Status changes

**Key Methods:**
```typescript
- getCaseTimeline(caseId, filter) // Get full timeline
- getCasePhases(caseId) // Get phases with progress
- getGanttChartData(caseId) // Gantt visualization
- getCriticalPath(caseId) // Critical events only
- addTimelineEvent(caseId, event) // Add custom event
- exportTimeline(caseId, format) // Export (JSON/CSV)
```

##### 5. Related Cases Service (`/cases/related-cases.service.ts`)

**Core Functionality:**
- Case relationship management
- Network visualization support
- Automatic relationship detection
- Appeal chain tracking
- Consolidation management

**Key Methods:**
```typescript
- createRelationship(case1, case2, type) // Create relationship
- getCaseRelationships(caseId) // Get all relationships
- buildCaseNetwork(caseId, depth) // Network graph data
- suggestRelatedCases(caseId) // AI-powered suggestions
- getConsolidatedCases(leadCaseId) // Get consolidated
- getAppealChain(caseId) // Appeal hierarchy
```

##### 6. Court Calendar Integration Service (`/cases/court-calendar-integration.service.ts`)

**Core Functionality:**
- PACER integration for federal courts
- State court system integrations
- Calendar event synchronization
- iCalendar feed generation
- Webhook support for real-time updates

**Integration Points:**
- PACER (federal courts)
- State court systems (California Odyssey, NY NYSCEF, Texas eCourts)
- Webhook subscriptions
- iCalendar feed export

**Key Methods:**
```typescript
- syncPacerCalendar(caseId, pacerNumber, court)
- syncStateCourtCalendar(caseId, stateNumber, court, state)
- importCourtEvent(caseId, event)
- generateICalendarFeed(caseId) // Export to calendar apps
- subscribeToCourtCalendar(caseId, court, webhookUrl)
- processCourtCalendarWebhook(payload)
```

### Frontend Components

Located in `/frontend/src/features/matter-management/components/`

##### 1. MatterDashboard.tsx

**Features:**
- Matter listing with advanced filtering
- Real-time statistics (total matters, value, average age)
- Status, type, and priority filters
- Search functionality
- Conflict status indicators
- Active deadline counts

**UI Components:**
- Statistics cards
- Filter panel
- Data table with sorting
- Badge indicators for status/priority
- Quick actions

##### 2. MatterCreationWizard.tsx

**5-Step Wizard:**
1. **Basic Information** - Title, description, type, priority, practice area
2. **Client & Assignment** - Client selection, lead attorney assignment
3. **Financial Details** - Billing type, rates, budget, estimated value
4. **Conflict Check** - Parties involved, opposing parties
5. **Review & Submit** - Confirmation with summary

**Features:**
- Progress tracking
- Form validation
- Step navigation
- Automatic conflict check triggering
- Billing type-specific fields

##### 3. TimelineVisualization.tsx

**Visualization Modes:**
- **Timeline View** - Chronological event listing
- **Gantt Chart** - Phase-based visualization with progress bars

**Features:**
- Event type icons
- Status indicators
- Priority badges
- Phase progress tracking
- Export functionality
- Event filtering

##### 4. DeadlineCalculator.tsx

**Features:**
- Jurisdiction selection
- Rule-based deadline calculation
- Custom deadline support
- Business days vs calendar days
- Holiday exclusions
- Real-time calculation
- Save to case functionality

**Supported Rules:**
- FRCP rules (12(a)(1), 26(a)(1), 56)
- FRAP rules (4)
- Custom deadlines
- State-specific rules

##### 5. ConflictCheckPanel.tsx

**3-Step Process:**
1. **Input** - Client name, matter description, parties
2. **Checking** - Animated progress indicator
3. **Results** - Detailed conflict report

**Result Display:**
- Conflict severity badge
- Conflicting cases list
- Conflicting clients list
- Recommendations
- Waiver requirement indicator

**Conflict Levels:**
- No conflict (green)
- Low severity (blue)
- Medium severity (yellow)
- High severity (orange)
- Critical severity (red)

##### 6. RelatedCasesNetwork.tsx

**Visualization Modes:**
- **Network View** - Interactive node graph
- **List View** - Detailed relationship list

**Features:**
- Central node highlighting
- Relationship type badges
- Network depth control (1-3 levels)
- Node selection
- Relationship strength indicators
- Network statistics
- Quick navigation to related cases

## Database Schema

### New Tables

#### case_deadlines
```sql
- id (uuid, PK)
- case_id (uuid, FK -> cases.id)
- title (varchar)
- description (text)
- deadline_type (enum)
- deadline_date (timestamp)
- original_deadline_date (timestamp)
- status (enum)
- priority (enum)
- jurisdiction_rule_id (uuid, FK)
- rule_citation (varchar)
- trigger_event (varchar)
- trigger_date (date)
- days_from_trigger (int)
- business_days_only (boolean)
- excluded_dates (jsonb)
- assigned_to (uuid)
- assigned_team_id (uuid)
- reminder_dates (jsonb)
- reminders_sent (jsonb)
- completed_date (timestamp)
- completed_by (uuid)
- completion_notes (text)
- extension_request (jsonb)
- is_court_imposed (boolean)
- is_statutory (boolean)
- is_extendable (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### case_relationships
```sql
- id (uuid, PK)
- case_id_1 (uuid, FK -> cases.id)
- case_id_2 (uuid, FK -> cases.id)
- relationship_type (enum)
- description (text)
- is_bidirectional (boolean)
- relationship_strength (int)
- established_date (date)
- ended_date (date)
- is_active (boolean)
- source_document_id (uuid)
- court_order_reference (varchar)
- established_by_judge (varchar)
- external_case_info (jsonb)
- shared_parties (jsonb)
- shared_issues (jsonb)
- tags (jsonb)
- notes (text)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

#### deadline_rules
```sql
- id (uuid, PK)
- jurisdiction_id (uuid, FK -> jurisdictions.id)
- name (varchar)
- rule_citation (varchar)
- rule_type (enum)
- rule_text (text)
- summary (text)
- days_count (int)
- calculation_method (enum)
- business_days_only (boolean)
- exclude_weekends (boolean)
- exclude_federal_holidays (boolean)
- exclude_state_holidays (boolean)
- exclude_court_holidays (boolean)
- excluded_dates (jsonb)
- trigger_event (varchar)
- allows_stipulated_extension (boolean)
- allows_court_extension (boolean)
- extension_standard (varchar)
- is_jurisdictional (boolean)
- is_mandatory (boolean)
- priority_level (int)
- source_url (varchar)
- effective_date (date)
- expiration_date (date)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

## API Endpoints

### Matter Management
```
GET    /api/matters?filters           - List matters with filtering
GET    /api/matters/:id               - Get matter details
GET    /api/matters/:id/details       - Get enriched matter details
POST   /api/matters                   - Create new matter
PUT    /api/matters/:id               - Update matter
DELETE /api/matters/:id               - Delete matter
POST   /api/matters/:id/archive       - Archive matter
POST   /api/matters/:id/close         - Close matter
POST   /api/matters/:id/reopen        - Reopen matter
GET    /api/matters/statistics        - Get matter statistics
GET    /api/matters/attorney-workload - Get attorney workload
```

### Conflict Checking
```
POST   /api/conflict-checks/perform   - Perform conflict check
GET    /api/conflict-checks/:id       - Get conflict check details
PUT    /api/conflict-checks/:id       - Update conflict check status
POST   /api/conflict-checks/:id/waiver - Record waiver
GET    /api/conflict-checks/pending   - Get pending checks
```

### Deadline Management
```
POST   /api/deadlines/calculate       - Calculate deadline
POST   /api/deadlines                 - Create deadline
PUT    /api/deadlines/:id             - Update deadline
POST   /api/deadlines/:id/extend      - Extend deadline
POST   /api/deadlines/:id/complete    - Mark as completed
GET    /api/deadlines/upcoming/:caseId - Get upcoming deadlines
GET    /api/deadlines/overdue/:caseId  - Get overdue deadlines
POST   /api/deadlines/auto-create      - Auto-create from rules
```

### Timeline
```
GET    /api/cases/:id/timeline        - Get case timeline
GET    /api/cases/:id/phases          - Get case phases
GET    /api/cases/:id/gantt           - Get Gantt chart data
GET    /api/cases/:id/critical-path   - Get critical path
POST   /api/cases/:id/timeline/event  - Add timeline event
GET    /api/cases/:id/timeline/export - Export timeline
```

### Related Cases
```
GET    /api/cases/:id/relationships   - Get case relationships
POST   /api/cases/relationships       - Create relationship
PUT    /api/cases/relationships/:id   - Update relationship
DELETE /api/cases/relationships/:id   - Delete relationship
GET    /api/cases/:id/network         - Get case network
GET    /api/cases/:id/suggestions     - Get relationship suggestions
GET    /api/cases/:id/appeal-chain    - Get appeal chain
GET    /api/cases/:id/consolidated    - Get consolidated cases
```

### Court Calendar
```
POST   /api/court-calendar/sync-pacer - Sync PACER calendar
POST   /api/court-calendar/sync-state - Sync state court calendar
POST   /api/court-calendar/import     - Import court event
GET    /api/court-calendar/:caseId/ical - Get iCalendar feed
POST   /api/court-calendar/subscribe  - Subscribe to updates
POST   /api/court-calendar/webhook    - Process webhook
GET    /api/court-calendar/:caseId/upcoming - Get upcoming court events
```

## Usage Examples

### Creating a Matter with Conflict Check

```typescript
// 1. Create matter
const matter = await matterService.create({
  title: 'Smith v. Johnson - Contract Dispute',
  matterType: MatterType.LITIGATION,
  priority: MatterPriority.HIGH,
  clientName: 'Smith Corp',
  // ... other fields
});

// 2. Perform conflict check
const conflictResult = await conflictCheckService.performConflictCheck({
  matterId: matter.id,
  potentialClientName: 'Smith Corp',
  matterDescription: 'Contract dispute over software licensing',
  partiesInvolved: ['Smith Corp', 'John Smith'],
  opposingParties: ['Johnson Inc', 'Jane Johnson'],
  requestedBy: userId,
});

// 3. Handle conflict result
if (conflictResult.hasConflict) {
  if (conflictResult.requiresWaiver) {
    // Request waiver
    await conflictCheckService.recordWaiver(
      conflictCheck.id,
      waiverDocumentId,
      'pending'
    );
  }
}
```

### Calculating Deadlines

```typescript
// Auto-create deadlines from jurisdiction rules
const deadlines = await deadlineCalculatorService.autoCreateDeadlinesFromRules(
  caseId,
  jurisdictionId,
  'Case Filed',
  new Date('2026-01-01')
);

// Calculate custom deadline
const calculated = await deadlineCalculatorService.calculateDeadline({
  caseId,
  jurisdictionId,
  triggerEvent: 'Service of Summons',
  triggerDate: new Date('2026-01-15'),
  customDaysCount: 21,
  excludeWeekends: true,
  excludeHolidays: true,
});

// Create deadline from calculation
const deadline = await deadlineCalculatorService.createDeadlineFromCalculation(
  calculationRequest,
  'Answer to Complaint',
  'Deadline to file answer',
  DeadlineType.RESPONSE,
  DeadlinePriority.HIGH
);
```

### Building Case Network

```typescript
// Get case network for visualization
const network = await relatedCasesService.buildCaseNetwork(caseId, 2);

// network.nodes contains all related cases
// network.edges contains relationships

// Render in frontend
<RelatedCasesNetwork
  caseId={caseId}
  onCaseSelect={(id) => navigate(`/cases/${id}`)}
  onAddRelationship={() => setShowRelationshipForm(true)}
/>
```

## Security Considerations

1. **Access Control**: All services check user permissions before operations
2. **Data Validation**: Input validation on all API endpoints
3. **Audit Logging**: All conflict checks and deadline changes are logged
4. **Encryption**: Sensitive client data is encrypted at rest
5. **API Rate Limiting**: Court calendar API calls are rate-limited

## Performance Optimizations

1. **Database Indexes**: Strategic indexes on frequently queried fields
2. **Caching**: Redis caching for jurisdiction rules and holidays
3. **Pagination**: All list endpoints support pagination
4. **Lazy Loading**: Frontend components use lazy loading
5. **Query Optimization**: Use of TypeORM query builder for complex queries

## Future Enhancements

1. **AI-Powered Features**:
   - Automatic conflict detection from documents
   - Deadline prediction based on case type
   - Relationship suggestion improvements

2. **Integrations**:
   - Microsoft Outlook calendar sync
   - Google Calendar integration
   - Slack notifications for deadlines
   - Email integration for court notifications

3. **Advanced Features**:
   - Multi-jurisdiction deadline calculation
   - Predictive analytics for case timelines
   - Automated deadline extensions
   - Court rule change notifications

## Testing

### Backend Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Specific service tests
npm run test matter-management.service
npm run test deadline-calculator.service
```

### Frontend Tests
```bash
# Component tests
npm run test

# E2E tests
npm run test:e2e
```

## Deployment

### Database Migrations
```bash
# Generate migration
npm run migration:generate

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Environment Variables
```
# Court Calendar Integration
PACER_API_KEY=your_pacer_api_key
PACER_API_URL=https://pacer.api.gov
CA_ODYSSEY_API_KEY=your_ca_odyssey_key
NY_NYSCEF_API_KEY=your_ny_nyscef_key

# Feature Flags
ENABLE_COURT_CALENDAR_SYNC=true
ENABLE_AI_SUGGESTIONS=true
```

## Support

For questions or issues:
- Documentation: `/docs`
- API Reference: `/api-docs`
- Support: support@lexiflow.com

---

**Implementation Date**: January 8, 2026
**Version**: 1.0.0
**Author**: Agent 4 - Case/Matter Management
