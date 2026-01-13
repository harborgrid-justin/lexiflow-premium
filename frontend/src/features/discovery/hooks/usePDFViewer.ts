import { useState, useEffect, useRef } from 'react';

// Dynamic import for pdfjs-dist
type PDFJSType = typeof import('pdfjs-dist');
let pdfjsLib: PDFJSType | null = null;

const initializePDFJS = async () => {
    if (pdfjsLib) return pdfjsLib;

    try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
        pdfjsLib = pdfjs;
        return pdfjs;
    } catch (error) {
        console.error('Failed to load PDF.js:', error);
        throw error;
    }
};

interface PDFDocumentProxy {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getPage(pageNumber: number): Promise<any>;
    numPages: number;
    destroy(): void;
}

interface PDFLoadingTask {
    promise: Promise<PDFDocumentProxy>;
    destroy(): void;
}

export function usePDFViewer(url: string | null) {
    const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pdfjsReady, setPdfjsReady] = useState(false);
    
    // Refs
    const loadingTaskRef = useRef<PDFLoadingTask | null>(null);
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // Initialize PDF.js
    useEffect(() => {
        const init = async () => {
            try {
                await initializePDFJS();
                if (isMounted.current) {
                    setPdfjsReady(true);
                }
            } catch (err) {
                console.error('Failed to initialize PDF.js:', err);
                if (isMounted.current) {
                    setError('Failed to initialize PDF viewer');
                }
            }
        };

        if (!pdfjsReady) {
            init();
        }
    }, [pdfjsReady]);

    // Load Document
    useEffect(() => {
        if (!url || !pdfjsReady || !pdfjsLib) return;

        // Cleanup previous task
        if (loadingTaskRef.current) {
            loadingTaskRef.current.destroy();
            loadingTaskRef.current = null;
        }

        const loadPdf = async () => {
            setLoading(true);
            setError(null);
            try {
                const loadingTask = pdfjsLib!.getDocument(url);
                loadingTaskRef.current = loadingTask as unknown as PDFLoadingTask;
                const doc = await loadingTask.promise;

                if (isMounted.current) {
                    setPdfDoc(doc as unknown as PDFDocumentProxy);
                }
            } catch (err: unknown) {
                console.error("Error loading PDF:", err);
                if (isMounted.current) setError("Failed to load document. File may be corrupted or restricted.");
            } finally {
                if (isMounted.current) setLoading(false);
            }
        };

        loadPdf();

        return () => {
            if (loadingTaskRef.current) {
                loadingTaskRef.current.destroy();
            }
        };
    }, [url, pdfjsReady]);

    return {
        pdfDoc,
        loading,
        error,
        pdfjsReady
    };
}
