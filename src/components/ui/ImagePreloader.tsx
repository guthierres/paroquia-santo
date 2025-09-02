import { useEffect } from 'react';
import { preloadCriticalImages } from '../../lib/cloudinary';

interface ImagePreloaderProps {
  publicIds: string[];
  priority?: boolean;
}

export const ImagePreloader: React.FC<ImagePreloaderProps> = ({ 
  publicIds, 
  priority = false 
}) => {
  useEffect(() => {
    if (priority && publicIds.length > 0) {
      // Preload apenas as 3 primeiras imagens para economizar
      const criticalIds = publicIds.slice(0, 3);
      preloadCriticalImages(criticalIds, 1); // Máximo 1 por vez para não sobrecarregar
    }
  }, [publicIds, priority]);

  return null; // Componente invisível
};