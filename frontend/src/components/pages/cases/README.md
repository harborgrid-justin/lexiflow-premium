# Case Management Pages

## Overview
Complete case lifecycle management from intake through resolution, including analytics, operations, insights, and financials.

## Pages (7)

### CaseListPage
**Route**: `/cases`  
**Purpose**: Search, filter, and browse all cases  
**Features**: Advanced search, filtering, sorting, bulk actions

### CaseOverviewPage
**Route**: `/cases/:id`  
**Purpose**: Individual case dashboard with key metrics  
**Features**: Case summary, timeline, team, status tracking

### CaseAnalyticsPage
**Route**: `/cases/:id/analytics`  
**Purpose**: Case-specific analytics and reporting  
**Features**: Performance metrics, budget vs. actual, trend analysis

### CaseIntakePage
**Route**: `/cases/new`  
**Purpose**: New case intake form with conflict check  
**Features**: Client info, matter details, conflict screening

### CaseOperationsPage
**Route**: `/cases/:id/operations`  
**Purpose**: Task and project management for case  
**Features**: Task lists, assignments, deadlines, dependencies

### CaseInsightsPage
**Route**: `/cases/:id/insights`  
**Purpose**: AI-powered case insights and recommendations  
**Features**: Predictive analytics, strategy suggestions, risk assessment

### CaseFinancialsPage
**Route**: `/cases/:id/financials`  
**Purpose**: Case budgets, billing, and financial tracking  
**Features**: Budget management, time entries, expenses, invoicing

## Usage

```typescript
import { 
  CaseListPage,
  CaseOverviewPage,
  CaseAnalyticsPage 
} from '@/components/pages/cases';
```

## Domain Scope
Comprehensive case management covering the entire matter lifecycle.
