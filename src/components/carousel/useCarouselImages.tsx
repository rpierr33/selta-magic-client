
import { useState, useEffect, useRef } from "react";
import { CarouselService } from "@/services/carouselService";

export interface ImageType {
  src: string;
  alt: string;
}

export function useCarouselImages() {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [images, setImages] = useState<ImageType[]>([]);
  const loadingRef = useRef<number>(0);

  // Initialize carousel service and load images
  useEffect(() => {
    CarouselService.initializeCarousel();
    const carouselImages = CarouselService.getCarouselImages();
    setImages(carouselImages);

    // Subscribe to carousel updates for real-time changes
    const unsubscribe = CarouselService.onCarouselUpdate((updatedImages) => {
      setImages(updatedImages);
      // Reset loading states when images change
      setImagesLoaded(false);
      setAllImagesLoaded(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Only preload if we have images
    if (images.length === 0) return;
    
    // To ensure we don't get race conditions with reloads
    const currentLoadingRef = loadingRef.current;
    
    const preloadHighPriority = async () => {
      try {
        // Preload first 3 images with high priority
        const highPriorityImages = images.slice(0, 3);
        await Promise.all(highPriorityImages.map(image => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.src = image.src;
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        }));
        
        if (loadingRef.current === currentLoadingRef) {
          setImagesLoaded(true);
          // High priority images loaded
        }
        
        // Then load the rest
        const remainingImages = images.slice(3);
        await Promise.all(remainingImages.map(image => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.src = image.src;
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        }));
        
        if (loadingRef.current === currentLoadingRef) {
          setAllImagesLoaded(true);
          // All carousel images loaded
        }
      } catch (error) {
        console.error('Error loading carousel images:', error);
        // Fallback to considering images loaded even if there was an error
        if (loadingRef.current === currentLoadingRef) {
          setImagesLoaded(true);
        }
      }
    };
    
    preloadHighPriority();
    
    return () => {
      // Increment to cancel any in-progress loading when component unmounts
      loadingRef.current += 1;
    };
  }, [images]);

  return { images, imagesLoaded, allImagesLoaded };
}
