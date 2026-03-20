// Utility functions for handling product images consistently across the app
import config from '@/config/environment';

/**
 * Resolves the correct image URL for a product image
 * Handles different image path formats and provides fallbacks
 */
export const resolveImageUrl = (imagePath: string | null | undefined): string => {
  // Return placeholder if no image path provided
  if (!imagePath || imagePath.trim() === '') {
    return config.placeholderImage;
  }

  // If it's already a full URL (starts with http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it starts with /uploads, prepend the base URL from API config
  if (imagePath.startsWith('/uploads')) {
    // Use the API base URL but remove '/api' to get the base domain
    const baseUrl = config.apiBaseUrl.replace('/api', '');
    return `${baseUrl}${imagePath}`;
  }

  // If it starts with /lovable-uploads (static assets), return as is
  if (imagePath.startsWith('/lovable-uploads')) {
    return imagePath;
  }

  // If it's a relative path without leading slash, assume it's from uploads
  if (!imagePath.startsWith('/')) {
    const baseUrl = config.apiBaseUrl.replace('/api', '');
    return `${baseUrl}/uploads/${imagePath}`;
  }

  // If it starts with / but not /uploads or /lovable-uploads, try as upload path
  if (imagePath.startsWith('/') && !imagePath.startsWith('/uploads') && !imagePath.startsWith('/lovable-uploads')) {
    const baseUrl = config.apiBaseUrl.replace('/api', '');
    return `${baseUrl}${imagePath}`;
  }

  // Default case - return the path as is
  return imagePath;
};

/**
 * Creates an error handler for image loading failures
 * Provides consistent fallback behavior
 */
export const createImageErrorHandler = (fallbackSrc: string = config.placeholderImage) => {
  return (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    console.error('Image failed to load:', target.src);
    
    if (target.src !== fallbackSrc) {
      target.src = fallbackSrc;
    }
  };
};

/**
 * Validates if an image file is acceptable for upload
 */
export const isValidImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

/**
 * Gets a human-readable error message for invalid image files
 */
export const getImageValidationError = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type. Please upload a JPEG, PNG, GIF, WebP, or AVIF image.';
  }
  
  if (file.size > maxSize) {
    return 'File size too large. Please upload an image smaller than 5MB.';
  }
  
  return null;
};
