'use client';

import { useState } from 'react';
import { useImageProcessing } from './helpers/useImageProcessing';
import { formatFileSize } from '@/lib/utils/images/image-process';

export function SimpleUploader({ onUpload }: { onUpload?: (file: File) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { processImageFile, isProcessing, processingStats } = useImageProcessing();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous state
    setError(null);
    
    try {
      // Process the image (compress and convert to WebP)
      const processedFile = await processImageFile(file);
      
      if (processedFile) {
        // Create a preview URL
        const previewUrl = URL.createObjectURL(processedFile);
        setPreview(previewUrl);
        
        // Call the upload handler with the processed file
        onUpload?.(processedFile);
      } else {
        setError('Failed to process image. Please try a different file.');
      }
    } catch (err) {
      console.error('Image processing error:', err);
      setError('An error occurred while processing the image.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="mb-4">
        <label 
          htmlFor="image-upload" 
          className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          {isProcessing ? (
            <span>Processing image...</span>
          ) : (
            <span>Click to select or drag and drop an image</span>
          )}
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
        </label>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {preview && (
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Processed Image Preview</h3>
          <div className="relative border rounded-lg overflow-hidden">
            <img src={preview} alt="Processed preview" className="w-full h-auto" />
          </div>
        </div>
      )}

      {processingStats.originalSize && processingStats.compressedSize && (
        <div className="mb-4 p-3 bg-green-50 rounded-md">
          <h3 className="text-lg font-medium mb-1">Compression Results</h3>
          <ul className="text-sm space-y-1">
            <li>Original: {formatFileSize(processingStats.originalSize)}</li>
            <li>Compressed: {formatFileSize(processingStats.compressedSize)}</li>
            {processingStats.compressionRatio && (
              <li>Reduced by {processingStats.compressionRatio.toFixed(1)}%</li>
            )}
            {processingStats.dimensions && (
              <li>Dimensions: {processingStats.dimensions.width}×{processingStats.dimensions.height}px</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
} 