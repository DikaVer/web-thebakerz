import { validateImage } from './imageValidator';
import { compressImage } from './imageCompression';

// Conditional logging utility
const log = {
  group: (message: string) => {
    if (process.env.NODE_ENV !== 'production') {
      console.group(message);
    }
  },
  groupEnd: () => {
    if (process.env.NODE_ENV !== 'production') {
      console.groupEnd();
    }
  },
  log: (message: string) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(message);
    }
  },
  error: (message: string) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(message);
    }
  },
  warn: (message: string) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(message);
    }
  },
  time: (label: string) => {
    if (process.env.NODE_ENV !== 'production') {
      console.time(label);
    }
  },
  timeEnd: (label: string) => {
    if (process.env.NODE_ENV !== 'production') {
      console.timeEnd(label);
    }
  }
};

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
    log.group('📸 Image Processing Started');
    log.log(`Original file: ${file.name} (${file.type})`);
    log.log(`Original size: ${formatFileSize(file.size)}`);
    
    // Set default options
    const {
      preserveFormat = false,
      maxSizeMB = 2,
      maxWidthOrHeight = 1200,
      quality: customQuality
    } = options;
    
    // Step 1: Validate the image
    log.log('Step 1: Validating image...');
    const validation = await validateImage(file);
    
    if (!validation.valid) {
      log.error(`❌ Validation failed: ${validation.error}`);
      log.groupEnd();
      return {
        file: null,
        error: validation.error,
        originalSize: validation.size
      };
    }
    
    log.log(`✅ Validation passed`);
    if (validation.dimensions) {
      log.log(`📏 Dimensions: ${validation.dimensions.width}×${validation.dimensions.height}px`);
    }
    
    // Step 2: Determine output format
    let format: 'webp' | 'jpeg' | 'png' = 'webp'; // Default to WebP for best compression
    
    if (preserveFormat) {
      // Try to preserve the original format if requested
      if (file.type === 'image/png') {
        format = 'png';
        log.log('📋 Preserving original PNG format');
      } else if (file.type === 'image/jpeg' || file.type === 'image/pjpeg') {
        format = 'jpeg';
        log.log('📋 Preserving original JPEG format');
      } else {
        log.log('📋 Converting to WebP (original format not supported for preservation)');
      }
    } else {
      log.log('📋 Converting to WebP for optimal compression');
    }
    
    // Step 3: Compress the image
    log.log('Step 3: Compressing image...');
    const originalSize = file.size;
    
    // Determine initial quality level based on file size and format
    let initialQuality = customQuality || 0.85; // Default quality
    
    // For larger images or specific formats, adjust quality
    if (!customQuality) {
      if (originalSize > 5 * 1024 * 1024) {
        initialQuality = 0.65; // Lower quality for very large images
        log.log(`📊 Large image detected (${formatFileSize(originalSize)}) - Setting initial quality to 65%`);
      } else if (originalSize > 2 * 1024 * 1024) {
        initialQuality = 0.75; // Medium quality for large images
        log.log(`📊 Medium-size image detected (${formatFileSize(originalSize)}) - Setting initial quality to 75%`);
      } else {
        log.log(`📊 Normal-size image detected (${formatFileSize(originalSize)}) - Using standard quality of 85%`);
      }
      
      // PNG files may need higher quality to preserve details
      if (format === 'png' && initialQuality < 0.8) {
        initialQuality = 0.8;
        log.log(`📊 Adjusted quality to 80% for PNG format`);
      }
    } else {
      log.log(`📊 Using custom quality setting: ${Math.round(customQuality * 100)}%`);
    }
    
    const compressionSettings = {
      maxSizeMB,
      maxWidthOrHeight,
      quality: initialQuality,
      format
    };
    
    log.log('Compression settings: ' + JSON.stringify({
      maxSizeMB: `${compressionSettings.maxSizeMB}MB`,
      maxWidthOrHeight: `${compressionSettings.maxWidthOrHeight}px`,
      quality: `${Math.round(compressionSettings.quality * 100)}%`,
      format: compressionSettings.format
    }));
    
    log.time('Compression time');
    const compressedFile = await compressImage(file, compressionSettings);
    log.timeEnd('Compression time');
    
    const compressionRatio = (1 - compressedFile.size / originalSize) * 100;
    
    log.log('📊 Compression results:');
    log.log(`  - Original: ${formatFileSize(originalSize)}`);
    log.log(`  - Compressed: ${formatFileSize(compressedFile.size)}`);
    log.log(`  - Reduction: ${compressionRatio.toFixed(1)}%`);
    
    if (compressionRatio < 0) {
      log.warn('⚠️ Note: Image size increased after compression. This can happen with very small or already optimized images.');
    } else if (compressionRatio > 80) {
      log.log('🎉 Excellent compression achieved! Over 80% reduction in file size.');
    } else if (compressionRatio > 50) {
      log.log('👍 Good compression achieved! Over 50% reduction in file size.');
    }
    
    if (file.type !== `image/${format}`) {
      log.log(`🔄 Format converted: ${file.type} → image/${format}`);
    }
    
    log.log('✅ Image processing completed successfully!');
    log.groupEnd();
    
    return {
      file: compressedFile,
      originalSize,
      compressedSize: compressedFile.size,
      dimensions: validation.dimensions
    };
    
  } catch (error) {
    log.error('❌ Image processing error: ' + (error instanceof Error ? error.message : String(error)));
    log.groupEnd();
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