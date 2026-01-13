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

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/features/theme';
import { usePDFViewer } from '../../hooks/usePDFViewer';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface PDFPageViewport {
  width: number;
  height: number;
}

interface PDFRenderTask {
  promise: Promise<void>;
  cancel(): void;
}

interface PDFRenderParams {
  canvasContext: CanvasRenderingContext2D;
  viewport: PDFPageViewport;
}

interface PDFPageProxy {
  getViewport(params: { scale: number; rotation?: number }): PDFPageViewport;
  render(params: PDFRenderParams): PDFRenderTask;
}

// PDFDocumentProxy is now used from the hook return type implicitly or we can redefine it/import it
// For now, keeping the interface here to satisfy the render logic, 
// though we'll cast the hook result if needed.
interface PDFDocumentProxy {
  getPage(pageNumber: number): Promise<PDFPageProxy>;
  numPages: number;
  destroy(): void;
}

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

  // Use the custom hook for document loading
  const { pdfDoc, loading, error } = usePDFViewer(url);
  
  const [pageNum] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Refs for tracking async state
  const renderTaskRef = useRef<PDFRenderTask | null>(null);
  const isMounted = useRef(false);
  const resizeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const width = entries[0]?.contentRect.width;

      // Debounce resize updates
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(() => {
        if (isMounted.current && typeof width === 'number' && width > 0) {
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

  // Document loading is now handled by usagePDFViewer hook

  const renderPage = useCallback(async () => {
    // Cast pdfDoc to local interface if needed, or rely on duck typing
    if (!pdfDoc || !canvasRef.current || containerWidth === 0) return;
    const doc = pdfDoc as unknown as PDFDocumentProxy;

    // Cancel any pending render
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch (error) {
        console.error('PDF load error:', error);
        // Ignore cancellation errors
      }
    }

    try {
      const page = await doc.getPage(pageNum);

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

      const newTask = page.render(renderContext);
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
