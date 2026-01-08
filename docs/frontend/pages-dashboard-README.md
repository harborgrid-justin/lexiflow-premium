# Dashboard Pages

## Overview
Executive dashboard and firm-wide analytics for leadership decision-making.

## Pages

### DashboardPage
**Route**: `/dashboard`  
**Purpose**: Executive overview with firm-wide metrics and KPIs  
**Features**:
- Firm-wide case statistics
- Revenue analytics
- Team performance metrics
- Recent activity feed
- Quick action tiles

**Template**: `PageContainerLayout`  
**Feature**: `Dashboard`

## Usage

```typescript
import { DashboardPage } from '@/components/pages/dashboard';

<Route path="/dashboard" element={
  <DashboardPage 
    onSelectCase={handleCaseSelect}
    currentUser={user}
  />
} />
```

## Domain Scope
Single page providing high-level overview of firm operations for C-level executives and managing partners.
