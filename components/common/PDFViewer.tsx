
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

interface PDFViewerProps {
  url: string | null;
  scale?: number;
  rotation?: number;
  onPageLoad?: (dimensions: { width: number; height: number }) => void;
  children?: React.ReactNode;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ 
  url, 
  scale = 1.0, 
  rotation = 0, 
  onPageLoad,
  children 
}) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Refs for tracking async state
  const renderTaskRef = useRef<any>(null);
  const loadingTaskRef = useRef<any>(null);
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
    if (!url) return;

    // Cleanup previous task if any
    if (loadingTaskRef.current) {
        loadingTaskRef.current.destroy();
        loadingTaskRef.current = null;
    }

    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      try {
        const loadingTask = pdfjsLib.getDocument(url);
        loadingTaskRef.current = loadingTask;
        const doc = await loadingTask.promise;
        
        if (isMounted.current) {
            setPdfDoc(doc);
            setPageNum(1);
        }
      } catch (err) {
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
  }, [url]);

  // Render Page
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || containerWidth === 0) return;

    // Cancel any pending render
    if (renderTaskRef.current) {
      try {
          await renderTaskRef.current.cancel();
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

      const renderContext = {
        canvasContext: context,
        transform: transform,
        viewport: viewport,
      };

      const newTask = page.render(renderContext);
      renderTaskRef.current = newTask;

      await newTask.promise;
    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') {
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
        <div className={cn("absolute inset-0 flex flex-col items-center justify-center z-20 backdrop-blur-sm", theme.surface, "bg-opacity-80")}>
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
            className={cn("relative shadow-2xl border transition-all duration-200 ease-out origin-top", theme.surface, theme.border.default)}
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
};
