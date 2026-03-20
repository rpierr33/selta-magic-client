// Environment configuration for the application

export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5174/api',
  uploadUrl: import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5174',
  
  // Development settings
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Image settings
  maxImageSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
  
  // Default fallbacks
  placeholderImage: '/placeholder.svg',
  
  // Debug settings
  enableImageDebug: import.meta.env.DEV,
};

export default config;
