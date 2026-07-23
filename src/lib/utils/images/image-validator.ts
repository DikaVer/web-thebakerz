/**
 * @fileoverview Client-side image validation utilities.
 *
 * Exports validateImage, which checks an uploaded file against a whitelist of
 * MIME types (JPEG, PNG, GIF, WebP, HEIC/HEIF) and a 10MB pre-compression size
 * limit and returns the image dimensions, and getImageDimensions, which loads a
 * file into an Image element to measure its width and height.
 */

/**
 * Validates if an image file meets the required criteria
 * @param file The image file to validate
 * @returns A Promise that resolves to a validation result object
 */
export async function validateImage(file: File): Promise<{
  valid: boolean;
  error?: string;
  dimensions?: { width: number; height: number };
  size: number;
}> {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file provided', size: 0 };
  }

  // Check file type
  const validTypes = [
    'image/webp',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/heic',
    'image/heif',
    // Common MIME types for iPhone photos
    'image/heic-sequence',
    'image/heif-sequence'
  ];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload a JPEG, PNG, GIF, WebP, or HEIC/HEIF image.',
      size: file.size
    };
  }

  // Check file size (max 10MB before compression)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 10MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      size: file.size
    };
  }

  try {
    // Get image dimensions
    const dimensions = await getImageDimensions(file);
    
    // Validate dimensions if needed
    // const MIN_DIMENSION = 200; // Minimum width or height
    // if (dimensions.width < MIN_DIMENSION || dimensions.height < MIN_DIMENSION) {
    //   return {
    //     valid: false,
    //     error: `Image dimensions too small. Minimum dimension: ${MIN_DIMENSION}px`,
    //     dimensions,
    //     size: file.size
    //   };
    // }

    return {
      valid: true,
      dimensions,
      size: file.size
    };
  } catch (error) {
    console.error('Error validating image:', error);
    return {
      valid: false,
      error: 'Failed to process image. The file may be corrupted.',
      size: file.size
    };
  }
}

/**
 * Gets the dimensions of an image file
 * @param file The image file
 * @returns A Promise that resolves to the image dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Clean up object URL to prevent memory leaks
      URL.revokeObjectURL(img.src);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
} 