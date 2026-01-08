/**
 * Usage Examples for Case Management & Discovery Layouts
 *
 * Complete working examples for all four layouts.
 * Copy and adapt these examples for your specific use cases.
 */

"use client";

import React, { useState } from "react";
import {
  CaseDetailLayout,
  DiscoveryLayout,
  TimelineLayout,
  KanbanLayout,
  type CaseData,
  type DiscoveryDocument,
  type DiscoveryFilters,
  type TimelineEvent,
  type KanbanColumn,
  type KanbanCard,
} from "@/components/layouts/enterprise";

// EXAMPLE 1: CaseDetailLayout
export function CaseDetailExample() {
  const [activeTab, setActiveTab] = useState<"overview" | "parties" | "documents">("overview");

  const caseData: CaseData = {
    id: "case-123",
    caseNumber: "CV-2024-12345",
    title: "Smith v. Acme Corporation",
    status: "Discovery",
    courtName: "Superior Court of California",
    judgeName: "Hon. Jane Doe",
    filingDate: new Date("2024-01-15"),
    practiceArea: "Product Liability",
    description: "Product liability case involving alleged defects",
    stats: {
      daysOpen: 180,
      budgetUsed: 125000,
      budgetTotal: 200000,
      documentCount: 1247,
      upcomingDeadlines: 3,
    },
    keyDates: [
      {
        id: "kd-1",
        title: "Discovery Cutoff",
        date: new Date("2024-08-15"),
        type: "deadline",
      },
    ],
    assignedTeam: [
      {
        id: "u-1",
        name: "John Smith",
        role: "Lead Attorney",
        email: "john@firm.com",
        hours: 45.5,
      },
    ],
    relatedCases: [],
    activities: [],
  };

  return (
    <CaseDetailLayout caseData={caseData} activeTab={activeTab} onTabChange={setActiveTab}>
      <div>Tab content goes here</div>
    </CaseDetailLayout>
  );
}

// EXAMPLE 2: DiscoveryLayout
export function DiscoveryExample() {
  const [filters, setFilters] = useState<DiscoveryFilters>({
    dateRange: { from: null, to: null },
    documentTypes: [],
    custodians: [],
    tags: [],
    status: [],
  });

  const documents: DiscoveryDocument[] = [
    {
      id: "doc-1",
      fileName: "Contract.pdf",
      fileType: "pdf",
      fileSize: 2457600,
      uploadDate: new Date(),
      lastModified: new Date(),
      custodian: "John Smith",
      tags: ["Contract"],
      status: "responsive",
    },
  ];

  return (
    <DiscoveryLayout
      documents={documents}
      filters={filters}
      onFilterChange={setFilters}
      viewMode="grid"
      currentPage={1}
      totalPages={1}
      totalCount={1}
    />
  );
}

// EXAMPLE 3: TimelineLayout
export function TimelineExample() {
  const events: TimelineEvent[] = [
    {
      id: "evt-1",
      type: "filing",
      title: "Complaint Filed",
      description: "Initial complaint",
      date: new Date("2024-01-15"),
      status: "completed",
    },
  ];

  return (
    <TimelineLayout
      events={events}
      filters={{ eventTypes: [] }}
      onFilterChange={() => {}}
      zoomLevel="month"
    />
  );
}

// EXAMPLE 4: KanbanLayout
export function KanbanExample() {
  const columns: KanbanColumn[] = [
    { id: "col-1", title: "To Do", color: "#94a3b8", cardIds: [], order: 1 },
  ];

  const cards: KanbanCard[] = [
    {
      id: "card-1",
      title: "Review Documents",
      columnId: "col-1",
      priority: "high",
    },
  ];

  return <KanbanLayout columns={columns} cards={cards} />;
}
