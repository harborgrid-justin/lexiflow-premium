/**
 * @module components/common/PDFViewer
 * @category Common
 * @description PDF viewer with canvas rendering.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AlertCircle, Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Dynamic import for pdfjs-dist to avoid DOMMatrix issues in SSR
type PDFJSType = typeof import('pdfjs-dist');
let pdfjsLib: PDFJSType | null = null;

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// CONFIGURATION
// ============================================================================
// Initialize PDF.js when the component mounts (browser-only)
const initializePDFJS = async () => {
  if (pdfjsLib) return pdfjsLib;

  try {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
    pdfjsLib = pdfjs;
    return pdfjs;
  } catch () {
    console.error('Failed to load PDF.js:', error);
    throw error;
  }
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface PDFViewerProps {
  url: string | null;
  scale?: number;
  rotation?: number;
  onPageLoad?: (dimensions: { width: number; height: number }) => void;
  children?: React.ReactNode;
}

/**
 * PDFViewer - React 18 optimized with useId
 */
export const PDFViewer = React.memo<PDFViewerProps>(({
  url,
  scale = 1.0,
  rotation = 0,
  onPageLoad,
  children
}) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [pdfjsReady, setPdfjsReady] = useState(false);

  // Refs for tracking async state
  const renderTaskRef = useRef<any | null>(null);
  const loadingTaskRef = useRef<any | null>(null);
  const isMounted = useRef(false);
  const resizeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Initialize PDF.js on mount
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

    init();
  }, []);

  // Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const width = entries[0].contentRect.width;

      // Debounce resize updates
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(() => {
        if (isMounted.current && width > 0) {
          setContainerWidth(width);
        }
      }, 200);
    });

    observer.observe(containerRef.current);
    // Initial set
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }

    return () => {
      observer.disconnect();
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
    };
  }, []);

  // Load Document
  useEffect(() => {
    if (!url || !pdfjsReady || !pdfjsLib) return;

    // Cleanup previous task if any
    if (loadingTaskRef.current) {
      loadingTaskRef.current.destroy();
      loadingTaskRef.current = null;
    }

    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      try {
        const loadingTask = pdfjsLib!.getDocument(url);
        loadingTaskRef.current = loadingTask;
        const doc = await loadingTask.promise;

        if (isMounted.current) {
          setPdfDoc(doc);
          setPageNum(1);
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
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || containerWidth === 0) return;

    // Cancel any pending render
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch (e) {
        // Ignore cancellation errors
      }
    }

    try {
      const page = await pdfDoc.getPage(pageNum);

      // Calculate scale to fit width, considering the external scale prop
      const unscaledViewport = page.getViewport({ scale: 1, rotation: rotation });
      const availableWidth = Math.max(containerWidth - 64, 300);
      const responsiveScale = (availableWidth / unscaledViewport.width) * scale;

      const viewport = page.getViewport({ scale: responsiveScale, rotation: rotation });

      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      const outputScale = window.devicePixelRatio || 1;

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);

      const displayWidth = Math.floor(viewport.width);
      const displayHeight = Math.floor(viewport.height);

      canvas.style.width = displayWidth + "px";
      canvas.style.height = displayHeight + "px";

      if (isMounted.current) {
        setDimensions({ width: displayWidth, height: displayHeight });
        if (onPageLoad) onPageLoad({ width: displayWidth, height: displayHeight });
      }

      const transform = outputScale !== 1
        ? [outputScale, 0, 0, outputScale, 0, 0]
        : undefined;

      const renderContext = transform
        ? {
          canvasContext: context,
          transform: transform,
          viewport: viewport,
        }
        : {
          canvasContext: context,
          viewport: viewport,
        };

      const newTask = page.render(renderContext as any);
      renderTaskRef.current = newTask;

      await newTask.promise;
    } catch (err: unknown) {
      const errName = typeof err === 'object' && err !== null && 'name' in err ? String(err.name) : '';
      if (errName !== 'RenderingCancelledException') {
        console.error("Render error:", err);
      }
    }
  }, [pdfDoc, pageNum, scale, rotation, onPageLoad, containerWidth]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  if (!url) return null;

  return (
    <div ref={containerRef} className={cn("flex flex-col items-center p-8 min-h-full relative overflow-auto w-full", theme.background)}>
      {loading && (
        <div className={cn("absolute inset-0 flex flex-col items-center justify-center z-20 backdrop-blur-sm", theme.surface.default, "bg-opacity-80")}>
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-3" />
          <span className={cn("text-sm font-medium", theme.text.secondary)}>Rendering...</span>
        </div>
      )}

      {error ? (
        <div className={cn("flex flex-col items-center p-8 rounded-lg border", theme.status.error.bg, theme.status.error.border, theme.status.error.text)}>
          <AlertCircle className="h-8 w-8 mb-2" />
          <p className="font-medium">{error}</p>
        </div>
      ) : (
        <div
          className={cn("relative shadow-2xl border transition-all duration-200 ease-out origin-top", theme.surface.default, theme.border.default)}
          style={{ width: dimensions.width, height: dimensions.height }}
        >
          <canvas ref={canvasRef} className="block absolute inset-0" />
          <div className="absolute inset-0 z-10">
            {children}
          </div>
        </div>
      )}
    </div>
  );
});

PDFViewer.displayName = 'PDFViewer';
