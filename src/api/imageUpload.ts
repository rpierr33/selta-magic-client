// Image upload utility for uploading to backend API

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const uploadImageToLocal = async (file: File): Promise<string> => {
  try {
    // Validate file before upload
    validateImageFile(file);
    
    // Get auth token
    const token = localStorage.getItem('auth_token');
    console.log('Auth token for image upload:', token ? 'Token found' : 'No token found');
    console.log('Token value:', token);
    
    if (!token) {
      throw new Error('Authentication required');
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('image', file);

    console.log('Uploading to:', `${API_BASE_URL}/upload-image`);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });

    // Upload to backend API
    const response = await fetch(`${API_BASE_URL}/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    console.log('Upload response status:', response.status);
    console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Upload error response:', errorData);
      throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();
    console.log('Upload result:', result);
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    console.log('Image uploaded successfully:', result);
    
    // Return the image path that can be used to display the image
    return result.imagePath;
    
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload image');
  }
};

// Helper function to validate image files
export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
  }
  
  if (file.size > maxSize) {
    throw new Error('File size too large. Please upload an image smaller than 5MB.');
  }
  
  return true;
};
