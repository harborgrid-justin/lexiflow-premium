#!/bin/bash

# Script to create stub route files for React Router v7

# Create directory structure
mkdir -p /workspaces/lexiflow-premium/frontend/src/routes/{docket,documents,correspondence,workflows,discovery,evidence,exhibits,research,war-room,pleading,drafting,litigation,billing,crm,compliance,practice,daf,entities,data-platform,analytics,library,clauses,jurisdiction,rules,calendar,messages,profile,admin,real-estate}

# Function to create a basic route stub
create_route_stub() {
    local path=$1
    local component_name=$2
    local title=$3

    cat > "$path" << 'ROUTE_EOF'
/**
 * ROUTE_TITLE Route
 *
 * Auto-generated stub - customize as needed
 */

import type { Route } from "./+types/ROUTE_NAME";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ROUTE_TITLE - LexiFlow" },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  // TODO: Fetch data from API
  return { data: null };
}

export default function COMPONENT_NAME({ loaderData }: Route.ComponentProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">ROUTE_TITLE</h1>
      <p className="text-gray-600">This route is under construction.</p>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="p-8 text-center text-red-600">
      Failed to load ROUTE_TITLE: {error instanceof Error ? error.message : "Unknown error"}
    </div>
  );
}
ROUTE_EOF

    # Replace placeholders
    local route_name=$(basename "$path" .tsx)
    sed -i "s/ROUTE_NAME/$route_name/g" "$path"
    sed -i "s/ROUTE_TITLE/$title/g" "$path"
    sed -i "s/COMPONENT_NAME/$component_name/g" "$path"
}

# Create route stubs
echo "Creating route stubs..."

# Docket
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/docket/index.tsx" "DocketIndexRoute" "Docket & Filings"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/docket/detail.tsx" "DocketDetailRoute" "Docket Detail"

# Documents
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/documents/index.tsx" "DocumentsIndexRoute" "Documents"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/documents/detail.tsx" "DocumentDetailRoute" "Document Detail"

# Correspondence
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/correspondence/index.tsx" "CorrespondenceIndexRoute" "Correspondence"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/correspondence/compose.tsx" "CorrespondenceComposeRoute" "Compose Correspondence"

# Workflows
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/workflows/index.tsx" "WorkflowsIndexRoute" "Workflows"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/workflows/detail.tsx" "WorkflowDetailRoute" "Workflow Detail"

# Discovery
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/discovery/index.tsx" "DiscoveryIndexRoute" "Discovery"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/discovery/detail.tsx" "DiscoveryDetailRoute" "Discovery Detail"

# Evidence
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/evidence/index.tsx" "EvidenceIndexRoute" "Evidence Vault"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/evidence/detail.tsx" "EvidenceDetailRoute" "Evidence Detail"

# Exhibits
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/exhibits/index.tsx" "ExhibitsIndexRoute" "Exhibit Pro"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/exhibits/detail.tsx" "ExhibitDetailRoute" "Exhibit Detail"

# Research
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/research/index.tsx" "ResearchIndexRoute" "Legal Research"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/research/detail.tsx" "ResearchDetailRoute" "Research Detail"

# Citations
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/citations/index.tsx" "CitationsIndexRoute" "Citations"

# War Room
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/war-room/index.tsx" "WarRoomIndexRoute" "War Room"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/war-room/detail.tsx" "WarRoomDetailRoute" "War Room Detail"

# Pleading & Drafting
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/pleading/builder.tsx" "PleadingBuilderRoute" "Pleading Builder"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/drafting/index.tsx" "DraftingIndexRoute" "Drafting & Assembly"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/litigation/builder.tsx" "LitigationBuilderRoute" "Litigation Strategy"

# Operations
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/billing/index.tsx" "BillingIndexRoute" "Billing & Finance"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/crm/index.tsx" "CRMIndexRoute" "Client CRM"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/crm/client-detail.tsx" "ClientDetailRoute" "Client Detail"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/compliance/index.tsx" "ComplianceIndexRoute" "Compliance"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/practice/index.tsx" "PracticeIndexRoute" "Firm Operations"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/daf/index.tsx" "DAFIndexRoute" "DAF Operations"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/entities/index.tsx" "EntitiesIndexRoute" "Entity Director"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/data-platform/index.tsx" "DataPlatformIndexRoute" "Data Platform"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/analytics/index.tsx" "AnalyticsIndexRoute" "Analytics"

# Knowledge
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/library/index.tsx" "LibraryIndexRoute" "Knowledge Base"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/clauses/index.tsx" "ClausesIndexRoute" "Clause Library"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/jurisdiction/index.tsx" "JurisdictionIndexRoute" "Jurisdictions"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/rules/index.tsx" "RulesIndexRoute" "Rules Engine"

# Calendar & Messages
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/calendar/index.tsx" "CalendarIndexRoute" "Master Calendar"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/messages/index.tsx" "MessagesIndexRoute" "Secure Messenger"

# Profile & Admin
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/profile/index.tsx" "ProfileIndexRoute" "My Profile"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/admin/index.tsx" "AdminIndexRoute" "Admin Panel"
create_route_stub "/workspaces/lexiflow-premium/frontend/src/routes/admin/theme-settings.tsx" "ThemeSettingsRoute" "Theme Settings"

echo "Route stubs created successfully!"
