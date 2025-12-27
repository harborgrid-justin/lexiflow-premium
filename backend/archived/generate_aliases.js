
const modules = [
    "ai-dataops", "ai-ops", "analytics-dashboard", "api-keys", "api-security", "audit", 
    "authorization", "backup-restore", "backups", "bluebook", "calendar", "case-phases", 
    "citations", "clauses", "clients", "compliance", "docket", "document-versions", 
    "drafting", "etl-pipelines", "exhibits", "file-storage", "health", "hr", "judges", 
    "jurisdictions", "knowledge", "legal-entities", "matters", "messenger", "metrics", 
    "migrations", "motions", "notifications", "ocr", "parties", "pipelines", "pleadings", 
    "processing-jobs", "production", "projects", "query-workbench", "queues", "reports", 
    "risks", "schema-management", "scripts", "search", "sync", "telemetry", "test-utils", 
    "trial", "versioning", "war-room", "webhooks", "workflow"
];

const tsconfigPaths = {};
const jestMapper = {};

modules.forEach(module => {
    tsconfigPaths[`@${module}`] = [`src/${module}`];
    tsconfigPaths[`@${module}/*`] = [`src/${module}/*`];
    
    jestMapper[`^@${module}/(.*)$`] = `<rootDir>/${module}/$1`;
    jestMapper[`^@${module}$`] = `<rootDir>/${module}`;
});

console.log("TSCONFIG PATHS:");
console.log(JSON.stringify(tsconfigPaths, null, 2));
console.log("\nJEST MAPPER:");
console.log(JSON.stringify(jestMapper, null, 2));
