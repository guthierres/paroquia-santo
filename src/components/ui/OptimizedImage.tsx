import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getCachedImageUrl } from '../../lib/supabase';
import { getCloudinaryUrl, getCloudinaryConfig, getDeviceOptimizedUrl, getUltraCompressedUrl } from '../../lib/cloudinary';

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
  priority?: boolean;
  ultraCompress?: boolean; // Nova prop para máxima compressão
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 35, // REDUZIDO de 75 para 35
  className = '',
  loading = 'lazy',
  onClick,
  onError,
  publicId,
  priority = false,
  ultraCompress = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority || loading === 'eager');
  const [optimizedSrc, setOptimizedSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Memoized URL generation com MÁXIMA OTIMIZAÇÃO
  const generateOptimizedUrl = useCallback(async () => {
    if (!src) return '';

    const config = await getCloudinaryConfig();
    
    // Priority 1: Cloudinary com otimização extrema
    if (publicId) {
      try {
        if (config.enabled && config.cloudName) {
          // Usar ultra-compressão se solicitado
          if (ultraCompress) {
            return getUltraCompressedUrl(publicId, Math.min(width || 100, 100));
          }
          
          // Usar otimização baseada no dispositivo
          return getDeviceOptimizedUrl(publicId, width, height);
        }
      } catch (error) {
        console.warn('Cloudinary failed, using fallback:', error);
      }
    }
    
    // Priority 2: Supabase com cache agressivo (apenas se habilitado)
    if (src.includes('supabase') && config.supabaseStorageEnabled) {
      // REDUZIR qualidade para Supabase também
      return getCachedImageUrl(src, { 
        width: Math.min(width || 400, 400), 
        height: Math.min(height || 400, 400), 
        quality: Math.min(quality, 30) // Máximo 30% de qualidade
      });
    } else if (src.includes('supabase') && !config.supabaseStorageEnabled) {
      console.warn('Supabase Storage desabilitado, imagem ignorada:', src);
      return '';
    }

    // Priority 3: URLs externas (sem otimização)
    return src;
  }, [src, publicId, width, height, quality, ultraCompress]);

  // Generate optimized URL
  useEffect(() => {
    generateOptimizedUrl().then(setOptimizedSrc);
  }, [generateOptimizedUrl]);

  // Intersection Observer com margem REDUZIDA para economizar
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
        rootMargin: priority ? '0px' : '50px' // REDUZIDO de 100px para 50px
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
      {/* Loading placeholder SIMPLIFICADO */}
      {!isLoaded && isInView && optimizedSrc && (
        <div 
          className="absolute inset-0 bg-gray-200 flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
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