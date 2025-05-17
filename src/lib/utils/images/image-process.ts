import { validateImage } from './image-validator';
import { compressImage } from './image-compression';
import { logger } from '../../logger';

// Constants for default processing options
const DEFAULT_OPTIONS = {
  PRESERVE_FORMAT: false,
  MAX_SIZE_MB: 2,
  MAX_WIDTH_OR_HEIGHT: 1200,
  QUALITY: 0.95,
};

// Constants for quality adjustments based on size
const QUALITY_ADJUSTMENTS = {
  LARGE_IMAGE_THRESHOLD: 5 * 1024 * 1024,
  MEDIUM_IMAGE_THRESHOLD: 2 * 1024 * 1024,
  LARGE_IMAGE_QUALITY: 0.90,
  MEDIUM_IMAGE_QUALITY: 0.95,
  PNG_MIN_QUALITY: 0.90,
  HEIC_QUALITY: 0.90,
};

// Types for better code clarity
export type ImageFormat = 'webp' | 'jpeg' | 'png';

export interface ImageProcessOptions {
  preserveFormat?: boolean;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

export interface ImageProcessResult {
  file: File | null;
  error?: string;
  originalSize?: number;
  compressedSize?: number;
  dimensions?: { width: number; height: number };
}

export interface CompressionSettings {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  quality: number;
  format: ImageFormat;
}

/**
 * Complete image processing workflow from validation to compression
 * @param file The image file to process
 * @param options Customization options for the processing
 * @returns The processed file or null if processing failed
 */
export async function imageProcess(
  file: File, 
  options: ImageProcessOptions = {}
): Promise<ImageProcessResult> {
  try {
    logger.debug('imageProcess', '📸 Image Processing Started');
    logger.debug('imageProcess', `Original file: ${file.name} (${file.type})`);
    logger.debug('imageProcess', `Original size: ${formatFileSize(file.size)}`);
    
    // Set default options
    const {
      preserveFormat = DEFAULT_OPTIONS.PRESERVE_FORMAT,
      maxSizeMB = DEFAULT_OPTIONS.MAX_SIZE_MB,
      maxWidthOrHeight = DEFAULT_OPTIONS.MAX_WIDTH_OR_HEIGHT,
      quality: customQuality
    } = options;
    
    // Step 1: Validate the image
    const validationResult = await validateAndLogImage(file);
    if (!validationResult.valid) {
      return {
        file: null,
        error: validationResult.error,
        originalSize: validationResult.size
      };
    }
    
    // Step 2: Determine output format and quality
    const { format, initialQuality } = determineFormatAndQuality(file, preserveFormat, customQuality);
    
    // Step 3: Compress the image
    const compressionResult = await compressAndLogImage(
      file, 
      {
        maxSizeMB,
        maxWidthOrHeight,
        quality: initialQuality,
        format
      }
    );
    
    logger.debug('imageProcess', '✅ Image processing completed successfully!');
    
    return {
      file: compressionResult.compressedFile,
      originalSize: file.size,
      compressedSize: compressionResult.compressedFile.size,
      dimensions: validationResult.dimensions
    };
    
  } catch (error) {
    logger.error('imageProcess', '❌ Image processing error: ' + (error instanceof Error ? error.message : String(error)));
    return {
      file: null,
      error: 'Failed to process image. Please try a different file.'
    };
  }
}

/**
 * Validate image and log the results
 */
async function validateAndLogImage(file: File): Promise<any> {
  logger.debug('imageProcess', 'Step 1: Validating image...');
  const validation = await validateImage(file);
  
  if (!validation.valid) {
    logger.error('imageProcess', `❌ Validation failed: ${validation.error}`);
    return validation;
  }
  
  logger.debug('imageProcess', `✅ Validation passed`);
  if (validation.dimensions) {
    logger.debug('imageProcess', `📏 Dimensions: ${validation.dimensions.width}×${validation.dimensions.height}px`);
  }
  
  return validation;
}

/**
 * Determine the output format and quality settings
 */
function determineFormatAndQuality(
  file: File, 
  preserveFormat: boolean, 
  customQuality?: number
): { format: ImageFormat; initialQuality: number } {
  let format: ImageFormat = 'webp'; // Default to WebP for best compression
  let initialQuality = customQuality || DEFAULT_OPTIONS.QUALITY;
  
  const lowerType = file.type.toLowerCase();
  
  if (preserveFormat) {
    if (lowerType === 'image/png') {
      format = 'png';
      logger.debug('imageProcess', '📋 Preserving original PNG format');
    } else if (lowerType === 'image/jpeg' || lowerType === 'image/pjpeg') {
      format = 'jpeg';
      logger.debug('imageProcess', '📋 Preserving original JPEG format');
    } else if (lowerType.includes('heic') || lowerType.includes('heif')) {
      format = 'webp'; // Always convert HEIC/HEIF to WebP for better compatibility
      logger.debug('imageProcess', '📋 Converting HEIC/HEIF to WebP for compatibility');
    } else {
      logger.debug('imageProcess', '📋 Converting to WebP (original format not supported for preservation)');
    }
  } else {
    if (lowerType.includes('heic') || lowerType.includes('heif')) {
      logger.debug('imageProcess', '📋 Converting HEIC/HEIF to WebP with optimized settings');
      if (!customQuality) {
        initialQuality = QUALITY_ADJUSTMENTS.HEIC_QUALITY;
      }
    } else {
      logger.debug('imageProcess', '📋 Converting to WebP for optimal compression');
    }
  }
  
  return { format, initialQuality };
}

/**
 * Compress the image and log the results
 */
async function compressAndLogImage(
  file: File, 
  compressionSettings: CompressionSettings
): Promise<{ compressedFile: File }> {
  logger.debug('imageProcess', 'Step 3: Compressing image...');
  const originalSize = file.size;
  
  // Adjust quality based on image size if not custom specified
  const adjustedSettings = adjustQualityBasedOnSize(originalSize, compressionSettings);
  
  logCompressionSettings(adjustedSettings);
  
  const compressedFile = await compressImage(file, adjustedSettings);
  
  logCompressionResults(originalSize, compressedFile.size);
  
  if (file.type !== `image/${adjustedSettings.format}`) {
    logger.debug('imageProcess', `🔄 Format converted: ${file.type} → image/${adjustedSettings.format}`);
  }
  
  return { compressedFile };
}

/**
 * Adjust quality settings based on image size
 */
function adjustQualityBasedOnSize(
  originalSize: number, 
  settings: CompressionSettings
): CompressionSettings {
  // If custom quality is provided, don't adjust
  if (settings.quality !== DEFAULT_OPTIONS.QUALITY) {
    logger.debug('imageProcess', `📊 Using custom quality setting: ${Math.round(settings.quality * 100)}%`);
    return settings;
  }
  
  let quality = settings.quality;
  
  if (originalSize > QUALITY_ADJUSTMENTS.LARGE_IMAGE_THRESHOLD) {
    quality = QUALITY_ADJUSTMENTS.LARGE_IMAGE_QUALITY;
    logger.debug('imageProcess', `📊 Large image detected (${formatFileSize(originalSize)}) - Setting initial quality to 65%`);
  } else if (originalSize > QUALITY_ADJUSTMENTS.MEDIUM_IMAGE_THRESHOLD) {
    quality = QUALITY_ADJUSTMENTS.MEDIUM_IMAGE_QUALITY;
    logger.debug('imageProcess', `📊 Medium-size image detected (${formatFileSize(originalSize)}) - Setting initial quality to 75%`);
  } else {
    logger.debug('imageProcess', `📊 Normal-size image detected (${formatFileSize(originalSize)}) - Using standard quality of ${Math.round(quality * 100)}%`);
  }
  
  // PNG files may need higher quality to preserve details
  if (settings.format === 'png' && quality < QUALITY_ADJUSTMENTS.PNG_MIN_QUALITY) {
    quality = QUALITY_ADJUSTMENTS.PNG_MIN_QUALITY;
    logger.debug('imageProcess', `📊 Adjusted quality to 80% for PNG format`);
  }
  
  return { ...settings, quality };
}

/**
 * Log compression settings
 */
function logCompressionSettings(settings: CompressionSettings): void {
  logger.debug('imageProcess', 'Compression settings: ' + JSON.stringify({
    maxSizeMB: `${settings.maxSizeMB}MB`,
    maxWidthOrHeight: `${settings.maxWidthOrHeight}px`,
    quality: `${Math.round(settings.quality * 100)}%`,
    format: settings.format
  }));
}

/**
 * Log compression results
 */
function logCompressionResults(originalSize: number, compressedSize: number): void {
  const compressionRatio = (1 - compressedSize / originalSize) * 100;
  
  logger.debug('imageProcess', '📊 Compression results:');
  logger.debug('imageProcess', `  - Original: ${formatFileSize(originalSize)}`);
  logger.debug('imageProcess', `  - Compressed: ${formatFileSize(compressedSize)}`);
  logger.debug('imageProcess', `  - Reduction: ${compressionRatio.toFixed(1)}%`);
  
  if (compressionRatio < 0) {
    logger.warn('imageProcess', '⚠️ Note: Image size increased after compression. This can happen with very small or already optimized images.');
  } else if (compressionRatio > 80) {
    logger.debug('imageProcess', '🎉 Excellent compression achieved! Over 80% reduction in file size.');
  } else if (compressionRatio > 50) {
    logger.debug('imageProcess', '👍 Good compression achieved! Over 50% reduction in file size.');
  }
}

/**
 * Helper function to display human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' bytes';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
} 