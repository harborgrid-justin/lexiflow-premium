#!/bin/bash
# Component Directory Reorganization Script
# LexiFlow Premium - Phase-by-Phase Implementation
# Generated: December 12, 2025

set -e  # Exit on error

WORKSPACE="/workspaces/lexiflow-premium"
COMPONENTS="$WORKSPACE/components"
BACKUP_DIR="$WORKSPACE/backup-components-$(date +%Y%m%d-%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to create backup
create_backup() {
    print_status "Creating backup of components directory..."
    mkdir -p "$BACKUP_DIR"
    cp -r "$COMPONENTS" "$BACKUP_DIR/"
    print_success "Backup created at: $BACKUP_DIR"
}

# Function to restore backup
restore_backup() {
    print_warning "Restoring from backup..."
    rm -rf "$COMPONENTS"
    cp -r "$BACKUP_DIR/components" "$COMPONENTS"
    print_success "Backup restored"
}

# Phase 1: Remove Duplicates
phase1_remove_duplicates() {
    print_status "=== PHASE 1: REMOVING DUPLICATE FILES ==="
    
    # Step 1.1: Delete root-level duplicates
    print_status "Step 1.1: Deleting root-level duplicate files..."
    
    local root_duplicates=(
        "AdminPanel.tsx"
        "AnalyticsDashboard.tsx"
        "App.tsx"
        "CaseDetail.tsx"
        "CaseList.tsx"
        "ComplianceDashboard.tsx"
        "ExhibitManager.tsx"
        "FirmOperations.tsx"
        "PleadingDashboard.tsx"
        "TimeEntryModal.tsx"
    )
    
    for file in "${root_duplicates[@]}"; do
        if [ -f "$COMPONENTS/$file" ]; then
            rm "$COMPONENTS/$file"
            print_success "Deleted: $COMPONENTS/$file"
        else
            print_warning "Not found: $COMPONENTS/$file"
        fi
    done
    
    # Step 1.2: Consolidate nested duplicate directories
    print_status "Step 1.2: Consolidating nested duplicate directories..."
    
    # case-detail/case-detail/
    if [ -d "$COMPONENTS/case-detail/case-detail" ]; then
        if [ -f "$COMPONENTS/case-detail/case-detail/CaseDetail.tsx" ]; then
            mv "$COMPONENTS/case-detail/case-detail/CaseDetail.tsx" "$COMPONENTS/case-detail/" 2>/dev/null || true
        fi
        if [ -f "$COMPONENTS/case-detail/case-detail/CaseDetailContent.tsx" ]; then
            mv "$COMPONENTS/case-detail/case-detail/CaseDetailContent.tsx" "$COMPONENTS/case-detail/" 2>/dev/null || true
        fi
        rm -rf "$COMPONENTS/case-detail/case-detail"
        print_success "Consolidated case-detail/case-detail/"
    fi
    
    # case-list/case-list/
    if [ -d "$COMPONENTS/case-list/case-list" ]; then
        if [ -f "$COMPONENTS/case-list/case-list/CaseList.tsx" ]; then
            mv "$COMPONENTS/case-list/case-list/CaseList.tsx" "$COMPONENTS/case-list/" 2>/dev/null || true
        fi
        if [ -f "$COMPONENTS/case-list/case-list/CaseListContent.tsx" ]; then
            mv "$COMPONENTS/case-list/case-list/CaseListContent.tsx" "$COMPONENTS/case-list/" 2>/dev/null || true
        fi
        rm -rf "$COMPONENTS/case-list/case-list"
        print_success "Consolidated case-list/case-list/"
    fi
    
    # analytics/analytics/
    if [ -d "$COMPONENTS/analytics/analytics" ]; then
        if [ -f "$COMPONENTS/analytics/analytics/AnalyticsDashboardContent.tsx" ]; then
            mv "$COMPONENTS/analytics/analytics/AnalyticsDashboardContent.tsx" "$COMPONENTS/analytics/" 2>/dev/null || true
        fi
        rm -rf "$COMPONENTS/analytics/analytics"
        print_success "Consolidated analytics/analytics/"
    fi
    
    # Step 1.3: Consolidate within-module duplicates
    print_status "Step 1.3: Consolidating within-module duplicates..."
    
    # Admin module
    local admin_duplicates=(
        "admin/AdminDataRegistry.tsx"
        "admin/AdminDatabaseControl.tsx"
        "admin/AdminHierarchy.tsx"
        "admin/AdminIntegrations.tsx"
        "admin/AdminPlatformManager.tsx"
        "admin/data/SchemaArchitect.tsx"
    )
    
    for file in "${admin_duplicates[@]}"; do
        if [ -f "$COMPONENTS/$file" ]; then
            rm "$COMPONENTS/$file"
            print_success "Deleted: $COMPONENTS/$file"
        fi
    done
    
    # Case detail module
    local case_detail_duplicates=(
        "case-detail/CaseCollaboration.tsx"
        "case-detail/CaseMotions.tsx"
        "case-detail/CaseOverview.tsx"
        "case-detail/CaseProjects.tsx"
        "case-detail/evidence/EvidenceChainOfCustody.tsx"
        "case-detail/evidence/EvidenceIntake.tsx"
        "case-detail/collaboration/EvidenceChainOfCustody.tsx"
    )
    
    for file in "${case_detail_duplicates[@]}"; do
        if [ -f "$COMPONENTS/$file" ]; then
            rm "$COMPONENTS/$file"
            print_success "Deleted: $COMPONENTS/$file"
        fi
    done
    
    # Discovery
    [ -f "$COMPONENTS/discovery/DiscoveryDashboard.tsx" ] && rm "$COMPONENTS/discovery/DiscoveryDashboard.tsx"
    [ -f "$COMPONENTS/DiscoveryPlatform.tsx" ] && rm "$COMPONENTS/DiscoveryPlatform.tsx"
    
    # Pleading - remove old directory structure
    [ -d "$COMPONENTS/pleading/Canvas" ] && rm -rf "$COMPONENTS/pleading/Canvas"
    [ -d "$COMPONENTS/pleading/Sidebar" ] && rm -rf "$COMPONENTS/pleading/Sidebar"
    [ -d "$COMPONENTS/pleading/Tools" ] && rm -rf "$COMPONENTS/pleading/Tools"
    [ -d "$COMPONENTS/pleading/Visual" ] && rm -rf "$COMPONENTS/pleading/Visual"
    print_success "Removed old pleading directory structures"
    
    # Practice
    [ -f "$COMPONENTS/practice/HRManager.tsx" ] && rm "$COMPONENTS/practice/HRManager.tsx"
    
    # Other duplicates
    [ -f "$COMPONENTS/jurisdiction/LocalRulesMap.tsx" ] && rm "$COMPONENTS/jurisdiction/LocalRulesMap.tsx"
    [ -f "$COMPONENTS/discovery/StandingOrders.tsx" ] && rm "$COMPONENTS/discovery/StandingOrders.tsx"
    [ -f "$COMPONENTS/layout/SidebarNav.tsx" ] && rm "$COMPONENTS/layout/SidebarNav.tsx"
    
    print_success "=== PHASE 1 COMPLETE ==="
}

# Phase 2: Consolidate document/documents
phase2_consolidate_documents() {
    print_status "=== PHASE 2: CONSOLIDATING DOCUMENT(S) DIRECTORIES ==="
    
    # Create unified structure
    mkdir -p "$COMPONENTS/documents/table"
    mkdir -p "$COMPONENTS/documents/viewer"
    
    # Move document/ contents to documents/
    if [ -d "$COMPONENTS/document" ]; then
        # Move files
        [ -f "$COMPONENTS/document/DocumentDragOverlay.tsx" ] && \
            mv "$COMPONENTS/document/DocumentDragOverlay.tsx" "$COMPONENTS/documents/"
        
        [ -f "$COMPONENTS/document/DocumentFilters.tsx" ] && \
            mv "$COMPONENTS/document/DocumentFilters.tsx" "$COMPONENTS/documents/"
        
        [ -f "$COMPONENTS/document/DocumentRow.tsx" ] && \
            mv "$COMPONENTS/document/DocumentRow.tsx" "$COMPONENTS/documents/table/"
        
        [ -f "$COMPONENTS/document/DocumentTable.tsx" ] && \
            mv "$COMPONENTS/document/DocumentTable.tsx" "$COMPONENTS/documents/table/"
        
        [ -f "$COMPONENTS/document/DocumentToolbar.tsx" ] && \
            mv "$COMPONENTS/document/DocumentToolbar.tsx" "$COMPONENTS/documents/"
        
        [ -f "$COMPONENTS/document/TagManagementModal.tsx" ] && \
            mv "$COMPONENTS/document/TagManagementModal.tsx" "$COMPONENTS/documents/"
        
        [ -f "$COMPONENTS/document/DocumentPreviewPanel.tsx" ] && \
            mv "$COMPONENTS/document/DocumentPreviewPanel.tsx" "$COMPONENTS/documents/viewer/"
        
        # Move preview directory
        if [ -d "$COMPONENTS/document/preview" ]; then
            cp -r "$COMPONENTS/document/preview" "$COMPONENTS/documents/"
            print_success "Moved preview directory"
        fi
        
        # Remove old document/ directory
        rm -rf "$COMPONENTS/document"
        print_success "Removed old document/ directory"
    fi
    
    # Remove duplicate DocumentExplorer from document/
    # (Already handled by removing document/ directory)
    
    print_success "=== PHASE 2 COMPLETE ==="
}

# Phase 3: Move root components
phase3_move_root_components() {
    print_status "=== PHASE 3: MOVING ROOT COMPONENTS TO PROPER LOCATIONS ==="
    
    # Step 3.1: Move core layout components
    print_status "Step 3.1: Moving core layout components..."
    [ -f "$COMPONENTS/Sidebar.tsx" ] && \
        mv "$COMPONENTS/Sidebar.tsx" "$COMPONENTS/layout/" && \
        print_success "Moved Sidebar.tsx to layout/"
    
    # Step 3.2: Move feature module main components
    print_status "Step 3.2: Moving feature module main components..."
    
    declare -A component_moves=(
        ["Dashboard.tsx"]="dashboard/"
        ["SecureMessenger.tsx"]="messenger/"
        ["EvidenceVault.tsx"]="evidence/"
        ["ResearchTool.tsx"]="research/"
        ["CalendarView.tsx"]="calendar/"
        ["WarRoom.tsx"]="war-room/"
        ["LitigationBuilder.tsx"]="litigation/"
        ["DocumentManager.tsx"]="documents/"
    )
    
    for component in "${!component_moves[@]}"; do
        dest="${component_moves[$component]}"
        if [ -f "$COMPONENTS/$component" ]; then
            mkdir -p "$COMPONENTS/$dest"
            mv "$COMPONENTS/$component" "$COMPONENTS/$dest"
            print_success "Moved $component to $dest"
        else
            print_warning "Not found: $component"
        fi
    done
    
    # Step 3.3: Move module registry components
    print_status "Step 3.3: Moving module registry components..."
    
    declare -A module_moves=(
        ["BillingDashboard.tsx"]="billing/"
        ["ClientCRM.tsx"]="crm/"
        ["DocketManager.tsx"]="docket/"
        ["CorrespondenceManager.tsx"]="correspondence/"
        ["EntityDirector.tsx"]="entities/"
        ["JurisdictionManager.tsx"]="jurisdiction/"
        ["KnowledgeBase.tsx"]="knowledge/"
        ["MasterWorkflow.tsx"]="workflow/"
        ["PleadingBuilder.tsx"]="pleading/"
        ["RulesPlatform.tsx"]="rules/"
    )
    
    for component in "${!module_moves[@]}"; do
        dest="${module_moves[$component]}"
        if [ -f "$COMPONENTS/$component" ]; then
            mkdir -p "$COMPONENTS/$dest"
            mv "$COMPONENTS/$component" "$COMPONENTS/$dest"
            print_success "Moved $component to $dest"
        else
            print_warning "Not found: $component"
        fi
    done
    
    # Step 3.4: Move feature-specific modals
    print_status "Step 3.4: Moving feature-specific modals..."
    
    [ -f "$COMPONENTS/ClientIntakeModal.tsx" ] && \
        mv "$COMPONENTS/ClientIntakeModal.tsx" "$COMPONENTS/crm/" && \
        print_success "Moved ClientIntakeModal.tsx to crm/"
    
    [ -f "$COMPONENTS/ClientPortalModal.tsx" ] && \
        mv "$COMPONENTS/ClientPortalModal.tsx" "$COMPONENTS/crm/" && \
        print_success "Moved ClientPortalModal.tsx to crm/"
    
    [ -f "$COMPONENTS/DocketImportModal.tsx" ] && \
        mv "$COMPONENTS/DocketImportModal.tsx" "$COMPONENTS/docket/" && \
        print_success "Moved DocketImportModal.tsx to docket/"
    
    # Move document-related components
    [ -f "$COMPONENTS/AdvancedEditor.tsx" ] && \
        mv "$COMPONENTS/AdvancedEditor.tsx" "$COMPONENTS/documents/"
    
    [ -f "$COMPONENTS/DocumentVersions.tsx" ] && \
        mv "$COMPONENTS/DocumentVersions.tsx" "$COMPONENTS/documents/"
    
    [ -f "$COMPONENTS/DocumentAssembly.tsx" ] && \
        mv "$COMPONENTS/DocumentAssembly.tsx" "$COMPONENTS/documents/"
    
    print_success "Moved document-related components"
    
    # Move citation components
    [ -f "$COMPONENTS/CitationManager.tsx" ] && \
        mv "$COMPONENTS/CitationManager.tsx" "$COMPONENTS/citation/" && \
        print_success "Moved CitationManager.tsx to citation/"
    
    # Move clause components
    [ -f "$COMPONENTS/ClauseHistoryModal.tsx" ] && \
        mv "$COMPONENTS/ClauseHistoryModal.tsx" "$COMPONENTS/clauses/"
    
    [ -f "$COMPONENTS/ClauseLibrary.tsx" ] && \
        mv "$COMPONENTS/ClauseLibrary.tsx" "$COMPONENTS/clauses/"
    
    print_success "Moved clause components"
    
    print_success "=== PHASE 3 COMPLETE ==="
}

# Phase 4: Fix naming inconsistencies
phase4_fix_naming() {
    print_status "=== PHASE 4: FIXING NAMING INCONSISTENCIES ==="
    
    # Note: Renaming directories in Git can be tricky
    # This only works if directories still exist with old capitalization
    
    if [ -d "$COMPONENTS/pleading/Canvas" ]; then
        mv "$COMPONENTS/pleading/Canvas" "$COMPONENTS/pleading/canvas_temp"
        mv "$COMPONENTS/pleading/canvas_temp" "$COMPONENTS/pleading/canvas"
        print_success "Renamed pleading/Canvas to pleading/canvas"
    fi
    
    if [ -d "$COMPONENTS/pleading/Editor" ]; then
        mv "$COMPONENTS/pleading/Editor" "$COMPONENTS/pleading/editor_temp"
        mv "$COMPONENTS/pleading/editor_temp" "$COMPONENTS/pleading/editor"
        print_success "Renamed pleading/Editor to pleading/editor"
    fi
    
    if [ -d "$COMPONENTS/pleading/Sidebar" ]; then
        mv "$COMPONENTS/pleading/Sidebar" "$COMPONENTS/pleading/sidebar_temp"
        mv "$COMPONENTS/pleading/sidebar_temp" "$COMPONENTS/pleading/sidebar"
        print_success "Renamed pleading/Sidebar to pleading/sidebar"
    fi
    
    if [ -d "$COMPONENTS/pleading/Tools" ]; then
        mv "$COMPONENTS/pleading/Tools" "$COMPONENTS/pleading/tools_temp"
        mv "$COMPONENTS/pleading/tools_temp" "$COMPONENTS/pleading/tools"
        print_success "Renamed pleading/Tools to pleading/tools"
    fi
    
    if [ -d "$COMPONENTS/pleading/Visual" ]; then
        mv "$COMPONENTS/pleading/Visual" "$COMPONENTS/pleading/visual_temp"
        mv "$COMPONENTS/pleading/visual_temp" "$COMPONENTS/pleading/visual"
        print_success "Renamed pleading/Visual to pleading/visual"
    fi
    
    print_success "=== PHASE 4 COMPLETE ==="
}

# Phase 5: Verification
phase5_verify() {
    print_status "=== PHASE 5: VERIFICATION ==="
    
    print_status "Checking for remaining root-level components..."
    root_count=$(find "$COMPONENTS" -maxdepth 1 -type f \( -name "*.tsx" -o -name "*.ts" \) | wc -l)
    print_status "Root-level files remaining: $root_count (should be 0 or minimal)"
    
    print_status "Checking for duplicate filenames..."
    duplicates=$(find "$COMPONENTS" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec basename {} \; | sort | uniq -d)
    if [ -z "$duplicates" ]; then
        print_success "No duplicate filenames found!"
    else
        print_warning "Duplicates still exist:"
        echo "$duplicates"
    fi
    
    print_status "Total component files:"
    find "$COMPONENTS" -type f \( -name "*.tsx" -o -name "*.ts" \) | wc -l
    
    print_status "Files by directory:"
    for dir in "$COMPONENTS"/*/; do
        count=$(find "$dir" -type f \( -name "*.tsx" -o -name "*.ts" \) | wc -l)
        echo "  $(basename "$dir"): $count files"
    done
    
    print_success "=== PHASE 5 COMPLETE ==="
}

# Main execution
main() {
    echo "=========================================="
    echo "Component Directory Reorganization Script"
    echo "LexiFlow Premium"
    echo "=========================================="
    echo ""
    
    # Check if in correct directory
    if [ ! -d "$COMPONENTS" ]; then
        print_error "Components directory not found at: $COMPONENTS"
        print_error "Please run this script from the project root or update WORKSPACE variable"
        exit 1
    fi
    
    # Parse command line arguments
    PHASE="$1"
    
    if [ -z "$PHASE" ]; then
        echo "Usage: $0 <phase|all> [--no-backup]"
        echo ""
        echo "Phases:"
        echo "  1        - Remove duplicates"
        echo "  2        - Consolidate document(s) directories"
        echo "  3        - Move root components"
        echo "  4        - Fix naming inconsistencies"
        echo "  5        - Verification"
        echo "  all      - Run all phases sequentially"
        echo "  backup   - Create backup only"
        echo "  restore  - Restore from latest backup"
        echo ""
        echo "Options:"
        echo "  --no-backup  - Skip backup creation (not recommended)"
        echo ""
        exit 1
    fi
    
    # Check for no-backup flag
    NO_BACKUP=false
    if [ "$2" == "--no-backup" ]; then
        NO_BACKUP=true
        print_warning "Running without backup!"
    fi
    
    # Create backup unless disabled
    if [ "$PHASE" != "restore" ] && [ "$PHASE" != "backup" ] && [ "$NO_BACKUP" = false ]; then
        create_backup
        echo ""
    fi
    
    # Execute requested phase(s)
    case "$PHASE" in
        1)
            phase1_remove_duplicates
            ;;
        2)
            phase2_consolidate_documents
            ;;
        3)
            phase3_move_root_components
            ;;
        4)
            phase4_fix_naming
            ;;
        5)
            phase5_verify
            ;;
        all)
            phase1_remove_duplicates
            echo ""
            phase2_consolidate_documents
            echo ""
            phase3_move_root_components
            echo ""
            phase4_fix_naming
            echo ""
            phase5_verify
            ;;
        backup)
            # Backup already created above
            ;;
        restore)
            if [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
                print_error "No backup found at: $BACKUP_DIR"
                print_error "Please specify backup directory or create new backup first"
                exit 1
            fi
            restore_backup
            ;;
        *)
            print_error "Unknown phase: $PHASE"
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Script execution complete!"
    
    if [ "$PHASE" != "restore" ] && [ "$PHASE" != "backup" ]; then
        echo ""
        print_warning "IMPORTANT NEXT STEPS:"
        echo "1. Update import paths in /config/modules.tsx"
        echo "2. Run: npm run type-check"
        echo "3. Search for broken imports: grep -r 'from.*components/' --include='*.tsx' --include='*.ts'"
        echo "4. Run tests: npm test"
        echo "5. Manual verification of each module"
        echo ""
        print_status "Backup location: $BACKUP_DIR"
        print_status "To restore: $0 restore"
    fi
}

# Run main function
main "$@"
