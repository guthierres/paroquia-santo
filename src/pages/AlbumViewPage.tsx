import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase, PhotoAlbum, Photo } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AlbumViewPageProps {
  slug: string;
  onBack: () => void;
}

export const AlbumViewPage: React.FC<AlbumViewPageProps> = ({ slug, onBack }) => {
  const [album, setAlbum] = useState<PhotoAlbum | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchAlbumAndPhotos();
  }, [slug]);

  const fetchAlbumAndPhotos = async () => {
    try {
      setLoading(true);

      const { data: albumData, error: albumError } = await supabase
        .from('photo_albums')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (albumError) throw albumError;

      if (!albumData) {
        toast.error('Álbum não encontrado');
        onBack();
        return;
      }

      setAlbum(albumData);

      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .eq('album_id', albumData.id)
        .order('created_at', { ascending: false });

      if (photosError) throw photosError;
      setPhotos(photosData || []);
    } catch (error) {
      console.error('Error fetching album:', error);
      toast.error('Erro ao carregar álbum');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="h-8 w-8 animate-spin text-red-800" />
      </div>
    );
  }

  if (!album) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="outline"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {album.name}
          </h1>
          {album.description && (
            <p className="text-gray-600 text-lg">
              {album.description}
            </p>
          )}
        </motion.div>

        {photos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Este álbum ainda não possui fotos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setSelectedPhotoIndex(index)}
              >
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedPhotoIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedPhotoIndex(null)}
            >
              <button
                onClick={() => setSelectedPhotoIndex(null)}
                className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full p-2"
              >
                <X className="h-6 w-6" />
              </button>

              {selectedPhotoIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevPhoto();
                  }}
                  className="absolute left-4 text-white hover:bg-white/10 rounded-full p-2"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
              )}

              {selectedPhotoIndex < photos.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextPhoto();
                  }}
                  className="absolute right-4 text-white hover:bg-white/10 rounded-full p-2"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              )}

              <div className="max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
                <img
                  src={photos[selectedPhotoIndex].image_url}
                  alt={photos[selectedPhotoIndex].title}
                  className="w-full h-full object-contain"
                />
                {photos[selectedPhotoIndex].title && (
                  <div className="text-white text-center mt-4">
                    <p className="text-lg font-semibold">{photos[selectedPhotoIndex].title}</p>
                    {photos[selectedPhotoIndex].description && (
                      <p className="text-sm text-gray-300 mt-2">
                        {photos[selectedPhotoIndex].description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
