import { useState } from 'react';
import type { LegalDocument } from '@/types/documents';

interface UseDocumentViewerProps {
    document: LegalDocument;
    showAnnotations?: boolean;
    onAddAnnotation?: (annotation: { page: number; text: string; x: number; y: number }) => void;
}

export function useDocumentViewer({ document, showAnnotations, onAddAnnotation }: UseDocumentViewerProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [zoom, setZoom] = useState(100);
    const totalPages = document.pageCount || 1;

    const handleAnnotationAdd = () => {
        if (onAddAnnotation && showAnnotations) {
            onAddAnnotation({
                page: currentPage,
                text: 'New annotation',
                x: 100,
                y: 100
            });
        }
    };

    const zoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
    const zoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
    const setPage = (page: number) => setCurrentPage(Math.min(Math.max(1, page), totalPages));
    const nextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
    const prevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));

    return {
        currentPage,
        zoom,
        totalPages,
        handleAnnotationAdd,
        zoomIn,
        zoomOut,
        setPage,
        nextPage,
        prevPage,
        setCurrentPage
    };
}
