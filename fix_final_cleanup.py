
import os
import re

def fix_exhibit_table():
    path = "frontend/src/features/litigation/exhibits/ExhibitTable.tsx"
    if os.path.exists(path):
        with open(path, "r") as f:
            content = f.read()

        # Add onViewHistory prop
        content = content.replace(
            "document={{ id: ex.id } as any}",
            "document={{ id: ex.id } as any} onViewHistory={() => {}}"
        )

        with open(path, "w") as f:
            f.write(content)

def fix_evidence_wall():
    path = "frontend/src/features/litigation/war-room/EvidenceWall.tsx"
    if os.path.exists(path):
        with open(path, "r") as f:
            content = f.read()

        # Remove className prop or wrapper
        content = content.replace('className="h-full"', '')
        # Also need onViewHistory
        content = content.replace(
            "document={{ id: item.id } as any}",
            "document={{ id: item.id } as any} onViewHistory={() => {}}"
        )

        with open(path, "w") as f:
            f.write(content)

def fix_business_development():
    path = "frontend/src/components/enterprise/CRM/BusinessDevelopment.tsx"
    if os.path.exists(path):
        with open(path, "r") as f:
            content = f.read()

        # Uncomment state
        content = content.replace("// const [selectedLead, setSelectedLead]", "const [selectedLead, setSelectedLead]")

        with open(path, "w") as f:
            f.write(content)

def fix_risk_api():
    path = "frontend/src/api/workflow/risk-assessments-api.ts"
    if os.path.exists(path):
        with open(path, "r") as f:
            content = f.read()

        content = content.replace("as any[];", "as any as Risk[];")

        with open(path, "w") as f:
            f.write(content)

def fix_citation_manager_final():
    path = "frontend/src/components/enterprise/Research/CitationManager.tsx"
    if os.path.exists(path):
        with open(path, "r") as f:
            content = f.read()

        # Warning/Success toast
        target = "type: errorCount > 0 ? 'warning' : 'success'"
        replacement = "type: errorCount > 0 ? 'warning' : 'success' as any, priority: 'normal' as any, read: false"
        content = content.replace(target, replacement)

        with open(path, "w") as f:
            f.write(content)

def fix_master_workflow():
    path = "frontend/src/features/cases/components/workflow/MasterWorkflow.tsx"
    if os.path.exists(path):
        with open(path, "r") as f:
            content = f.read()

        content = content.replace("t.trigger as Record<string, string>", "t.trigger as any")
        content = content.replace("t.tasks", "(t as any).tasks")
        content = content.replace("t.owner", "(t as any).owner")

        with open(path, "w") as f:
            f.write(content)

if __name__ == "__main__":
    fix_exhibit_table()
    fix_evidence_wall()
    fix_business_development()
    fix_risk_api()
    fix_citation_manager_final()
    fix_master_workflow()
