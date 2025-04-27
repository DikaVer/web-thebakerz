import { validateImage } from './imageValidator';
import { compressImage } from './imageCompression';
import { logger } from '../logger';

/**
 * Complete image processing workflow from validation to compression
 * @param file The image file to process
 * @param options Customization options for the processing
 * @returns The processed file or null if processing failed
 */
export async function processImage(file: File, options: {
  preserveFormat?: boolean;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
} = {}): Promise<{
  file: File | null;
  error?: string;
  originalSize?: number;
  compressedSize?: number;
  dimensions?: { width: number; height: number };
}> {
  try {
    logger.debug('processImage', '📸 Image Processing Started');
    logger.debug('processImage', `Original file: ${file.name} (${file.type})`);
    logger.debug('processImage', `Original size: ${formatFileSize(file.size)}`);
    
    // Set default options
    const {
      preserveFormat = false,
      maxSizeMB = 2,
      maxWidthOrHeight = 1200,
      quality: customQuality
    } = options;
    
    // Step 1: Validate the image
    logger.debug('processImage', 'Step 1: Validating image...');
    const validation = await validateImage(file);
    
    if (!validation.valid) {
      logger.error('processImage', `❌ Validation failed: ${validation.error}`);
      return {
        file: null,
        error: validation.error,
        originalSize: validation.size
      };
    }
    
    logger.debug('processImage', `✅ Validation passed`);
    if (validation.dimensions) {
      logger.debug('processImage', `📏 Dimensions: ${validation.dimensions.width}×${validation.dimensions.height}px`);
    }
    
    // Step 2: Determine output format
    let format: 'webp' | 'jpeg' | 'png' = 'webp'; // Default to WebP for best compression
    
    // Determine initial quality level based on file size and format
    let initialQuality = customQuality || 0.85; // Default quality
    
    if (preserveFormat) {
      // Try to preserve the original format if requested
      const lowerType = file.type.toLowerCase();
      if (lowerType === 'image/png') {
        format = 'png';
        logger.debug('processImage', '📋 Preserving original PNG format');
      } else if (lowerType === 'image/jpeg' || lowerType === 'image/pjpeg') {
        format = 'jpeg';
        logger.debug('processImage', '📋 Preserving original JPEG format');
      } else if (lowerType.includes('heic') || lowerType.includes('heif')) {
        format = 'webp'; // Always convert HEIC/HEIF to WebP for better compatibility
        logger.debug('processImage', '📋 Converting HEIC/HEIF to WebP for compatibility');
      } else {
        logger.debug('processImage', '📋 Converting to WebP (original format not supported for preservation)');
      }
    } else {
      // For HEIC/HEIF images, we might want to adjust quality settings
      const lowerType = file.type.toLowerCase();
      if (lowerType.includes('heic') || lowerType.includes('heif')) {
        logger.debug('processImage', '📋 Converting HEIC/HEIF to WebP with optimized settings');
        // HEIC/HEIF are already highly compressed, so we use higher quality for WebP
        if (!customQuality) {
          initialQuality = 0.90;
        }
      } else {
        logger.debug('processImage', '📋 Converting to WebP for optimal compression');
      }
    }
    
    // Step 3: Compress the image
    logger.debug('processImage', 'Step 3: Compressing image...');
    const originalSize = file.size;
    
    // For larger images or specific formats, adjust quality
    if (!customQuality) {
      if (originalSize > 5 * 1024 * 1024) {
        initialQuality = 0.65; // Lower quality for very large images
        logger.debug('processImage', `📊 Large image detected (${formatFileSize(originalSize)}) - Setting initial quality to 65%`);
      } else if (originalSize > 2 * 1024 * 1024) {
        initialQuality = 0.75; // Medium quality for large images
        logger.debug('processImage', `📊 Medium-size image detected (${formatFileSize(originalSize)}) - Setting initial quality to 75%`);
      } else {
        logger.debug('processImage', `📊 Normal-size image detected (${formatFileSize(originalSize)}) - Using standard quality of ${Math.round(initialQuality * 100)}%`);
      }
      
      // PNG files may need higher quality to preserve details
      if (format === 'png' && initialQuality < 0.8) {
        initialQuality = 0.8;
        logger.debug('processImage', `📊 Adjusted quality to 80% for PNG format`);
      }
    } else {
      logger.debug('processImage', `📊 Using custom quality setting: ${Math.round(customQuality * 100)}%`);
    }
    
    const compressionSettings = {
      maxSizeMB,
      maxWidthOrHeight,
      quality: initialQuality,
      format
    };
    
    logger.debug('processImage', 'Compression settings: ' + JSON.stringify({
      maxSizeMB: `${compressionSettings.maxSizeMB}MB`,
      maxWidthOrHeight: `${compressionSettings.maxWidthOrHeight}px`,
      quality: `${Math.round(compressionSettings.quality * 100)}%`,
      format: compressionSettings.format
    }));
    
    const compressedFile = await compressImage(file, compressionSettings);
    
    const compressionRatio = (1 - compressedFile.size / originalSize) * 100;
    
    logger.debug('processImage', '📊 Compression results:');
    logger.debug('processImage', `  - Original: ${formatFileSize(originalSize)}`);
    logger.debug('processImage', `  - Compressed: ${formatFileSize(compressedFile.size)}`);
    logger.debug('processImage', `  - Reduction: ${compressionRatio.toFixed(1)}%`);
    
    if (compressionRatio < 0) {
      logger.warn('processImage', '⚠️ Note: Image size increased after compression. This can happen with very small or already optimized images.');
    } else if (compressionRatio > 80) {
      logger.debug('processImage', '🎉 Excellent compression achieved! Over 80% reduction in file size.');
    } else if (compressionRatio > 50) {
      logger.debug('processImage', '👍 Good compression achieved! Over 50% reduction in file size.');
    }
    
    if (file.type !== `image/${format}`) {
      logger.debug('processImage', `🔄 Format converted: ${file.type} → image/${format}`);
    }
    
    logger.debug('processImage', '✅ Image processing completed successfully!');
    
    return {
      file: compressedFile,
      originalSize,
      compressedSize: compressedFile.size,
      dimensions: validation.dimensions
    };
    
  } catch (error) {
    logger.error('processImage', '❌ Image processing error: ' + (error instanceof Error ? error.message : String(error)));
    return {
      file: null,
      error: 'Failed to process image. Please try a different file.'
    };
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