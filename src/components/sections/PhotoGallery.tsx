import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Heart, Sparkles, Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase, Photo } from '../../lib/supabase';

interface PhotoGalleryProps {
  onNavigateToFullGallery: () => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ onNavigateToFullGallery }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const categories = [
    { id: 'all', label: 'Todas', icon: Sparkles },
    { id: 'history', label: 'História', icon: Calendar },
    { id: 'events', label: 'Eventos', icon: Users },
    { id: 'celebrations', label: 'Celebrações', icon: Heart },
    { id: 'community', label: 'Comunidade', icon: Users }
  ];

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Preload first 3 images for better UX
  useEffect(() => {
    if (photos.length > 0) {
      const preloadUrls = photos.slice(0, 3).map(photo => photo.image_url);
      preloadUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    }
  }, [photos]);

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setPhotos(data);
      } else {
        const samplePhotos: Photo[] = [
          {
            id: '1',
            title: 'Celebração dos 40 Anos',
            description: 'Missa especial comemorativa dos 40 anos da paróquia',
            image_url: 'https://images.pexels.com/photos/8468459/pexels-photo-8468459.jpeg',
            category: 'celebrations',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Comunidade Unida',
            description: 'Fiéis reunidos em oração e comunhão',
            image_url: 'https://images.pexels.com/photos/7220900/pexels-photo-7220900.jpeg',
            category: 'community',
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Interior da Igreja',
            description: 'Nosso belo altar e espaço sagrado',
            image_url: 'https://images.pexels.com/photos/6608313/pexels-photo-6608313.jpeg',
            category: 'history',
            created_at: new Date().toISOString()
          },
          {
            id: '4',
            title: 'Primeira Comunhão',
            description: 'Crianças recebendo o sacramento da Eucaristia',
            image_url: 'https://images.pexels.com/photos/8468498/pexels-photo-8468498.jpeg',
            category: 'events',
            created_at: new Date().toISOString()
          },
          {
            id: '5',
            title: 'Fachada da Paróquia',
            description: 'Vista externa do nosso templo',
            image_url: 'https://images.pexels.com/photos/14751274/pexels-photo-14751274.jpeg',
            category: 'history',
            created_at: new Date().toISOString()
          },
          {
            id: '6',
            title: 'Coro Paroquial',
            description: 'Grupo de canto da nossa comunidade',
            image_url: 'https://images.pexels.com/photos/8468456/pexels-photo-8468456.jpeg',
            category: 'community',
            created_at: new Date().toISOString()
          }
        ];
        setPhotos(samplePhotos);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPhotos = selectedCategory === 'all'
    ? photos.slice(0, 6)
    : photos.filter(photo => photo.category === selectedCategory).slice(0, 6);

  const totalPhotosInCategory = selectedCategory === 'all'
    ? photos.length
    : photos.filter(photo => photo.category === selectedCategory).length;

  const hasMorePhotos = totalPhotosInCategory > 6;

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handlePhotoSelect = (photo: Photo) => {
    const index = filteredPhotos.findIndex(p => p.id === photo.id);
    setCurrentPhotoIndex(index);
    setSelectedPhoto(photo);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleNextPhoto = () => {
    const nextIndex = (currentPhotoIndex + 1) % filteredPhotos.length;
    setCurrentPhotoIndex(nextIndex);
    setSelectedPhoto(filteredPhotos[nextIndex]);
    handleResetZoom();
  };

  const handlePrevPhoto = () => {
    const prevIndex = (currentPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setCurrentPhotoIndex(prevIndex);
    setSelectedPhoto(filteredPhotos[prevIndex]);
    handleResetZoom();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedPhoto) {
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'ArrowLeft') handlePrevPhoto();
      if (e.key === 'Escape') setSelectedPhoto(null);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, currentPhotoIndex, filteredPhotos]);

  if (isLoading) {
    return (
      <section id="photos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando galeria...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="photos" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent mb-4">
            Galeria de Fotos
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Momentos especiais e memórias preciosas da nossa comunidade
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'primary' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <category.icon className="h-4 w-4" />
              {category.label}
            </Button>
          ))}
        </div>

        {/* Photo Grid */}
        {filteredPhotos.length === 0 ? (
          <Card className="p-12 text-center">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {selectedCategory === 'all' ? 'Nenhuma foto encontrada' : 'Nenhuma foto nesta categoria'}
            </h3>
            <p className="text-gray-500">
              Use o painel administrativo para adicionar fotos da paróquia
            </p>
          </Card>
        ) : (
          <>
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
            >
              <AnimatePresence>
                {filteredPhotos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="group overflow-hidden">
                      <div className="aspect-square overflow-hidden relative cursor-pointer" onClick={() => handlePhotoSelect(photo)}>
                        <img
                          src={photo.image_url}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-2 sm:p-3 md:p-4">
                        <h3 className="font-semibold text-gray-800 group-hover:text-red-800 transition-colors text-sm sm:text-base line-clamp-1">
                          {photo.title}
                        </h3>
                        {photo.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 hidden sm:block">{photo.description}</p>
                        )}
                        <div className="mt-1 sm:mt-2">
                          <span className="inline-block px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            {categories.find(c => c.id === photo.category)?.label}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Ver Mais Button */}
            {hasMorePhotos && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mt-12"
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onNavigateToFullGallery}
                  className="flex items-center gap-2"
                >
                  Ver Galeria Completa ({totalPhotosInCategory} fotos)
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </>
        )}

        {/* Photo Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
              onClick={() => setSelectedPhoto(null)} // Fechar ao clicar fora do conteúdo da imagem
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full h-full flex items-center justify-center p-4 sm:p-8"
                onClick={(e) => e.stopPropagation()} // Impede que o clique no conteúdo feche o modal
              >

                {/* Navigation Arrows */}
                {filteredPhotos.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPhoto}
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 border-white/20 text-white hover:bg-black/70 rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0"
                    >
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 rotate-180" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPhoto}
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 border-white/20 text-white hover:bg-black/70 rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0"
                    >
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </>
                )}

                {/* Close Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 bg-black/50 border-white/20 text-white hover:bg-black/70 rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>

                {/* Zoom Controls */}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    className="bg-black/50 border-white/20 text-white hover:bg-black/70 rounded-full w-10 h-10 p-0"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    className="bg-black/50 border-white/20 text-white hover:bg-black/70 rounded-full w-10 h-10 p-0"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetZoom}
                    className="bg-black/50 border-white/20 text-white hover:bg-black/70 rounded-full w-10 h-10 p-0"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Photo Counter */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm">
                  {currentPhotoIndex + 1} de {filteredPhotos.length}
                </div>

                {/* Image Container */}
                <div
                  className="relative w-full h-full flex items-center justify-center overflow-hidden"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                >
                  <motion.img
                    key={selectedPhoto.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={selectedPhoto.image_url}
                    alt={selectedPhoto.title}
                    className="max-w-full max-h-full object-contain select-none"
                    style={{
                      transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                      maxHeight: '90vh',
                      maxWidth: '90vw',
                    }}
                    draggable={false}
                  />
                </div>

                {/* Photo Info Overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 sm:p-6 text-white"
                  onClick={(e) => e.stopPropagation()} // Impede que o clique no overlay feche o modal
                >
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <h3 className="text-lg sm:text-2xl font-bold flex-1">
                        {selectedPhoto.title}
                      </h3>
                      <span className="inline-block px-2 py-1 sm:px-3 text-xs sm:text-sm bg-red-600 rounded-full ml-2 sm:ml-4">
                        {categories.find(c => c.id === selectedPhoto.category)?.label}
                      </span>
                    </div>

                    {selectedPhoto.description && (
                      <p className="text-gray-200 leading-relaxed mb-2 sm:mb-3 text-sm sm:text-base">
                        {selectedPhoto.description}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-xs sm:text-sm text-gray-400">
                        Adicionada em: {new Date(selectedPhoto.created_at).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>

                      <p className="text-xs text-gray-500 hidden sm:block">
                        Use ← → para navegar | ESC para fechar
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
