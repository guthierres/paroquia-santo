import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, ArrowUp, ArrowDown, Eye, EyeOff, Folder } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FileUpload } from '../ui/FileUpload';
import { supabase, PhotoAlbum } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const AlbumManager: React.FC = () => {
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [editingAlbum, setEditingAlbum] = useState<PhotoAlbum | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('photo_albums')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data) setAlbums(data);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const handleCreateAlbum = () => {
    const newAlbum: PhotoAlbum = {
      id: '',
      name: '',
      description: '',
      cover_image_url: null,
      cloudinary_public_id: null,
      is_active: true,
      order_index: albums.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingAlbum(newAlbum);
    setIsCreating(true);
  };

  const handleSaveAlbum = async () => {
    if (!editingAlbum || !editingAlbum.name) {
      toast.error('Preencha o nome do álbum');
      return;
    }

    try {
      const albumData = {
        name: editingAlbum.name,
        description: editingAlbum.description,
        cover_image_url: editingAlbum.cover_image_url,
        cloudinary_public_id: editingAlbum.cloudinary_public_id,
        is_active: editingAlbum.is_active,
        order_index: editingAlbum.order_index,
        updated_at: new Date().toISOString()
      };

      if (isCreating) {
        const newOrderIndex = albums.length > 0 ? Math.max(...albums.map(a => a.order_index)) + 1 : 0;
        const { data, error } = await supabase
          .from('photo_albums')
          .insert([{ ...albumData, order_index: newOrderIndex }])
          .select()
          .single();

        if (error) throw error;
        setAlbums(prev => [...prev, data].sort((a, b) => a.order_index - b.order_index));
      } else {
        const { error } = await supabase
          .from('photo_albums')
          .update(albumData)
          .eq('id', editingAlbum.id);

        if (error) throw error;
        setAlbums(prev => prev.map(a =>
          a.id === editingAlbum.id ? { ...editingAlbum, ...albumData } : a
        ));
      }

      setEditingAlbum(null);
      setIsCreating(false);
      toast.success('Álbum salvo com sucesso!');
    } catch (error) {
      console.error('Error saving album:', error);
      toast.error('Erro ao salvar álbum');
    }
  };

  const handleDeleteAlbum = async (album: PhotoAlbum) => {
    if (!confirm('Tem certeza que deseja excluir este álbum? As fotos não serão excluídas, apenas desassociadas do álbum.')) return;

    try {
      const { error } = await supabase
        .from('photo_albums')
        .delete()
        .eq('id', album.id);

      if (error) throw error;
      setAlbums(prev => prev.filter(a => a.id !== album.id));
      toast.success('Álbum excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting album:', error);
      toast.error('Erro ao excluir álbum');
    }
  };

  const handleToggleActive = async (album: PhotoAlbum) => {
    try {
      const { error } = await supabase
        .from('photo_albums')
        .update({ 
          is_active: !album.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', album.id);

      if (error) throw error;
      setAlbums(prev => prev.map(a =>
        a.id === album.id ? { ...a, is_active: !a.is_active } : a
      ));
      toast.success('Status atualizado!');
    } catch (error) {
      console.error('Error toggling album:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleMoveAlbum = async (album: PhotoAlbum, direction: 'up' | 'down') => {
    const currentIndex = albums.findIndex(a => a.id === album.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= albums.length) return;

    const targetAlbum = albums[targetIndex];

    try {
      const { error: error1 } = await supabase
        .from('photo_albums')
        .update({ order_index: targetAlbum.order_index })
        .eq('id', album.id);

      const { error: error2 } = await supabase
        .from('photo_albums')
        .update({ order_index: album.order_index })
        .eq('id', targetAlbum.id);

      if (error1 || error2) {
        throw new Error(error1?.message || error2?.message);
      }

      const updatedAlbums = [...albums];
      updatedAlbums[currentIndex] = { ...album, order_index: targetAlbum.order_index };
      updatedAlbums[targetIndex] = { ...targetAlbum, order_index: album.order_index };
      
      setAlbums(updatedAlbums.sort((a, b) => a.order_index - b.order_index));
      toast.success('Ordem atualizada!');
    } catch (error) {
      console.error('Error moving album:', error);
      toast.error('Erro ao mover álbum');
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !editingAlbum) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande (máximo 10MB)');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `album-cover-${Date.now()}.${fileExt}`;
      const filePath = `albums/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('parish-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('parish-photos')
        .getPublicUrl(filePath);

      setEditingAlbum(prev => prev ? { ...prev, cover_image_url: urlData.publicUrl } : null);
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao carregar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloudinaryUpload = async (result: { publicId: string; url: string; secureUrl: string }) => {
    if (!editingAlbum) return;
    setEditingAlbum(prev => prev ? { 
      ...prev, 
      cover_image_url: result.secureUrl,
      cloudinary_public_id: result.publicId 
    } : null);
    toast.success('Imagem carregada com sucesso!');
  };

  const handleSupabaseUpload = async (result: { url: string; path: string }) => {
    if (!editingAlbum) return;
    setEditingAlbum(prev => prev ? { ...prev, cover_image_url: result.url } : null);
    toast.success('Imagem carregada com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Gerenciar Álbuns</h3>
        <Button onClick={handleCreateAlbum}>
          <Plus className="h-4 w-4" />
          Novo Álbum
        </Button>
      </div>

      {albums.length === 0 && (
        <Card className="p-8 text-center">
          <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum álbum encontrado
          </h4>
          <p className="text-gray-500 mb-4">
            Comece criando o primeiro álbum para organizar as fotos
          </p>
          <Button onClick={handleCreateAlbum}>
            <Plus className="h-4 w-4" />
            Criar Primeiro Álbum
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {albums.map((album, index) => (
            <motion.div
              key={album.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`p-6 ${!album.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-4">
                  {album.cover_image_url && (
                    <img
                      src={album.cover_image_url}
                      alt={album.name}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">{album.name}</h4>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{album.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Ordem: {album.order_index}</span>
                      <span>{album.is_active ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveAlbum(album, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveAlbum(album, 'down')}
                        disabled={index === albums.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(album)}
                      >
                        {album.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingAlbum(album);
                          setIsCreating(false);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAlbum(album)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editingAlbum && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h4 className="text-lg font-semibold flex-1 pr-4">
                  {isCreating ? 'Novo Álbum' : 'Editar Álbum'}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingAlbum(null);
                    setIsCreating(false);
                  }}
                  className="w-8 h-8 p-0 rounded-full flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Álbum *
                  </label>
                  <input
                    type="text"
                    value={editingAlbum.name}
                    onChange={(e) => setEditingAlbum(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: 40 Anos de História"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={editingAlbum.description}
                    onChange={(e) => setEditingAlbum(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Descrição do álbum"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem de Capa
                  </label>
                  {editingAlbum.cover_image_url && (
                    <div className="mb-3">
                      <img
                        src={editingAlbum.cover_image_url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <FileUpload
                      onCloudinaryUpload={handleCloudinaryUpload}
                      onSupabaseUpload={handleSupabaseUpload}
                      onFileSelect={handleImageUpload}
                      disabled={isUploading}
                      className="flex-1"
                      folder="albums"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        className="w-full"
                      >
                        <ImageIcon className="h-4 w-4" />
                        {isUploading ? 'Carregando...' : 'Carregar Capa'}
                      </Button>
                    </FileUpload>
                    {editingAlbum.cover_image_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAlbum(prev => prev ? { 
                          ...prev, 
                          cover_image_url: null,
                          cloudinary_public_id: null 
                        } : null)}
                        className="text-red-600"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingAlbum.is_active}
                      onChange={(e) => setEditingAlbum(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Álbum ativo (visível no site)
                    </span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleSaveAlbum} className="flex-1">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingAlbum(null);
                      setIsCreating(false);
                    }}
                    className="flex-1"
                  >
                    Cancelar
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