// components/knowledge/index.ts

// Base Module
export * from './base/KnowledgeAnalytics';
export * from './base/KnowledgeBase';
export * from './base/KnowledgeContent';
export * from './base/PrecedentsView';
export * from './base/QAView';
export * from './base/WikiView';

// Research Module
export * from './research';

// Citation Module
export * from './citation';

// Clauses Module
export * from './clauses';

// Rules Module
export * from './rules';

// Practice Module
export * from './practice';

// Jurisdiction Module
export * from './jurisdiction';

// Stub components (temporary)
import React from 'react';
export const OperatingLedger: React.FC<{ className?: string }> = ({ className }) => <div className={className}>Operating Ledger (stub)</div>;
export const TrustLedger: React.FC<{ className?: string }> = ({ className }) => <div className={className}>Trust Ledger (stub)</div>;
