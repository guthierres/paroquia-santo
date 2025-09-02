import React, { useState, useRef, useEffect } from 'react';
import { getUltraCompressedUrl, getDeviceOptimizedUrl } from '../../lib/cloudinary';

interface LazyImageProps {
  src: string;
  alt: string;
  publicId?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onClick?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  publicId,
  className = '',
  width,
  height,
  priority = false,
  onClick
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [imageSrc, setImageSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!priority && imgRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { 
          threshold: 0.1,
          rootMargin: '20px' // Margem muito reduzida
        }
      );

      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }
  }, [priority]);

  useEffect(() => {
    if (isInView) {
      // Usar versão ultra-comprimida se for thumbnail/preview
      if (publicId && (width || 0) <= 200) {
        setImageSrc(getUltraCompressedUrl(publicId, width || 100));
      } else if (publicId) {
        setImageSrc(getDeviceOptimizedUrl(publicId, width, height));
      } else {
        setImageSrc(src);
      }
    }
  }, [isInView, publicId, src, width, height]);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Placeholder ultra-simples */}
      {!isLoaded && isInView && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Imagem otimizada */}
      {isInView && imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          onLoad={() => setIsLoaded(true)}
          onClick={onClick}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            maxWidth: '100%',
            height: 'auto',
            imageRendering: 'auto'
          }}
        />
      )}
    </div>
  );
};