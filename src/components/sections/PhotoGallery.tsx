import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Folder, Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw, X, ArrowLeft, Eye } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase, PhotoAlbum, Photo } from '../../lib/supabase';

interface PhotoGalleryProps {
  onNavigateToFullGallery: () => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ onNavigateToFullGallery }) => {
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<PhotoAlbum | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Estado para controlar se estamos visualizando um álbum específico
  const [isViewingAlbum, setIsViewingAlbum] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    setIsLoading(true);
    try {
      const { data: albumsData, error: albumsError } = await supabase
        .from('photo_albums')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (albumsError) throw albumsError;
      
      if (albumsData && albumsData.length > 0) {
        setAlbums(albumsData);
      } else {
        // Álbuns padrão se não existirem
        const defaultAlbums: PhotoAlbum[] = [
          {
            id: '1',
            name: '40 Anos de História',
            description: 'Fotos históricas da paróquia desde sua fundação',
            cover_image_url: 'https://images.pexels.com/photos/6608313/pexels-photo-6608313.jpeg',
            cloudinary_public_id: null,
            is_active: true,
            order_index: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Celebrações Especiais',
            description: 'Momentos marcantes das principais celebrações',
            cover_image_url: 'https://images.pexels.com/photos/8468459/pexels-photo-8468459.jpeg',
            cloudinary_public_id: null,
            is_active: true,
            order_index: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Vida Comunitária',
            description: 'O dia a dia da nossa comunidade paroquial',
            cover_image_url: 'https://images.pexels.com/photos/7220900/pexels-photo-7220900.jpeg',
            cloudinary_public_id: null,
            is_active: true,
            order_index: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Eventos Especiais',
            description: 'Festividades e eventos marcantes da paróquia',
            cover_image_url: 'https://images.pexels.com/photos/8468456/pexels-photo-8468456.jpeg',
            cloudinary_public_id: null,
            is_active: true,
            order_index: 4,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setAlbums(defaultAlbums);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlbumPhotos = async (albumId: string) => {
    setIsLoadingPhotos(true);
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('album_id', albumId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setAlbumPhotos(data);
      } else {
        // Fotos de exemplo se não houver fotos no álbum
        const samplePhotos: Photo[] = [
          {
            id: `sample-1-${albumId}`,
            title: 'Foto de Exemplo 1',
            description: 'Esta é uma foto de exemplo do álbum',
            image_url: 'https://images.pexels.com/photos/8468459/pexels-photo-8468459.jpeg',
            cloudinary_public_id: null,
            category: 'community',
            album_id: albumId,
            created_at: new Date().toISOString()
          },
          {
            id: `sample-2-${albumId}`,
            title: 'Foto de Exemplo 2',
            description: 'Esta é outra foto de exemplo do álbum',
            image_url: 'https://images.pexels.com/photos/7220900/pexels-photo-7220900.jpeg',
            cloudinary_public_id: null,
            category: 'community',
            album_id: albumId,
            created_at: new Date().toISOString()
          },
          {
            id: `sample-3-${albumId}`,
            title: 'Foto de Exemplo 3',
            description: 'Mais uma foto de exemplo do álbum',
            image_url: 'https://images.pexels.com/photos/6608313/pexels-photo-6608313.jpeg',
            cloudinary_public_id: null,
            category: 'community',
            album_id: albumId,
            created_at: new Date().toISOString()
          }
        ];
        setAlbumPhotos(samplePhotos);
      }
    } catch (error) {
      console.error('Error fetching album photos:', error);
      setAlbumPhotos([]);
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  const handleAlbumClick = async (album: PhotoAlbum) => {
    setSelectedAlbum(album);
    setIsViewingAlbum(true);
    await fetchAlbumPhotos(album.id);
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
    setIsViewingAlbum(false);
    setAlbumPhotos([]);
    setSelectedPhoto(null);
  };

  const handlePhotoSelect = (photo: Photo) => {
    const index = albumPhotos.findIndex(p => p.id === photo.id);
    setCurrentPhotoIndex(index);
    setSelectedPhoto(photo);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleNextPhoto = () => {
    const nextIndex = (currentPhotoIndex + 1) % albumPhotos.length;
    setCurrentPhotoIndex(nextIndex);
    setSelectedPhoto(albumPhotos[nextIndex]);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handlePrevPhoto = () => {
    const prevIndex = (currentPhotoIndex - 1 + albumPhotos.length) % albumPhotos.length;
    setCurrentPhotoIndex(prevIndex);
    setSelectedPhoto(albumPhotos[prevIndex]);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

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
  }, [selectedPhoto, currentPhotoIndex, albumPhotos]);

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
    <section id="photos" className={`${isViewingAlbum ? 'pt-20 pb-8' : 'py-20'} bg-gray-50 min-h-screen`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header fixo quando visualizando álbum */}
        {isViewingAlbum && selectedAlbum && (
          <div className="fixed top-14 sm:top-16 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <Button
                    variant="outline"
                    onClick={handleBackToAlbums}
                    className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Voltar aos Álbuns</span>
                    <span className="sm:hidden">Voltar</span>
                  </Button>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                      {selectedAlbum.name}
                    </h1>
                    <p className="text-sm text-gray-600 truncate">
                      {albumPhotos.length} foto{albumPhotos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedAlbum ? (
          /* Albums Grid - Página Principal */
          <>
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
                Explore nossos álbuns com momentos especiais e memórias preciosas
              </p>
            </motion.div>

            {albums.length === 0 ? (
              <Card className="p-12 text-center">
                <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhum álbum encontrado
                </h3>
                <p className="text-gray-500">
                  Use o painel administrativo para criar álbuns de fotos
                </p>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {albums.slice(0, 4).map((album, index) => (
                    <motion.div
                      key={album.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => handleAlbumClick(album)}
                        className="w-full h-full text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-xl"
                      >
                        <Card className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full">
                          <div className="aspect-video overflow-hidden bg-gray-100 relative">
                            {album.cover_image_url ? (
                              <img
                                src={album.cover_image_url}
                                alt={album.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                style={{ 
                                  maxWidth: '100%',
                                  height: 'auto',
                                  imageRendering: 'auto'
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Folder className="h-16 w-16 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                  <Eye className="h-6 w-6 text-gray-800" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-800 transition-colors mb-2">
                              {album.name}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {album.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Criado em {new Date(album.created_at).toLocaleDateString('pt-BR')}
                              </span>
                              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                            </div>
                          </div>
                        </Card>
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Ver Todos os Álbuns Button */}
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
                    Ver Todos os Álbuns ({albums.length} álbuns)
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>

                {/* Mostrar mais álbuns na mesma página se houver */}
                {albums.length > 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mt-12"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Mais Álbuns</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {albums.slice(4).map((album, index) => (
                        <motion.div
                          key={album.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                          <button
                            onClick={() => handleAlbumClick(album)}
                            className="w-full h-full text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-xl"
                          >
                            <Card className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full">
                              <div className="aspect-video overflow-hidden bg-gray-100 relative">
                                {album.cover_image_url ? (
                                  <img
                                    src={album.cover_image_url}
                                    alt={album.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                    style={{ 
                                      maxWidth: '100%',
                                      height: 'auto',
                                      imageRendering: 'auto'
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Folder className="h-16 w-16 text-gray-400" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                      <Eye className="h-6 w-6 text-gray-800" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-800 transition-colors mb-2">
                                  {album.name}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                  {album.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    Criado em {new Date(album.created_at).toLocaleDateString('pt-BR')}
                                  </span>
                                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                </div>
                              </div>
                            </Card>
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </>
        ) : (
          /* Album Photos View - Visualização de Fotos do Álbum */
          <>
            {/* Espaçamento para o header fixo */}
            <div className="h-20 sm:h-24"></div>
            
            {selectedAlbum.description && (
              <div className="mb-8 text-center">
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {selectedAlbum.description}
                </p>
              </div>
            )}

            {isLoadingPhotos ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-800 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando fotos do álbum...</p>
              </div>
            ) : albumPhotos.length === 0 ? (
              <Card className="p-12 text-center">
                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhuma foto neste álbum
                </h3>
                <p className="text-gray-500">
                  Use o painel administrativo para adicionar fotos a este álbum
                </p>
              </Card>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
              >
                <AnimatePresence>
                  {albumPhotos.map((photo, index) => (
                    <motion.div
                      key={photo.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <button
                        onClick={() => handlePhotoSelect(photo)}
                        className="w-full h-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-xl"
                      >
                        <Card className="cursor-pointer group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                          <div className="aspect-square overflow-hidden relative bg-gray-100">
                            <img
                              src={photo.image_url}
                              alt={photo.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              style={{ 
                                maxWidth: '100%',
                                height: 'auto',
                                imageRendering: 'auto'
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/90 rounded-full flex items-center justify-center">
                                  <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-800" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-2 sm:p-3">
                            <h3 className="font-medium text-gray-800 text-xs sm:text-sm group-hover:text-red-800 transition-colors line-clamp-1">
                              {photo.title}
                            </h3>
                            <div className="flex items-center justify-between mt-1 sm:mt-2">
                              <span className="text-xs text-gray-500">
                                #{index + 1}
                              </span>
                            </div>
                          </div>
                        </Card>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
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
              onClick={() => setSelectedPhoto(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full h-full flex items-center justify-center p-4 sm:p-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Navigation Arrows */}
                {albumPhotos.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPhoto}
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 border-white/20 text-white hover:bg-black/70 rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0"
                    >
                      <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPhoto}
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 border-white/20 text-white hover:bg-black/70 rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0"
                    >
                      <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 rotate-180" />
                    </Button>
                  </>
                )}

                {/* Zoom Controls */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 flex gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    className="bg-black/50 border-white/20 text-white hover:bg-black/70 rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0"
                  >
                    <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    className="bg-black/50 border-white/20 text-white hover:bg-black/70 rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0"
                  >
                    <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetZoom}
                    className="bg-black/50 border-white/20 text-white hover:bg-black/70 rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0"
                  >
                    <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>

                {/* Close Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 bg-black/50 border-white/20 text-white hover:bg-black/70 rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>

                {/* Photo Counter */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm">
                  {currentPhotoIndex + 1} de {albumPhotos.length}
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
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <h3 className="text-lg sm:text-2xl font-bold flex-1">
                        {selectedPhoto.title}
                      </h3>
                      <span className="inline-block px-2 py-1 sm:px-3 text-xs sm:text-sm bg-red-600 rounded-full ml-2 sm:ml-4">
                        {selectedAlbum?.name}
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
