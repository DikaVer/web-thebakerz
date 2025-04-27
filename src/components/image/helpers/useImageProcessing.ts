'use client';

import { useState } from 'react';
import { processImage } from '@/lib/utils/processImage';
import { formatFileSize } from '@/lib/utils/processImage';

/**
 * Options for image processing
 */
export interface ImageProcessingOptions {
  preserveFormat?: boolean;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

/**
 * A custom hook to handle image processing in React components
 */
export function useImageProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStats, setProcessingStats] = useState<{
    originalSize?: number;
    compressedSize?: number;
    compressionRatio?: number;
    dimensions?: { width: number; height: number };
  }>({});

  /**
   * Process an image file (compress and convert to WebP)
   * @param file The image file to process
   * @param options Processing options
   * @returns Processed file or null if processing failed
   */
  const processImageFile = async (
    file: File, 
    options: ImageProcessingOptions = {}
  ): Promise<File | null> => {
    if (!file) return null;
    
    setIsProcessing(true);
    try {
      const result = await processImage(file, options);
      
      if (result.file && result.originalSize && result.compressedSize) {
        const compressionRatio = (1 - result.compressedSize / result.originalSize) * 100;
        
        setProcessingStats({
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          compressionRatio,
          dimensions: result.dimensions
        });

        if (process.env.NODE_ENV === 'development') {
          console.log(`Image processed successfully:
            - Original: ${formatFileSize(result.originalSize)}
            - Compressed: ${formatFileSize(result.compressedSize)}
            - Reduction: ${compressionRatio.toFixed(1)}%
            ${result.dimensions ? `- Dimensions: ${result.dimensions.width}x${result.dimensions.height}px` : ''}
          `);
        }
      }
      
      return result.file;
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Process an image from a file input event
   * @param event File input change event
   * @param options Processing options
   * @returns Processed file or null
   */
  const processImageFromEvent = async (
    event: React.ChangeEvent<HTMLInputElement>,
    options: ImageProcessingOptions = {}
  ): Promise<File | null> => {
    const file = event.target.files?.[0];
    if (!file) return null;
    
    return await processImageFile(file, options);
  };

  return {
    processImageFile,
    processImageFromEvent,
    isProcessing,
    processingStats,
  };
} 