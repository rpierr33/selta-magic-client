// Carousel management service for admin panel
import { ImageType } from "@/components/carousel/useCarouselImages";

const CAROUSEL_STORAGE_KEY = 'selta_carousel_images';
const CAROUSEL_UPDATE_EVENT = 'carousel-images-updated';

// Default carousel images (fallback)
const defaultImages: ImageType[] = [
  { src: "/lovable-uploads/hair-oil.avif", alt: "Selta Magic Hair Oil - Strengthen & Nourish" },
  { src: "/lovable-uploads/soap.avif", alt: "Selta Magic Soap - Cleanse & Moisturize" },
  { src: "/lovable-uploads/hair-wig.avif", alt: "Luxurious Hair Wig" },
  { src: "/lovable-uploads/eye-cream.avif", alt: "Selta Magic Eye Cream" }
];

export class CarouselService {
  // Get all carousel images
  static getCarouselImages(): ImageType[] {
    try {
      const stored = localStorage.getItem(CAROUSEL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : defaultImages;
      }
      return defaultImages;
    } catch (error) {
      console.error('Error loading carousel images:', error);
      return defaultImages;
    }
  }

  // Save carousel images and notify listeners
  static saveCarouselImages(images: ImageType[]): void {
    try {
      localStorage.setItem(CAROUSEL_STORAGE_KEY, JSON.stringify(images));
      // Dispatch custom event to notify components of the update
      window.dispatchEvent(new CustomEvent(CAROUSEL_UPDATE_EVENT, { detail: images }));
    } catch (error) {
      console.error('Error saving carousel images:', error);
      throw new Error('Failed to save carousel images');
    }
  }

  // Subscribe to carousel updates
  static onCarouselUpdate(callback: (images: ImageType[]) => void): () => void {
    const handleUpdate = (event: CustomEvent) => {
      callback(event.detail);
    };
    
    window.addEventListener(CAROUSEL_UPDATE_EVENT, handleUpdate as EventListener);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener(CAROUSEL_UPDATE_EVENT, handleUpdate as EventListener);
    };
  }

  // Add a new image to the carousel
  static addImage(image: ImageType): ImageType[] {
    const currentImages = this.getCarouselImages();
    const newImages = [...currentImages, image];
    this.saveCarouselImages(newImages);
    return newImages;
  }

  // Remove an image from the carousel by index
  static removeImage(index: number): ImageType[] {
    const currentImages = this.getCarouselImages();
    if (index < 0 || index >= currentImages.length) {
      throw new Error('Invalid image index');
    }
    const newImages = currentImages.filter((_, i) => i !== index);
    this.saveCarouselImages(newImages);
    return newImages;
  }

  // Update an image in the carousel
  static updateImage(index: number, updatedImage: ImageType): ImageType[] {
    const currentImages = this.getCarouselImages();
    if (index < 0 || index >= currentImages.length) {
      throw new Error('Invalid image index');
    }
    const newImages = [...currentImages];
    newImages[index] = updatedImage;
    this.saveCarouselImages(newImages);
    return newImages;
  }

  // Reorder images in the carousel
  static reorderImages(fromIndex: number, toIndex: number): ImageType[] {
    const currentImages = this.getCarouselImages();
    if (fromIndex < 0 || fromIndex >= currentImages.length || 
        toIndex < 0 || toIndex >= currentImages.length) {
      throw new Error('Invalid image indices');
    }
    
    const newImages = [...currentImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    
    this.saveCarouselImages(newImages);
    return newImages;
  }

  // Initialize carousel with default images if not already set
  static initializeCarousel(): void {
    const stored = localStorage.getItem(CAROUSEL_STORAGE_KEY);
    if (!stored) {
      this.saveCarouselImages(defaultImages);
    }
  }
}
