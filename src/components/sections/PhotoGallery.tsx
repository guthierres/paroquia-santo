import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Heart, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase, Photo } from '../../lib/supabase';

export const PhotoGallery: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

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
    ? photos 
    : photos.filter(photo => photo.category === selectedCategory);

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
                    onClick={() => setSelectedPhoto(photo)}
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
        )}

        {/* Photo Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
              onClick={() => setSelectedPhoto(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-5xl max-h-[95vh] bg-white rounded-xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="outline" 
                  className="absolute top-4 right-4 z-10 bg-white/95 hover:bg-white shadow-lg"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
                
                <div className="flex flex-col max-h-[95vh]">
                  <div className="flex-1 overflow-hidden">
                    <img
                      src={selectedPhoto.image_url}
                      alt={selectedPhoto.title}
                      className="w-full h-full object-contain bg-gray-50"
                    />
                  </div>
                  
                  <div className="p-6 bg-white border-t border-gray-100">
                    <div className="max-w-2xl">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-2xl font-bold text-gray-800 flex-1">
                          {selectedPhoto.title}
                        </h3>
                        <span className="inline-block px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full ml-4">
                          {categories.find(c => c.id === selectedPhoto.category)?.label}
                        </span>
                      </div>
                      
                      {selectedPhoto.description && (
                        <p className="text-gray-600 leading-relaxed text-lg">
                          {selectedPhoto.description}
                        </p>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                          Adicionada em: {new Date(selectedPhoto.created_at).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
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