import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, Save, X, Image as ImageIcon, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FileUpload } from '../ui/FileUpload';
import { supabase, Photo } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const PhotoManager: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  const categories = [
    { id: 'history', label: 'História' },
    { id: 'events', label: 'Eventos' },
    { id: 'celebrations', label: 'Celebrações' },
    { id: 'community', label: 'Comunidade' }
  ];

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setPhotos(data);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    await processFiles(files);
  };

  const handleFilesSelected = async (files: FileList | null) => {
    await processFiles(files);
  };

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} não é uma imagem válida`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} é muito grande (máximo 10MB)`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `photo-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `photos/${fileName}`;

        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('parish-photos')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Erro ao carregar ${file.name}`);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('parish-photos')
          .getPublicUrl(filePath);

        // Insert into database
        const { data, error } = await supabase
          .from('photos')
          .insert([
            {
              title: file.name.split('.')[0],
              description: '',
              image_url: urlData.publicUrl,
              category: 'community'
            }
          ])
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          toast.error(`Erro ao salvar ${file.name}`);
          continue;
        }

        setPhotos(prev => [data, ...prev]);
      }

      toast.success('Fotos carregadas com sucesso!');
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Erro ao carregar fotos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) return;

    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);

      if (error) throw error;

      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      toast.success('Foto excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Erro ao excluir foto');
    }
  };

  const handleUpdatePhoto = async () => {
    if (!editingPhoto) return;

    try {
      const { error } = await supabase
        .from('photos')
        .update({
          title: editingPhoto.title,
          description: editingPhoto.description,
          category: editingPhoto.category
        })
        .eq('id', editingPhoto.id);

      if (error) throw error;

      setPhotos(prev => prev.map(p => 
        p.id === editingPhoto.id ? editingPhoto : p
      ));
      setEditingPhoto(null);
      toast.success('Foto atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error('Erro ao atualizar foto');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Gerenciar Fotos</h3>
        <div>
          <FileUpload
            onFileSelect={handleFilesSelected}
            accept="image/*"
            multiple
            disabled={isUploading}
          >
            <Button variant="primary" disabled={isUploading}>
              <ImageIcon className="h-4 w-4" />
              {isUploading ? 'Carregando...' : 'Adicionar Fotos'}
            </Button>
          </FileUpload>
        </div>
      </div>

      {photos.length === 0 && (
        <Card className="p-8 text-center">
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhuma foto encontrada
          </h4>
          <p className="text-gray-500 mb-4">
            Comece adicionando algumas fotos da paróquia
          </p>
          <input
            id="photo-upload-empty"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => processFiles(e.target.files)}
            className="hidden"
          />
          <label htmlFor="photo-upload-empty" className="cursor-pointer">
            <Button variant="primary">
              <Upload className="h-4 w-4" />
              Adicionar Primeira Foto
            </Button>
          </label>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 text-sm mb-1 truncate">
                    {photo.title}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    {categories.find(c => c.id === photo.category)?.label}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPhoto(photo)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePhoto(photo)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingPhoto && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Editar Foto</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPhoto(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <img
                    src={editingPhoto.image_url}
                    alt={editingPhoto.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editingPhoto.title}
                    onChange={(e) => setEditingPhoto(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Título da foto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={editingPhoto.description || ''}
                    onChange={(e) => setEditingPhoto(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Descrição da foto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={editingPhoto.category}
                    onChange={(e) => setEditingPhoto(prev => prev ? { ...prev, category: e.target.value as Photo['category'] } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingPhoto(null)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleUpdatePhoto}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
