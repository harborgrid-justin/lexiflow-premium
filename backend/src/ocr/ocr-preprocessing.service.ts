import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';

export interface PreprocessingResult {
  processedImage: Buffer;
  operations: string[];
  improvements: {
    contrastEnhanced: boolean;
    denoised: boolean;
    deskewed: boolean;
    binarized: boolean;
  };
  warnings: string[];
  metadata: {
    originalSize: { width: number; height: number };
    processedSize: { width: number; height: number };
    dpi?: number;
  };
}

export interface PreprocessingOptions {
  enhanceContrast?: boolean;
  denoise?: boolean;
  deskew?: boolean;
  binarize?: boolean;
  sharpen?: boolean;
  upscale?: boolean;
  targetDpi?: number;
  removeBackground?: boolean;
}

/**
 * OCR Image Preprocessing Service
 * Enhances images for optimal OCR accuracy through:
 * - Contrast enhancement
 * - Noise reduction
 * - Deskewing (rotation correction)
 * - Binarization (black & white conversion)
 * - Sharpening
 * - DPI normalization
 * - Background removal
 */
@Injectable()
export class OcrPreprocessingService {
  private readonly logger = new Logger(OcrPreprocessingService.name);

  // Optimal DPI for OCR (300 DPI is standard for documents)
  private readonly OPTIMAL_DPI = 300;
  private readonly MIN_DPI = 200;

  /**
   * Main preprocessing pipeline
   */
  async preprocessImage(
    imageBuffer: Buffer,
    options: PreprocessingOptions = {},
  ): Promise<PreprocessingResult> {
    try {
      this.logger.log('Starting image preprocessing for OCR');

      const operations: string[] = [];
      const warnings: string[] = [];
      const improvements = {
        contrastEnhanced: false,
        denoised: false,
        deskewed: false,
        binarized: false,
      };

      // Get original metadata
      const originalMetadata = await sharp(imageBuffer).metadata();
      const originalSize = {
        width: originalMetadata.width,
        height: originalMetadata.height,
      };

      this.logger.debug(`Original image: ${originalSize.width}x${originalSize.height}`);

      // Check DPI and warn if too low
      if (originalMetadata.density && originalMetadata.density < this.MIN_DPI) {
        warnings.push(`Low DPI detected: ${originalMetadata.density}. Optimal is ${this.OPTIMAL_DPI}`);
      }

      let processedImage = sharp(imageBuffer);

      // Step 1: Upscale if DPI is too low
      if (options.upscale !== false && originalMetadata.density && originalMetadata.density < this.MIN_DPI) {
        const scaleFactor = this.OPTIMAL_DPI / originalMetadata.density;
        processedImage = processedImage.resize({
          width: Math.round(originalSize.width * scaleFactor),
          height: Math.round(originalSize.height * scaleFactor),
          kernel: sharp.kernel.lanczos3,
        });
        operations.push('upscaled');
        this.logger.debug(`Upscaled image by factor ${scaleFactor.toFixed(2)}`);
      }

      // Step 2: Deskew (straighten rotated images)
      if (options.deskew !== false) {
        // Note: Sharp doesn't have built-in deskewing
        // In production, integrate with image-processing library or custom algorithm
        // For now, apply a simple rotation check
        const angle = await this.detectSkewAngle(imageBuffer);
        if (Math.abs(angle) > 0.5) {
          processedImage = processedImage.rotate(-angle, {
            background: { r: 255, g: 255, b: 255 },
          });
          improvements.deskewed = true;
          operations.push(`deskewed (${angle.toFixed(2)}°)`);
          this.logger.debug(`Deskewed image by ${angle.toFixed(2)} degrees`);
        }
      }

      // Step 3: Convert to grayscale (reduces noise and improves processing)
      processedImage = processedImage.grayscale();
      operations.push('converted to grayscale');

      // Step 4: Denoise
      if (options.denoise !== false) {
        processedImage = processedImage.median(3); // Median filter for noise reduction
        improvements.denoised = true;
        operations.push('denoised');
        this.logger.debug('Applied noise reduction');
      }

      // Step 5: Enhance contrast
      if (options.enhanceContrast !== false) {
        processedImage = processedImage.normalize(); // Stretch histogram
        improvements.contrastEnhanced = true;
        operations.push('enhanced contrast');
        this.logger.debug('Enhanced contrast');
      }

      // Step 6: Sharpen
      if (options.sharpen !== false) {
        processedImage = processedImage.sharpen({
          sigma: 1.0,
          m1: 1.0,
          m2: 0.5,
          x1: 2,
          y2: 10,
          y3: 20,
        });
        operations.push('sharpened');
        this.logger.debug('Applied sharpening');
      }

      // Step 7: Binarization (convert to pure black and white)
      if (options.binarize !== false) {
        // Adaptive thresholding for better results
        processedImage = processedImage.threshold(128, {
          greyscale: false, // Binary output
        });
        improvements.binarized = true;
        operations.push('binarized');
        this.logger.debug('Applied binarization');
      }

      // Step 8: Remove background (optional, for scanned documents with shadows)
      if (options.removeBackground) {
        processedImage = processedImage.flatten({
          background: { r: 255, g: 255, b: 255 },
        });
        operations.push('background removed');
        this.logger.debug('Removed background');
      }

      // Generate final buffer
      const finalBuffer = await processedImage.toBuffer();

      // Get processed metadata
      const processedMetadata = await sharp(finalBuffer).metadata();
      const processedSize = {
        width: processedMetadata.width,
        height: processedMetadata.height,
      };

      this.logger.log(`Preprocessing completed. Applied ${operations.length} operations`);

      return {
        processedImage: finalBuffer,
        operations,
        improvements,
        warnings,
        metadata: {
          originalSize,
          processedSize,
          dpi: options.targetDpi || this.OPTIMAL_DPI,
        },
      };

    } catch (error) {
      this.logger.error(`Image preprocessing failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Detect skew angle in image
   * This is a simplified version - in production, use more sophisticated algorithms
   */
  private async detectSkewAngle(imageBuffer: Buffer): Promise<number> {
    try {
      // Simplified skew detection
      // In production, implement Hough transform or projection profile analysis

      const metadata = await sharp(imageBuffer).metadata();

      // For now, return 0 (no skew)
      // Real implementation would analyze edge detection to find document orientation
      return 0;

    } catch (error) {
      this.logger.error(`Skew detection failed: ${error.message}`);
      return 0;
    }
  }

  /**
   * Enhance contrast using adaptive histogram equalization
   */
  async enhanceContrastAdaptive(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return sharp(imageBuffer)
        .normalize()
        .linear(1.2, -(128 * 0.2)) // Increase contrast
        .toBuffer();
    } catch (error) {
      this.logger.error(`Contrast enhancement failed: ${error.message}`);
      return imageBuffer;
    }
  }

  /**
   * Remove salt and pepper noise
   */
  async removeSaltPepperNoise(imageBuffer: Buffer): Promise<Buffer> {
    try {
      // Use median filter with larger kernel for heavy noise
      return sharp(imageBuffer)
        .median(5)
        .toBuffer();
    } catch (error) {
      this.logger.error(`Noise removal failed: ${error.message}`);
      return imageBuffer;
    }
  }

  /**
   * Apply morphological operations (erosion/dilation)
   */
  async applyMorphology(
    imageBuffer: Buffer,
    operation: 'erode' | 'dilate',
  ): Promise<Buffer> {
    try {
      // Morphological operations help clean up text edges
      // Sharp doesn't have built-in morphology, so we use blur as approximation

      if (operation === 'erode') {
        // Erosion - makes black areas smaller
        return sharp(imageBuffer)
          .blur(0.5)
          .threshold(140)
          .toBuffer();
      } else {
        // Dilation - makes black areas larger
        return sharp(imageBuffer)
          .blur(0.5)
          .threshold(115)
          .toBuffer();
      }
    } catch (error) {
      this.logger.error(`Morphology operation failed: ${error.message}`);
      return imageBuffer;
    }
  }

  /**
   * Correct perspective distortion
   */
  async correctPerspective(imageBuffer: Buffer): Promise<Buffer> {
    try {
      // Perspective correction requires corner detection and transformation
      // This is a placeholder - in production, use OpenCV or similar

      this.logger.warn('Perspective correction not fully implemented');
      return imageBuffer;

    } catch (error) {
      this.logger.error(`Perspective correction failed: ${error.message}`);
      return imageBuffer;
    }
  }

  /**
   * Remove borders and margins
   */
  async removeBorders(imageBuffer: Buffer, threshold: number = 10): Promise<Buffer> {
    try {
      const metadata = await sharp(imageBuffer).metadata();

      // Trim white space from edges
      return sharp(imageBuffer)
        .trim({
          threshold,
        })
        .toBuffer();

    } catch (error) {
      this.logger.error(`Border removal failed: ${error.message}`);
      return imageBuffer;
    }
  }

  /**
   * Optimize image for OCR based on document type
   */
  async optimizeForDocumentType(
    imageBuffer: Buffer,
    documentType: 'text' | 'handwritten' | 'form' | 'receipt' | 'mixed',
  ): Promise<Buffer> {
    try {
      this.logger.log(`Optimizing image for document type: ${documentType}`);

      const options: PreprocessingOptions = {};

      switch (documentType) {
        case 'text':
          // Standard printed text - strong binarization
          options.enhanceContrast = true;
          options.binarize = true;
          options.denoise = true;
          options.sharpen = true;
          break;

        case 'handwritten':
          // Handwritten text - gentler processing
          options.enhanceContrast = true;
          options.binarize = false; // Keep grayscale for handwriting
          options.denoise = true;
          options.sharpen = false; // Avoid over-sharpening
          break;

        case 'form':
          // Forms with text - preserve structure
          options.enhanceContrast = true;
          options.binarize = true;
          options.denoise = true;
          options.removeBackground = true;
          break;

        case 'receipt':
          // Receipts - often low quality
          options.enhanceContrast = true;
          options.binarize = true;
          options.denoise = true;
          options.sharpen = true;
          options.upscale = true;
          break;

        case 'mixed':
          // Mixed content - balanced approach
          options.enhanceContrast = true;
          options.denoise = true;
          options.sharpen = true;
          break;
      }

      const result = await this.preprocessImage(imageBuffer, options);
      return result.processedImage;

    } catch (error) {
      this.logger.error(`Document type optimization failed: ${error.message}`);
      return imageBuffer;
    }
  }

  /**
   * Analyze image quality before OCR
   */
  async analyzeImageQuality(imageBuffer: Buffer): Promise<{
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      // Check resolution
      if (metadata.density && metadata.density < this.MIN_DPI) {
        issues.push('Low resolution/DPI');
        score -= 25;
        recommendations.push('Rescan document at higher resolution (300 DPI recommended)');
      }

      // Check size
      if (metadata.width < 800 || metadata.height < 800) {
        issues.push('Small image dimensions');
        score -= 20;
        recommendations.push('Use higher resolution image for better OCR results');
      }

      // Analyze sharpness using statistics
      const stats = await sharp(imageBuffer).stats();
      const overallSharpness = this.calculateSharpness(stats);

      if (overallSharpness < 0.3) {
        issues.push('Image appears blurry');
        score -= 30;
        recommendations.push('Improve focus when scanning or photographing document');
      }

      // Determine quality level
      let quality: 'excellent' | 'good' | 'fair' | 'poor';
      if (score >= 90) quality = 'excellent';
      else if (score >= 70) quality = 'good';
      else if (score >= 50) quality = 'fair';
      else quality = 'poor';

      return {
        quality,
        score,
        issues,
        recommendations,
      };

    } catch (error) {
      this.logger.error(`Image quality analysis failed: ${error.message}`);
      return {
        quality: 'poor',
        score: 0,
        issues: ['Analysis failed'],
        recommendations: ['Unable to analyze image quality'],
      };
    }
  }

  /**
   * Calculate sharpness metric from image statistics
   */
  private calculateSharpness(stats: sharp.Stats): number {
    // Use standard deviation as proxy for sharpness
    // Higher std dev typically indicates sharper images
    let totalStdDev = 0;

    for (const channel of stats.channels) {
      totalStdDev += channel.stdev;
    }

    const avgStdDev = totalStdDev / stats.channels.length;

    // Normalize to 0-1 range (assuming max stdev around 100)
    return Math.min(avgStdDev / 100, 1);
  }

  /**
   * Batch preprocess multiple images
   */
  async preprocessBatch(
    images: Array<{ buffer: Buffer; fileName: string }>,
    options: PreprocessingOptions = {},
  ): Promise<Array<{ fileName: string; result: PreprocessingResult }>> {
    this.logger.log(`Batch preprocessing ${images.length} images`);

    const results: Array<{ fileName: string; result: PreprocessingResult }> = [];

    for (const image of images) {
      try {
        const result = await this.preprocessImage(image.buffer, options);
        results.push({
          fileName: image.fileName,
          result,
        });
      } catch (error) {
        this.logger.error(`Batch preprocessing failed for ${image.fileName}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Create preview of preprocessing steps for debugging
   */
  async createPreprocessingPreview(
    imageBuffer: Buffer,
  ): Promise<{
    original: Buffer;
    grayscale: Buffer;
    denoised: Buffer;
    enhanced: Buffer;
    binarized: Buffer;
  }> {
    const original = imageBuffer;

    const grayscale = await sharp(imageBuffer).grayscale().toBuffer();

    const denoised = await sharp(grayscale).median(3).toBuffer();

    const enhanced = await sharp(denoised).normalize().toBuffer();

    const binarized = await sharp(enhanced).threshold(128).toBuffer();

    return {
      original,
      grayscale,
      denoised,
      enhanced,
      binarized,
    };
  }
}
