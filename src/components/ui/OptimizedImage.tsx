import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getCachedImageUrl } from '../../lib/supabase';
import { getCloudinaryUrl, getCloudinaryConfig } from '../../lib/cloudinary';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
  onError?: () => void;
  publicId?: string;
  priority?: boolean; // For critical images
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 75,
  className = '',
  loading = 'lazy',
  onClick,
  onError,
  publicId,
  priority = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority || loading === 'eager');
  const [optimizedSrc, setOptimizedSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Memoized URL generation
  const generateOptimizedUrl = useCallback(async () => {
    if (!src) return '';

    const config = await getCloudinaryConfig();
    
    // Priority 1: Cloudinary if available
    if (publicId) {
      try {
        if (config.enabled && config.cloudName) {
          return getCloudinaryUrl(publicId, {
            width,
            height,
            quality,
            format: 'auto',
            crop: 'fill'
          });
        }
      } catch (error) {
        console.warn('Cloudinary failed, using fallback:', error);
      }
    }
    
    // Priority 2: Supabase with aggressive caching (only if enabled)
    if (src.includes('supabase') && config.supabaseStorageEnabled) {
      return getCachedImageUrl(src, { width, height, quality });
    } else if (src.includes('supabase') && !config.supabaseStorageEnabled) {
      // Se Supabase Storage está desabilitado, não carrega imagens do Supabase
      console.warn('Supabase Storage desabilitado, imagem ignorada:', src);
      return '';
    }

    // Priority 3: External URLs (no optimization)
    return src;
  }, [src, publicId, width, height, quality]);

  // Generate optimized URL
  useEffect(() => {
    generateOptimizedUrl().then(setOptimizedSrc);
  }, [generateOptimizedUrl]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: priority ? '0px' : '100px' // Preload critical images immediately
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => observerRef.current?.disconnect();
  }, [loading, priority]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Error fallback
  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Imagem não disponível</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={imgRef}>
      {/* Loading placeholder */}
      {!isLoaded && isInView && optimizedSrc && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Actual image */}
      {isInView && optimizedSrc && (
        <img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          onClick={onClick}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      )}
    </div>
  );
};