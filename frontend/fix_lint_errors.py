#!/usr/bin/env python3
"""Fix ESLint errors by prefixing unused variables with underscore or removing unused imports."""

import re
import sys
from pathlib import Path

# Define the fixes
FIXES = [
    # FinancialReports.tsx - Change named imports to type imports
    {
        "file": "src/components/enterprise/Billing/FinancialReports.tsx",
        "old": """import {
  type MatterProfitability,
  type ProfitabilityMetrics,
  type RealizationMetrics,
  type RevenueForecasting,
  type TimekeeperPerformance,
  type WorkInProgressMetrics
} from '@/api/billing/enterprise-billing.service';
import {
  FINANCIAL_REPORT_TAB_LABELS,
  FINANCIAL_REPORT_TABS,
  FinancialReportTab,""",
        "new": """import type {
  MatterProfitability,
  ProfitabilityMetrics,
  RealizationMetrics,
  RevenueForecasting,
  TimekeeperPerformance,
  WorkInProgressMetrics
} from '@/api/billing/enterprise-billing.service';
import type {
  FinancialReportTab,
} from '@/config/billing.config';
import {
  FINANCIAL_REPORT_TAB_LABELS,
  FINANCIAL_REPORT_TABS,"""
    },
    # DocketEntryBuilder.stories.tsx
    {
        "file": "src/components/stories/features/docket/DocketEntryBuilder.stories.tsx",
        "old": "import React from 'react';\nimport { ToastProvider } from '@/contexts/ToastContext';",
        "new": "import React from 'react';"
    },
    # DocketManager.stories.tsx
    {
        "file": "src/components/stories/features/docket/DocketManager.stories.tsx",
        "old": "import { QueryClientProvider, QueryClient } from '@tanstack/react-query';\nimport { WindowProvider } from '@/contexts/WindowContext';",
        "new": "import { QueryClientProvider, QueryClient } from '@tanstack/react-query';"
    },
    # DocketSheet.stories.tsx
    {
        "file": "src/components/stories/features/docket/DocketSheet.stories.tsx",
        "old": "import { BrowserRouter } from 'react-router-dom';\nimport { WindowProvider } from '@/contexts/WindowContext';",
        "new": "import { BrowserRouter } from 'react-router-dom';"
    },
    # DocumentExplorer.stories.tsx
    {
        "file": "src/components/stories/features/documents/DocumentExplorer.stories.tsx",
        "old": "import { ThemeProvider } from '@/features/theme/ThemeContext';\nimport { ToastProvider } from '@/contexts/ToastContext';\nimport { WindowProvider } from '@/contexts/WindowContext';",
        "new": "import { ThemeProvider } from '@/features/theme/ThemeContext';"
    },
    # DocumentManager.stories.tsx
    {
        "file": "src/components/stories/features/documents/DocumentManager.stories.tsx",
        "old": "import { AuthProvider } from '@/contexts/auth/AuthProvider';\nimport { ToastProvider } from '@/contexts/ToastContext';\nimport { WindowProvider } from '@/contexts/WindowContext';",
        "new": "import { AuthProvider } from '@/contexts/auth/AuthProvider';"
    },
    # DocumentToolbar.stories.tsx
    {
        "file": "src/components/stories/features/documents/DocumentToolbar.stories.tsx",
        "old": "import { AuthProvider } from '@/contexts/auth/AuthProvider';\nimport { WindowProvider } from '@/contexts/WindowContext';",
        "new": "import { AuthProvider } from '@/contexts/auth/AuthProvider';"
    },
    # DocketSheet.tsx - Remove useState import
    {
        "file": "src/features/cases/components/docket/DocketSheet.tsx",
        "old": "import React, { useEffect, useState } from 'react';",
        "new": "import React, { useEffect } from 'react';"
    },
    # DocketSheet.tsx - Remove Case import
    {
        "file": "src/features/cases/components/docket/DocketSheet.tsx",
        "old": "import { DocketEntry } from '@/types/docket';\nimport { Case } from '@/types';",
        "new": "import { DocketEntry } from '@/types/docket';"
    },
    # DocketSheet.tsx - Remove entryToDelete state
    {
        "file": "src/features/cases/components/docket/DocketSheet.tsx",
        "old": "  const [filterStatus, setFilterStatus] = React.useState<string>('all');\n  const [entryToDelete, setEntryToDelete] = React.useState<string | null>(null);",
        "new": "  const [filterStatus, setFilterStatus] = React.useState<string>('all');"
    },
    # CaseDetail.tsx - Prefix navigate with underscore
    {
        "file": "src/features/cases/components/list/CaseDetail.tsx",
        "old": "  const navigate = useNavigate();",
        "new": "  const _navigate = useNavigate();"
    },
    # SLAMonitor.tsx - Fix empty destructuring
    {
        "file": "src/features/cases/components/workflow/SLAMonitor.tsx",
        "old": "function SLAMonitor({}: SLAMonitorProps) {",
        "new": "function SLAMonitor(_props: SLAMonitorProps) {"
    },
    # EnhancedDashboardOverview.tsx - Remove unused import
    {
        "file": "src/features/dashboard/components/EnhancedDashboardOverview.tsx",
        "old": "import { QueryStatus, useQueryClient } from '@/services/queryClient';\nimport { dashboardMetricsService } from '@/services/domain/DashboardMetrics';",
        "new": "import { QueryStatus, useQueryClient } from '@/services/queryClient';"
    },
    # PDFViewer.tsx - Prefix unused vars
    {
        "file": "src/features/discovery/components/PDFViewer/PDFViewer.tsx",
        "old": "  const [pdfjsReady, setPdfjsReady] = useState(false);\n  const [pageNum, setPageNum] = useState(1);",
        "new": "  const [_pdfjsReady, setPdfjsReady] = useState(false);\n  const [pageNum] = useState(1);"
    },
    # DocumentList.tsx - Remove useState
    {
        "file": "src/features/documents/components/DocumentList.tsx",
        "old": "import React, { useState } from 'react';",
        "new": "import React from 'react';"
    },
    # useDocumentAnnotations.ts - Remove useCallback and prefix isLoading
    {
        "file": "src/features/documents/hooks/useDocumentAnnotations.ts",
        "old": "import { useState, useEffect, useCallback } from 'react';",
        "new": "import { useState, useEffect } from 'react';"
    },
    {
        "file": "src/features/documents/hooks/useDocumentAnnotations.ts",
        "old": "  const [isLoading, setIsLoading] = useState(true);",
        "new": "  const [_isLoading, setIsLoading] = useState(true);"
    },
    # ResearchTool.tsx - Remove Clause import
    {
        "file": "src/features/knowledge/research/ResearchTool.tsx",
        "old": "import { Case, CaseStatus, CaseId, Judge, JudgeId, Clause } from '@/types';",
        "new": "import { Case, CaseStatus, CaseId, Judge, JudgeId } from '@/types';"
    },
    # ResearchTool.tsx - Prefix selectedJudgeId
    {
        "file": "src/features/knowledge/research/ResearchTool.tsx",
        "old": "  const [selectedJudgeId, setSelectedJudgeId] = useState<JudgeId | null>(null);",
        "new": "  const [_selectedJudgeId, setSelectedJudgeId] = useState<JudgeId | null>(null);"
    },
    # BillingInvoices.tsx - Remove unused imports (keep only needed)
    {
        "file": "src/features/operations/billing/BillingInvoices.tsx",
        "old": "import { DataService } from '@/services/dataService';\nimport { useTheme } from '@/features/theme/ThemeContext';",
        "new": "import { useTheme } from '@/features/theme/ThemeContext';"
    },
    {
        "file": "src/features/operations/billing/BillingInvoices.tsx",
        "old": "} from '@/types';\nimport { billingQueryKeys } from '@/services/queryKeys';\nimport { InvoiceStatusEnum } from '@/types/enums';\nimport { useQuery, useMutation } from '@/services/queryClient';",
        "new": "} from '@/types';\nimport { useQuery, useMutation } from '@/services/queryClient';"
    },
    # audit/index.tsx - Prefix theme
    {
        "file": "src/routes/audit/index.tsx",
        "old": "  const { theme } = useTheme();",
        "new": "  const { theme: _theme } = useTheme();"
    },
    # login-enhanced.tsx - Prefix requiresMFA
    {
        "file": "src/routes/auth/login-enhanced.tsx",
        "old": "  const { login, loginWithSSO, requiresMFA } = useAuth();",
        "new": "  const { login, loginWithSSO, requiresMFA: _requiresMFA } = useAuth();"
    },
    # client-detail.tsx - Remove useTheme
    {
        "file": "src/routes/crm/client-detail.tsx",
        "old": "import { Building2, Phone, Mail, MapPin, Calendar, DollarSign, FileText, Users, TrendingUp, Activity } from 'lucide-react';\nimport { useTheme } from '@/features/theme/ThemeContext';",
        "new": "import { Building2, Phone, Mail, MapPin, Calendar, DollarSign, FileText, Users, TrendingUp, Activity } from 'lucide-react';"
    },
    # home.tsx - Remove useTheme
    {
        "file": "src/routes/home.tsx",
        "old": "import { useAuth } from '@/contexts/auth/AuthContext';\nimport { useTheme } from '@/features/theme/ThemeContext';",
        "new": "import { useAuth } from '@/contexts/auth/AuthContext';"
    },
    # war-room/detail.tsx - Remove useTheme
    {
        "file": "src/routes/war-room/detail.tsx",
        "old": "import { ArrowLeft, Users, Calendar, MapPin, Scale, FileText, Image, Video, Link as LinkIcon } from 'lucide-react';\nimport { useTheme } from '@/features/theme/ThemeContext';",
        "new": "import { ArrowLeft, Users, Calendar, MapPin, Scale, FileText, Image, Video, Link as LinkIcon } from 'lucide-react';"
    },
    # workflows/detail.tsx - Remove useTheme
    {
        "file": "src/routes/workflows/detail.tsx",
        "old": "import { ArrowLeft, Play, Pause, CheckCircle, Clock, User, Calendar, AlertCircle } from 'lucide-react';\nimport { useTheme } from '@/features/theme/ThemeContext';",
        "new": "import { ArrowLeft, Play, Pause, CheckCircle, Clock, User, Calendar, AlertCircle } from 'lucide-react';"
    },
    # Repository.ts - Remove unused constant
    {
        "file": "src/services/core/Repository.ts",
        "old": "import { LRUCache } from './LRUCache';\nimport { REPOSITORY_MAX_LISTENERS } from '@/config/constants';",
        "new": "import { LRUCache } from './LRUCache';"
    },
    # collaborationService.ts - Remove unused constant
    {
        "file": "src/services/infrastructure/collaborationService.ts",
        "old": "const COLLABORATION_HEARTBEAT_INTERVAL = 30000; // 30 seconds\nconst COLLABORATION_MAX_PENDING_EDITS = 50;\nconst COLLABORATION_RETRY_DELAY = 2000;",
        "new": "const COLLABORATION_HEARTBEAT_INTERVAL = 30000; // 30 seconds\nconst COLLABORATION_RETRY_DELAY = 2000;"
    },
    # tokens.ts - Prefix density
    {
        "file": "src/shared/theme/tokens.ts",
        "old": "export function getTokens(\n  tokenOverrides: Partial<DesignTokens> = {},\n  density: ThemeDensity = 'normal'\n): DesignTokens {",
        "new": "export function getTokens(\n  tokenOverrides: Partial<DesignTokens> = {},\n  _density: ThemeDensity = 'normal'\n): DesignTokens {"
    },
    # MetricCard.tsx - Prefix theme
    {
        "file": "src/shared/ui/molecules/MetricCard/MetricCard.tsx",
        "old": "  const { theme } = useTheme();",
        "new": "  const { theme: _theme } = useTheme();"
    },
    # EDiscoveryDashboard.tsx - Remove eslint-disable comment  
    {
        "file": "src/components/enterprise/Discovery/EDiscoveryDashboard.tsx",
        "old": "          </button>\n          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}\n        </div>",
        "new": "          </button>\n        </div>"
    },
    # GlobalCaseSelector.tsx - Remove eslint-disable comment
    {
        "file": "src/shared/ui/organisms/GlobalCaseSelector/GlobalCaseSelector.tsx",
        "old": "import { Case } from '@/types';\n// eslint-disable-next-line @typescript-eslint/no-unused-vars\nimport { DataService } from '@/services/dataService';",
        "new": "import { Case } from '@/types';\nimport { DataService } from '@/services/dataService';"
    },
]

def main():
    base_path = Path(__file__).parent
    success_count = 0
    fail_count = 0
    
    for fix in FIXES:
        file_path = base_path / fix["file"]
        if not file_path.exists():
            print(f"❌ File not found: {file_path}")
            fail_count += 1
            continue
            
        try:
            content = file_path.read_text(encoding='utf-8')
            if fix["old"] not in content:
                print(f"⚠️  Pattern not found in {fix['file']}")
                fail_count += 1
                continue
                
            new_content = content.replace(fix["old"], fix["new"])
            file_path.write_text(new_content, encoding='utf-8')
            print(f"✅ Fixed: {fix['file']}")
            success_count += 1
        except Exception as e:
            print(f"❌ Error processing {fix['file']}: {e}")
            fail_count += 1
    
    print(f"\n📊 Summary: {success_count} fixed, {fail_count} failed")
    return 0 if fail_count == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
