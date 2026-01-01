// operations/index.ts - Barrel exports for Operations

// Document Management
export * from './documents';

// Billing & Finance
export * from './billing';

// Compliance
export * from './compliance';

// Correspondence
export * from './correspondence';

// Messaging
export * from './messenger';

// CRM & Client Management
export * from './crm';

// Document Assembly & Automation
export * from './daf';

// Stub components (temporary)
import React from 'react';
export const DocumentPreviewPanel: React.FC<{ documentId?: string; className?: string }> = ({ className }) => {
    return <div className={className}>Document Preview (stub)</div>;
};
