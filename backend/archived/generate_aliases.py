
import json
import os

modules = [
    "ai-dataops", "ai-ops", "analytics-dashboard", "api-keys", "api-security", "audit", 
    "authorization", "backup-restore", "backups", "bluebook", "calendar", "case-phases", 
    "citations", "clauses", "clients", "compliance", "docket", "document-versions", 
    "drafting", "etl-pipelines", "exhibits", "file-storage", "health", "hr", "judges", 
    "jurisdictions", "knowledge", "legal-entities", "matters", "messenger", "metrics", 
    "migrations", "motions", "notifications", "ocr", "parties", "pipelines", "pleadings", 
    "processing-jobs", "production", "projects", "query-workbench", "queues", "reports", 
    "risks", "schema-management", "scripts", "search", "sync", "telemetry", "test-utils", 
    "trial", "versioning", "war-room", "webhooks", "workflow"
]

tsconfig_paths = {}
jest_mapper = {}

for module in modules:
    tsconfig_paths[f"@{module}"] = [f"src/{module}"]
    tsconfig_paths[f"@{module}/*"] = [f"src/{module}/*"]
    
    jest_mapper[f"^@{module}/(.*)$"] = f"<rootDir>/{module}/$1"
    jest_mapper[f"^@{module}$"] = f"<rootDir>/{module}"

print("TSCONFIG PATHS:")
print(json.dumps(tsconfig_paths, indent=2))
print("\nJEST MAPPER:")
print(json.dumps(jest_mapper, indent=2))
