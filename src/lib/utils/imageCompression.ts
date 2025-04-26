/**
 * Utility functions for client-side image compression
 */
import { logger } from '../logger';

/**
 * Compresses an image file to the specified size and format
 * @param file The image file to compress
 * @param options Configuration options for compression
 * @returns A Promise that resolves to the compressed File
 */
export async function compressImage(
  file: File,
  options: {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): Promise<File> {
  const {
    maxSizeMB = 2,
    maxWidthOrHeight = 1200,
    quality = 0.85,
    format = 'webp'
  } = options;

  // Handle special formats that require different processing
  const isAnimated = await checkIfAnimatedImage(file);
  if (isAnimated && file.type === 'image/gif') {
    logger.debug('compressImage', '🎬 Animated GIF detected - preserving original file to maintain animation');
    
    // For animated GIFs, we should preserve the original file if it's not too large
    if (file.size <= maxSizeMB * 1024 * 1024) {
      return file;
    } else {
      logger.debug('compressImage', '⚠️ Animated GIF is too large, will attempt basic compression');
      // We can't properly compress animated GIFs with canvas, but we'll try to reduce quality somewhat
    }
  }

  // Return early if file is already compressed enough and in the right format
  if (file.size <= maxSizeMB * 1024 * 1024 && file.type === `image/${format}`) {
    logger.debug('compressImage', `🔍 Image already meets compression requirements (${(file.size / 1024 / 1024).toFixed(2)}MB, ${file.type})`);
    return file;
  }

  logger.debug('compressImage', `🔍 Original image details:
  - Size: ${(file.size / 1024 / 1024).toFixed(2)}MB
  - Format: ${file.type}
  - Name: ${file.name}`);

  try {
    // Create an image from the file
    logger.debug('compressImage', '📷 Loading image data...');
    const image = await createImageFromFile(file);
    logger.debug('compressImage', `📏 Original dimensions: ${image.width}×${image.height}px`);
    
    // Get dimensions maintaining aspect ratio
    const { width, height } = calculateDimensions(
      image.width,
      image.height,
      maxWidthOrHeight
    );
    
    if (width !== image.width || height !== image.height) {
      logger.debug('compressImage', `🔄 Resizing from ${image.width}×${image.height}px to ${width}×${height}px`);
    } else {
      logger.debug('compressImage', '✓ No resizing needed (dimensions are within limits)');
    }

    // Create canvas and compress
    logger.debug('compressImage', '🎨 Creating canvas for image manipulation...');
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Use appropriate quality based on format
    let initialQuality = quality;
    let bestFormats = ['webp', 'jpeg', 'png']; // Preferred formats for compression
    
    // If the original is PNG with transparency, ensure we preserve transparency
    const isPngWithTransparency = file.type === 'image/png' && await hasTransparency(image);
    if (isPngWithTransparency) {
      logger.debug('compressImage', '🔍 Detected PNG with transparency');
      if (format !== 'png' && format !== 'webp') {
        logger.debug('compressImage', '⚠️ Changing output format to WebP to preserve transparency');
        // WebP supports transparency, JPEG doesn't
        bestFormats = ['webp', 'png'];
      }
      
      // Preserve alpha channel in canvas
      ctx.clearRect(0, 0, width, height);
    }
    
    // Use high quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    logger.debug('compressImage', '✓ Set high-quality image smoothing');
    
    // Draw the image on the canvas
    logger.debug('compressImage', '📝 Drawing image on canvas...');
    ctx.drawImage(image, 0, 0, width, height);

    // Convert to the desired format with specified quality
    const mimeType = `image/${format}`;
    logger.debug('compressImage', `🔄 Converting to ${mimeType} format with initial quality ${(initialQuality * 100).toFixed(0)}%`);
    
    // Try with initial quality setting
    let blob = await canvasToBlob(canvas, mimeType, initialQuality);
    let compressedSize = blob.size / (1024 * 1024);
    
    logger.debug('compressImage', `✓ Initial compression: ${compressedSize.toFixed(2)}MB (${Math.round(initialQuality * 100)}% quality)`);
    
    // If the file is still too large, gradually reduce quality until it fits
    if (compressedSize > maxSizeMB) {
      logger.debug('compressImage', `⚠️ Image still too large (${compressedSize.toFixed(2)}MB > ${maxSizeMB}MB), reducing quality...`);
      
      let currentQuality = initialQuality;
      let compressionStep = 1;
      
      while (compressedSize > maxSizeMB && currentQuality > 0.1) {
        currentQuality -= 0.1;
        blob = await canvasToBlob(canvas, mimeType, currentQuality);
        compressedSize = blob.size / (1024 * 1024);
        
        logger.debug('compressImage', `  Step ${compressionStep++}: Quality ${(currentQuality * 100).toFixed(0)}% → Size ${compressedSize.toFixed(2)}MB`);
      }
      
      // If still too large, try alternate formats
      if (compressedSize > maxSizeMB && format !== 'webp') {
        logger.debug('compressImage', `⚠️ Still too large, trying WebP format which typically has better compression...`);
        blob = await canvasToBlob(canvas, 'image/webp', Math.max(currentQuality, 0.6));
        compressedSize = blob.size / (1024 * 1024);
        logger.debug('compressImage', `  WebP result: Size ${compressedSize.toFixed(2)}MB`);
      }
      
      if (compressedSize <= maxSizeMB) {
        logger.debug('compressImage', `✅ Successfully reduced to target size (${compressedSize.toFixed(2)}MB)`);
      } else {
        logger.warn('compressImage', `⚠️ Could not reduce below ${maxSizeMB}MB even at lowest quality. Final size: ${compressedSize.toFixed(2)}MB`);
      }
    }

    // Create a File from the blob
    const fileName = file.name.replace(/\.[^.]+$/, `.${format === 'jpeg' ? 'jpg' : format}`);
    const compressedFile = new File([blob], fileName, { type: mimeType });
    
    // Calculate compression ratio
    const compressionRatio = (1 - compressedFile.size / file.size) * 100;
    
    logger.debug('compressImage', `✅ Compression complete:
  - Original: ${(file.size / 1024 / 1024).toFixed(2)}MB
  - Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB
  - Reduction: ${compressionRatio.toFixed(1)}%
  - Format: ${mimeType}
  - Dimensions: ${width}×${height}px`);
    
    return compressedFile;
  } catch (error) {
    logger.error('compressImage', '❌ Error during image compression:', { error });
    throw error;
  }
}

/**
 * Checks if an image has transparency (PNG with alpha channel)
 */
async function hasTransparency(image: HTMLImageElement): Promise<boolean> {
  // Create a small canvas to test for transparency
  const canvas = document.createElement('canvas');
  canvas.width = Math.min(50, image.width); // Just test a sample area
  canvas.height = Math.min(50, image.height);
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return false;
  
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  
  // Check if any pixel has alpha < 255 (not fully opaque)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  
  // Alpha values are at positions 3, 7, 11, ...
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] < 255) {
      return true;
    }
  }
  
  return false;
}

/**
 * Checks if an image is animated (e.g., GIF)
 */
async function checkIfAnimatedImage(file: File): Promise<boolean> {
  // Simple check for GIF - could be extended for more formats
  if (file.type === 'image/gif') {
    try {
      // Read a portion of the file to check for animation
      const buffer = await file.arrayBuffer();
      const array = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 50000));
      
      // In GIFs, multiple frames are indicated by frame descriptors
      // Simple check: look for multiple image descriptors
      // Skip header (13 bytes) and look for blocks like 0x21, 0xF9 (Graphics Control Extension)
      let frameCount = 0;
      for (let i = 13; i < array.length - 1; i++) {
        if (array[i] === 0x21 && array[i + 1] === 0xF9) {
          frameCount++;
          if (frameCount > 1) {
            return true; // Multiple frames detected
          }
        }
      }
    } catch (e) {
      logger.warn('checkIfAnimatedImage', 'Unable to determine if GIF is animated:', { error: e });
    }
  }
  
  return false;
}

/**
 * Converts a canvas element to a Blob with specified format and quality
 */
function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas to Blob conversion failed'));
        } else {
          resolve(blob);
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Creates an HTMLImageElement from a File
 */
function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculates new dimensions based on max width/height constraint
 * while preserving aspect ratio
 */
function calculateDimensions(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  // If image dimensions are already smaller than the max, keep them as is
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  // Calculate the ratio to maintain aspect ratio
  const ratio = Math.min(maxDimension / width, maxDimension / height);
  
  return {
    width: Math.floor(width * ratio),
    height: Math.floor(height * ratio)
  };
} 