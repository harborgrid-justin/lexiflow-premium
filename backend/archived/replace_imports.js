
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const modules = [
    "ai-dataops", "ai-ops", "analytics-dashboard", "api-keys", "api-security", "audit", 
    "authorization", "backup-restore", "backups", "bluebook", "calendar", "case-phases", 
    "citations", "clauses", "clients", "compliance", "docket", "document-versions", 
    "drafting", "etl-pipelines", "exhibits", "file-storage", "health", "hr", "judges", 
    "jurisdictions", "knowledge", "legal-entities", "matters", "messenger", "metrics", 
    "migrations", "motions", "notifications", "ocr", "parties", "pipelines", "pleadings", 
    "processing-jobs", "production", "projects", "query-workbench", "queues", "reports", 
    "risks", "schema-management", "scripts", "search", "sync", "telemetry", "test-utils", 
    "trial", "versioning", "war-room", "webhooks", "workflow",
    // Existing modules
    "shared", "auth", "security", "common", "config", "database", "errors", "monitoring",
    "performance", "users", "cases", "documents", "discovery", "evidence", "billing",
    "analytics", "communications", "integrations", "graphql", "realtime", "types",
    "shared-types", "case-teams", "tasks", "organizations"
];

function walk(dir, callback) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if (stats.isDirectory()) {
            walk(filepath, callback);
        } else if (stats.isFile() && file.endsWith('.ts')) {
            callback(filepath);
        }
    });
}

function replaceImports(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    let changed = false;

    // Regex to find import paths
    const importRegex = /from ['"](\.\.\/.*?)['"]/g;
    
    content = content.replace(importRegex, (match, importPath) => {
        // Resolve the absolute path of the import
        const absolutePath = path.resolve(path.dirname(filepath), importPath);
        
        // Check if the absolute path starts with srcDir
        if (absolutePath.startsWith(srcDir)) {
            // Get the relative path from srcDir
            const relativeFromSrc = path.relative(srcDir, absolutePath).replace(/\\/g, '/');
            
            // Check if the first part of the relative path matches a module
            const firstPart = relativeFromSrc.split('/')[0];
            if (modules.includes(firstPart)) {
                changed = true;
                return `from '@${relativeFromSrc}'`;
            }
        }
        return match;
    });

    if (changed) {
        console.log(`Updating ${filepath}`);
        fs.writeFileSync(filepath, content, 'utf8');
    }
}

walk(srcDir, replaceImports);
