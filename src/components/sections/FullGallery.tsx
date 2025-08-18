import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Heart, Sparkles, Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw, ArrowLeft, Filter } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase, Photo } from '../../lib/supabase';

interface FullGalleryProps {
  onBack: () => void;
}

export const FullGallery: React.FC<FullGalleryProps> = ({ onBack }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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
        // Sample photos usando Pexels se não houver dados
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
          },
          {
            id: '7',
            title: 'Batismo Coletivo',
            description: 'Cerimônia de batismo de várias crianças',
            image_url: 'https://images.pexels.com/photos/8468502/pexels-photo-8468502.jpeg',
            category: 'events',
            created_at: new Date().toISOString()
          },
          {
            id: '8',
            title: 'Procissão de Corpus Christi',
            description: 'Tradicional procissão pelas ruas da cidade',
            image_url: 'https://images.pexels.com/photos/8468461/pexels-photo-8468461.jpeg',
            category: 'celebrations',
            created_at: new Date().toISOString()
          },
          {
            id: '9',
            title: 'Grupo de Jovens',
            description: 'Encontro dos jovens da paróquia',
            image_url: 'https://images.pexels.com/photos/7220901/pexels-photo-7220901.jpeg',
            category: 'community',
            created_at: new Date().toISOString()
          },
          {
            id: '10',
            title: 'Altar Decorado',
            description: 'Decoração especial para as festividades',
            image_url: 'https://images.pexels.com/photos/6608314/pexels-photo-6608314.jpeg',
            category: 'celebrations',
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
    ? photos
    : photos.filter(photo => photo.category === selectedCategory);

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
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handlePrevPhoto = () => {
    const prevIndex = (currentPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setCurrentPhotoIndex(prevIndex);
    setSelectedPhoto(filteredPhotos[prevIndex]);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
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
  }, [selectedPhoto, currentPhotoIndex]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando galeria completa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Galeria Completa</h1>
                <p className="text-sm text-gray-600">
                  {filteredPhotos.length} foto{filteredPhotos.length !== 1 ? 's' : ''} 
                  {selectedCategory !== 'all' && ` em ${categories.find(c => c.id === selectedCategory)?.label}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Filtrar:</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'primary' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
              size="sm"
            >
              <category.icon className="h-4 w-4" />
              {category.label}
              <span className="ml-1 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                {category.id === 'all' ? photos.length : photos.filter(p => p.category === category.id).length}
              </span>
            </Button>
          ))}
        </div>

        {/* Photo Grid */}
        {filteredPhotos.length === 0 ? (
          <Card className="p-12 text-center">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhuma foto nesta categoria
            </h3>
            <p className="text-gray-500">
              Selecione outra categoria ou adicione fotos através do painel administrativo
            </p>
          </Card>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            <AnimatePresence>
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className="cursor-pointer group overflow-hidden hover:shadow-lg transition-all duration-300"
                    onClick={() => handlePhotoSelect(photo)}
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={photo.image_url}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                            <ZoomIn className="h-6 w-6 text-gray-800" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-800 text-sm group-hover:text-red-800 transition-colors line-clamp-1">
                        {photo.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          {categories.find(c => c.id === photo.category)?.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Photo Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            >
              {/* Navigation Arrows */}
              {filteredPhotos.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPhoto}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 border-white/20 text-white hover:bg-black/70 rounded-full w-12 h-12 p-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPhoto}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 border-white/20 text-white hover:bg-black/70 rounded-full w-12 h-12 p-0"
                  >
                    <ArrowLeft className="h-5 w-5 rotate-180" />
                  </Button>
                </>
              )}

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

              {/* Photo Counter */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                {currentPhotoIndex + 1} de {filteredPhotos.length}
              </div>

              {/* Image Container */}
              <div 
                className="relative w-full h-full flex items-center justify-center overflow-hidden p-4"
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
                    maxHeight: '85vh',
                    maxWidth: '85vw'
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
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      Adicionada em: {new Date(selectedPhoto.created_at).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      Use ← → para navegar | ESC para fechar
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};