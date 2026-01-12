'use server';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║               LEXIFLOW PDF GENERATION SERVER ACTIONS                      ║
 * ║          Server-Side PDF Export with Puppeteer/PDF-Lib                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * PDF generation must be server-side to avoid browser memory issues,
 * ensure consistent rendering, and enable proper server resources.
 *
 * @module app/actions/documents/pdf-generation
 * @security Server-only PDF processing
 * @author LexiFlow Engineering Team
 * @since 2026-01-12 (Performance Optimization)
 */

import { cookies } from 'next/headers';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface PleadingSection {
  type: string;
  content: string;
  level?: number;
}

interface ExportPDFOptions {
  documentId?: string;
  title: string;
  sections: PleadingSection[];
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string[];
  };
}

/**
 * Verify authentication
 */
async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  return token;
}

/**
 * Export pleading to PDF using pdf-lib
 * @param options - PDF export options
 * @returns Promise<string> - Base64 encoded PDF
 */
export async function exportPleadingToPDF(
  options: ExportPDFOptions
): Promise<string> {
  await requireAuth();

  try {
    const pdfDoc = await PDFDocument.create();
    
    if (options.metadata) {
      pdfDoc.setTitle(options.title);
      if (options.metadata.author) pdfDoc.setAuthor(options.metadata.author);
      if (options.metadata.subject) pdfDoc.setSubject(options.metadata.subject);
      if (options.metadata.keywords) {
        pdfDoc.setKeywords(options.metadata.keywords);
      }
    }

    pdfDoc.setCreator('LexiFlow Legal Suite');
    pdfDoc.setProducer('LexiFlow PDF Engine v1.0');

    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    
    const pageWidth = 612; // 8.5 inches * 72 DPI
    const pageHeight = 792; // 11 inches * 72 DPI
    const margin = 72; // 1 inch margins
    const maxWidth = pageWidth - 2 * margin;

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;

    currentPage.drawText(options.title, {
      x: margin,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
      maxWidth,
    });
    yPosition -= 30;

    for (const section of options.sections) {
      const fontSize = section.level === 1 ? 14 : section.level === 2 ? 12 : 11;
      const sectionFont = section.level && section.level <= 2 ? boldFont : font;

      const lines = splitTextIntoLines(section.content, maxWidth, fontSize, font);

      for (const line of lines) {
        if (yPosition - fontSize - 5 < margin) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin;
        }

        currentPage.drawText(line, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: sectionFont,
          color: rgb(0, 0, 0),
        });

        yPosition -= fontSize + 5;
      }

      yPosition -= 10;
    }

    const pdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(pdfBytes).toString('base64');

    return base64;
  } catch (error) {
    console.error('[PDF] Export error:', error);
    throw new Error('Failed to generate PDF');
  }
}

/**
 * Helper: Split text into lines that fit within max width
 */
function splitTextIntoLines(
  text: string,
  maxWidth: number,
  fontSize: number,
  font: any
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = estimateTextWidth(testLine, fontSize);

    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Helper: Estimate text width (approximate)
 */
function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.5;
}

/**
 * Generate document preview as PDF
 * @param documentId - Document ID
 * @param content - HTML or markdown content
 * @returns Promise<string> - Base64 encoded PDF
 */
export async function generateDocumentPreview(
  documentId: string,
  content: string
): Promise<string> {
  await requireAuth();

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { width, height } = page.getSize();
    const margin = 50;

    const cleanContent = content.replace(/<[^>]*>/g, '').substring(0, 2000);

    page.drawText('Document Preview', {
      x: margin,
      y: height - margin,
      size: 16,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(cleanContent, {
      x: margin,
      y: height - margin - 40,
      size: 10,
      font,
      color: rgb(0, 0, 0),
      maxWidth: width - 2 * margin,
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes).toString('base64');
  } catch (error) {
    console.error('[PDF] Preview generation error:', error);
    throw new Error('Failed to generate document preview');
  }
}

/**
 * Batch export multiple documents to PDF
 * @param documents - Array of documents to export
 * @returns Promise<string[]> - Array of Base64 encoded PDFs
 */
export async function batchExportDocumentsToPDF(
  documents: ExportPDFOptions[]
): Promise<string[]> {
  await requireAuth();

  const results = await Promise.allSettled(
    documents.map(doc => exportPleadingToPDF(doc))
  );

  return results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    console.error('[PDF] Batch export error:', result.reason);
    return '';
  });
}
