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
        // Sample photos using Pexels if no data exists
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
    setSelectedPhoto(photo);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
                    <Card 
                      className="cursor-pointer group overflow-hidden"
                      onClick={() => handlePhotoSelect(photo)}
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={photo.image_url}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 group-hover:text-red-800 transition-colors">
                          {photo.title}
                        </h3>
                        {photo.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{photo.description}</p>
                        )}
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
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
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            >
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

              {/* Close Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-20 bg-black/50 border-white/20 text-white hover:bg-black/70 rounded-full w-10 h-10 p-0"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Image Container */}
              <div 
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
              >
                <img
                  src={selectedPhoto.image_url}
                  alt={selectedPhoto.title}
                  className="max-w-none transition-transform duration-200 select-none"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                    maxHeight: '90vh',
                    maxWidth: '90vw'
                  }}
                  draggable={false}
                />
              </div>

              {/* Photo Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold flex-1">
                      {selectedPhoto.title}
                    </h3>
                    <span className="inline-block px-3 py-1 text-sm bg-red-600 rounded-full ml-4">
                      {categories.find(c => c.id === selectedPhoto.category)?.label}
                    </span>
                  </div>
                  
                  {selectedPhoto.description && (
                    <p className="text-gray-200 leading-relaxed mb-3">
                      {selectedPhoto.description}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-400">
                    Adicionada em: {new Date(selectedPhoto.created_at).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Use os controles de zoom ou arraste a imagem para navegar
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};