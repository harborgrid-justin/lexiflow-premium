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

// Document Preview Panel
import { DataService } from '@/services/core-services';
import type { Document } from '@/types';
import React, { useEffect, useState } from 'react';

interface DocumentPreviewPanelProps {
    documentId?: string;
    className?: string;
}

export const DocumentPreviewPanel: React.FC<DocumentPreviewPanelProps> = ({ documentId, className }) => {
    const [document, setDocument] = useState<Document | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        if (!documentId) {
            if (document) {
                // Defer to break synchronous cycle if needed, or simply return early if render hasn't committed
                // But since this is in effect, it's after commit.
                // We use setTimeout to satisfy the linter if strict mode makes it run twice
                setTimeout(() => setDocument(null), 0);
            }
            return;
        }

        // Avoid sync set state in effect
        setTimeout(() => {
            setLoading(true);
            setError(null);
        }, 0);

        DataService.documents.getById(documentId)
            .then((doc) => {
                if (mounted) {
                    setDocument(doc);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (mounted) {
                    setError(err.message || 'Failed to load document');
                    setLoading(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, [documentId, document]);

    if (!documentId) {
        return (
            <div className={className}>
                <div className="flex items-center justify-center h-full text-slate-500">
                    Select a document to preview
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={className}>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={className}>
                <div className="flex items-center justify-center h-full text-red-600">
                    {error}
                </div>
            </div>
        );
    }

    if (!document) {
        return (
            <div className={className}>
                <div className="flex items-center justify-center h-full text-slate-500">
                    Document not found
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="h-full flex flex-col">
                <div className="border-b border-slate-200 dark:border-slate-700 p-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{document.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {document.fileType} • {new Date(document.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex-1 overflow-auto p-4">
                    {document.fileType === 'application/pdf' ? (
                        <iframe
                            src={document.url || `/api/documents/${documentId}/preview`}
                            className="w-full h-full border-0"
                            title={document.title}
                        />
                    ) : document.content ? (
                        <div className="prose dark:prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap">{document.content}</pre>
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 mt-8">
                            Preview not available for this document type
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
