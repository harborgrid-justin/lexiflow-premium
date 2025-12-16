#!/bin/bash
# Import Path Update Script
# Automatically updates import paths after component reorganization
# LexiFlow Premium - Generated: December 12, 2025

set -e

WORKSPACE="/workspaces/lexiflow-premium"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to update imports for a specific component
update_imports() {
    local old_path="$1"
    local new_path="$2"
    local component_name="$3"
    
    print_status "Updating imports for: $component_name"
    print_status "  From: $old_path"
    print_status "  To:   $new_path"
    
    # Find all TypeScript/TSX files and update imports
    # Handles various import styles:
    # - from './components/Component'
    # - from '../components/Component'
    # - from '../../components/Component'
    # - from '@/components/Component'
    
    local count=0
    
    # Pattern 1: Direct component imports (from root)
    if grep -rl "from ['\"].*components/$old_path['\"]" "$WORKSPACE" \
        --include="*.tsx" --include="*.ts" \
        --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null; then
        
        find "$WORKSPACE" -type f \( -name "*.tsx" -o -name "*.ts" \) \
            -not -path "*/node_modules/*" \
            -not -path "*/.git/*" \
            -exec sed -i "s|from \(['\"].*\)components/$old_path\(['\"].*\)|from \1components/$new_path\2|g" {} \;
        
        count=$((count + 1))
    fi
    
    # Pattern 2: Relative imports
    if grep -rl "from ['\"]\\.\\./.*/$component_name['\"]" "$WORKSPACE" \
        --include="*.tsx" --include="*.ts" \
        --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null; then
        
        # This is more complex - requires per-file relative path calculation
        print_warning "  Found relative imports - manual review may be needed"
        count=$((count + 1))
    fi
    
    if [ $count -gt 0 ]; then
        print_success "  Updated imports for $component_name"
    else
        print_status "  No imports found for $component_name"
    fi
}

# Main import updates based on reorganization
main() {
    echo "=========================================="
    echo "Import Path Update Script"
    echo "LexiFlow Premium"
    echo "=========================================="
    echo ""
    
    print_warning "This script will modify import statements across your codebase."
    print_warning "Make sure you have committed your changes or have a backup!"
    echo ""
    
    read -p "Continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Aborted by user"
        exit 0
    fi
    
    print_status "Starting import path updates..."
    echo ""
    
    # Phase 1: Root components moved to subdirectories
    print_status "=== Updating Phase 1: Root to Subdirectory Moves ==="
    
    # Layout components
    update_imports "Sidebar" "layout/Sidebar" "Sidebar"
    
    # Dashboard
    update_imports "Dashboard" "dashboard/Dashboard" "Dashboard"
    
    # Feature modules
    update_imports "SecureMessenger" "messenger/SecureMessenger" "SecureMessenger"
    update_imports "EvidenceVault" "evidence/EvidenceVault" "EvidenceVault"
    update_imports "ResearchTool" "research/ResearchTool" "ResearchTool"
    update_imports "CalendarView" "calendar/CalendarView" "CalendarView"
    update_imports "WarRoom" "war-room/WarRoom" "WarRoom"
    update_imports "LitigationBuilder" "litigation/LitigationBuilder" "LitigationBuilder"
    update_imports "DocumentManager" "documents/DocumentManager" "DocumentManager"
    
    # Module registry components
    update_imports "BillingDashboard" "billing/BillingDashboard" "BillingDashboard"
    update_imports "ClientCRM" "crm/ClientCRM" "ClientCRM"
    update_imports "DocketManager" "docket/DocketManager" "DocketManager"
    update_imports "CorrespondenceManager" "correspondence/CorrespondenceManager" "CorrespondenceManager"
    update_imports "EntityDirector" "entities/EntityDirector" "EntityDirector"
    update_imports "JurisdictionManager" "jurisdiction/JurisdictionManager" "JurisdictionManager"
    update_imports "KnowledgeBase" "knowledge/KnowledgeBase" "KnowledgeBase"
    update_imports "MasterWorkflow" "workflow/MasterWorkflow" "MasterWorkflow"
    update_imports "PleadingBuilder" "pleading/PleadingBuilder" "PleadingBuilder"
    update_imports "RulesPlatform" "rules/RulesPlatform" "RulesPlatform"
    
    echo ""
    print_status "=== Updating Phase 2: Document Consolidation ==="
    
    # Document to documents moves
    update_imports "document/DocumentDragOverlay" "documents/DocumentDragOverlay" "DocumentDragOverlay"
    update_imports "document/DocumentFilters" "documents/DocumentFilters" "DocumentFilters"
    update_imports "document/DocumentRow" "documents/table/DocumentRow" "DocumentRow"
    update_imports "document/DocumentTable" "documents/table/DocumentTable" "DocumentTable"
    update_imports "document/DocumentToolbar" "documents/DocumentToolbar" "DocumentToolbar"
    update_imports "document/TagManagementModal" "documents/TagManagementModal" "TagManagementModal"
    update_imports "document/DocumentPreviewPanel" "documents/viewer/DocumentPreviewPanel" "DocumentPreviewPanel"
    
    echo ""
    print_status "=== Updating Modals and Misc Components ==="
    
    update_imports "ClientIntakeModal" "crm/ClientIntakeModal" "ClientIntakeModal"
    update_imports "ClientPortalModal" "crm/ClientPortalModal" "ClientPortalModal"
    update_imports "DocketImportModal" "docket/DocketImportModal" "DocketImportModal"
    update_imports "AdvancedEditor" "documents/AdvancedEditor" "AdvancedEditor"
    update_imports "DocumentVersions" "documents/DocumentVersions" "DocumentVersions"
    update_imports "DocumentAssembly" "documents/DocumentAssembly" "DocumentAssembly"
    update_imports "CitationManager" "citation/CitationManager" "CitationManager"
    update_imports "ClauseHistoryModal" "clauses/ClauseHistoryModal" "ClauseHistoryModal"
    update_imports "ClauseLibrary" "clauses/ClauseLibrary" "ClauseLibrary"
    
    echo ""
    print_success "=== Import path updates complete! ==="
    echo ""
    
    print_warning "IMPORTANT: Next steps:"
    echo "1. Manually update /config/modules.tsx with new import paths"
    echo "2. Run TypeScript compiler: npm run type-check"
    echo "3. Check for any remaining issues: npm run lint"
    echo "4. Search for broken imports:"
    echo "   grep -r \"from ['\\\"].*components/[^/]*tsx\" --include='*.tsx' --include='*.ts'"
    echo ""
    
    print_status "Checking for common import patterns that may need manual review..."
    echo ""
    
    # Check for potential issues
    print_status "Checking for imports from deleted root components..."
    grep -rn "from ['\"].*components/AdminPanel['\"]" "$WORKSPACE" \
        --include="*.tsx" --include="*.ts" \
        --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null || \
        print_success "No AdminPanel root imports found"
    
    grep -rn "from ['\"].*components/AnalyticsDashboard['\"]" "$WORKSPACE" \
        --include="*.tsx" --include="*.ts" \
        --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null || \
        print_success "No AnalyticsDashboard root imports found"
    
    grep -rn "from ['\"].*components/ComplianceDashboard['\"]" "$WORKSPACE" \
        --include="*.tsx" --include="*.ts" \
        --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null || \
        print_success "No ComplianceDashboard root imports found"
    
    echo ""
    print_status "Script complete. Review output above for any warnings or errors."
}

# Special function to update modules.tsx
update_modules_tsx() {
    local modules_file="$WORKSPACE/config/modules.tsx"
    
    if [ ! -f "$modules_file" ]; then
        print_error "modules.tsx not found at: $modules_file"
        return 1
    fi
    
    print_status "Updating $modules_file..."
    
    # Create backup
    cp "$modules_file" "${modules_file}.backup"
    
    # Update import paths
    sed -i "s|from '../components/Dashboard'|from '../components/dashboard/Dashboard'|g" "$modules_file"
    sed -i "s|from '../components/ExhibitManager'|from '../components/exhibits/ExhibitManager'|g" "$modules_file"
    sed -i "s|from '../components/DiscoveryPlatform'|from '../components/discovery/DiscoveryPlatform'|g" "$modules_file"
    sed -i "s|from '../components/FirmOperations'|from '../components/practice/FirmOperations'|g" "$modules_file"
    sed -i "s|from '../components/BillingDashboard'|from '../components/billing/BillingDashboard'|g" "$modules_file"
    sed -i "s|from '../components/ClientCRM'|from '../components/crm/ClientCRM'|g" "$modules_file"
    sed -i "s|from '../components/AnalyticsDashboard'|from '../components/analytics/AnalyticsDashboard'|g" "$modules_file"
    sed -i "s|from '../components/JurisdictionManager'|from '../components/jurisdiction/JurisdictionManager'|g" "$modules_file"
    sed -i "s|from '../components/CalendarView'|from '../components/calendar/CalendarView'|g" "$modules_file"
    sed -i "s|from '../components/RulesPlatform'|from '../components/rules/RulesPlatform'|g" "$modules_file"
    sed -i "s|from '../components/PleadingBuilder'|from '../components/pleading/PleadingBuilder'|g" "$modules_file"
    sed -i "s|from '../components/KnowledgeBase'|from '../components/knowledge/KnowledgeBase'|g" "$modules_file"
    sed -i "s|from '../components/LitigationBuilder'|from '../components/litigation/LitigationBuilder'|g" "$modules_file"
    sed -i "s|from '../components/DocketManager'|from '../components/docket/DocketManager'|g" "$modules_file"
    sed -i "s|from '../components/CorrespondenceManager'|from '../components/correspondence/CorrespondenceManager'|g" "$modules_file"
    sed -i "s|from '../components/MasterWorkflow'|from '../components/workflow/MasterWorkflow'|g" "$modules_file"
    sed -i "s|from '../components/DocumentManager'|from '../components/documents/DocumentManager'|g" "$modules_file"
    sed -i "s|from '../components/WarRoom'|from '../components/war-room/WarRoom'|g" "$modules_file"
    sed -i "s|from '../components/EvidenceVault'|from '../components/evidence/EvidenceVault'|g" "$modules_file"
    sed -i "s|from '../components/ResearchTool'|from '../components/research/ResearchTool'|g" "$modules_file"
    sed -i "s|from '../components/EntityDirector'|from '../components/entities/EntityDirector'|g" "$modules_file"
    sed -i "s|from '../components/ComplianceDashboard'|from '../components/compliance/ComplianceDashboard'|g" "$modules_file"
    sed -i "s|from '../components/SecureMessenger'|from '../components/messenger/SecureMessenger'|g" "$modules_file"
    
    print_success "Updated $modules_file"
    print_status "Backup saved to: ${modules_file}.backup"
}

# Special function to update App.tsx
update_app_tsx() {
    local app_file="$WORKSPACE/App.tsx"
    
    if [ ! -f "$app_file" ]; then
        print_error "App.tsx not found at: $app_file"
        return 1
    fi
    
    print_status "Updating $app_file..."
    
    # Create backup
    cp "$app_file" "${app_file}.backup"
    
    # Update Sidebar import
    sed -i "s|from './components/Sidebar'|from './components/layout/Sidebar'|g" "$app_file"
    
    print_success "Updated $app_file"
    print_status "Backup saved to: ${app_file}.backup"
}

# Parse command line arguments
if [ "$1" == "modules" ]; then
    update_modules_tsx
elif [ "$1" == "app" ]; then
    update_app_tsx
elif [ "$1" == "critical" ]; then
    print_status "Updating critical files only..."
    update_modules_tsx
    update_app_tsx
    print_success "Critical files updated!"
else
    main
fi
