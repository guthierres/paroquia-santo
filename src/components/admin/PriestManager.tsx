import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, User, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FileUpload } from '../ui/FileUpload';
import { supabase, Priest } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const PriestManager: React.FC = () => {
  const [priests, setPriests] = useState<Priest[]>([]);
  const [editingPriest, setEditingPriest] = useState<Priest | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchPriests();
  }, []);

  const fetchPriests = async () => {
    try {
      const { data, error } = await supabase
        .from('priests')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) setPriests(data);
    } catch (error) {
      console.error('Error fetching priests:', error);
    }
  };

  const handleCreatePriest = () => {
    const newPriest: Priest = {
      id: '',
      name: '',
      title: 'Pároco',
      photo_url: null,
      short_bio: '',
      full_bio: '',
      ordination_year: null,
      parish_since: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingPriest(newPriest);
    setIsCreating(true);
  };

  const handleSavePriest = async () => {
    if (!editingPriest || !editingPriest.name || !editingPriest.short_bio) {
      toast.error('Preencha nome e biografia resumida');
      return;
    }

    try {
      const priestData = {
        name: editingPriest.name,
        title: editingPriest.title,
        photo_url: editingPriest.photo_url,
        short_bio: editingPriest.short_bio,
        full_bio: editingPriest.full_bio,
        ordination_year: editingPriest.ordination_year,
        parish_since: editingPriest.parish_since,
        is_active: editingPriest.is_active,
        updated_at: new Date().toISOString()
      };

      if (isCreating) {
        const { data, error } = await supabase
          .from('priests')
          .insert([priestData])
          .select()
          .single();

        if (error) throw error;
        setPriests(prev => [...prev, data]);
      } else {
        const { error } = await supabase
          .from('priests')
          .update(priestData)
          .eq('id', editingPriest.id);

        if (error) throw error;
        setPriests(prev => prev.map(p =>
          p.id === editingPriest.id ? { ...editingPriest, ...priestData } : p
        ));
      }

      setEditingPriest(null);
      setIsCreating(false);
      toast.success('Informações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving priest:', error);
      toast.error('Erro ao salvar informações');
    }
  };

  const handleDeletePriest = async (priest: Priest) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;

    try {
      const { error } = await supabase
        .from('priests')
        .delete()
        .eq('id', priest.id);

      if (error) throw error;
      setPriests(prev => prev.filter(p => p.id !== priest.id));
      toast.success('Registro excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting priest:', error);
      toast.error('Erro ao excluir registro');
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !editingPriest) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande (máximo 5MB)');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `priest-${Date.now()}.${fileExt}`;
      const filePath = `priests/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('parish-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('parish-photos')
        .getPublicUrl(filePath);

      setEditingPriest(prev => prev ? { ...prev, photo_url: urlData.publicUrl } : null);
      toast.success('Foto carregada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao carregar foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloudinaryUpload = async (result: { publicId: string; url: string; secureUrl: string }) => {
    if (!editingPriest) return;
    setEditingPriest(prev => prev ? { 
      ...prev, 
      photo_url: result.secureUrl,
      cloudinary_public_id: result.publicId 
    } : null);
    toast.success('Foto carregada com sucesso!');
  };

  const handleSupabaseUpload = async (result: { url: string; path: string }) => {
    if (!editingPriest) return;
    setEditingPriest(prev => prev ? { ...prev, photo_url: result.url } : null);
    toast.success('Foto carregada com sucesso!');
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Gerenciar Clero</h3>
        <Button onClick={handleCreatePriest}>
          <Plus className="h-4 w-4" />
          Adicionar Padre
        </Button>
      </div>

      {priests.length === 0 && (
        <Card className="p-8 text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum registro encontrado
          </h4>
          <p className="text-gray-500 mb-4">
            Adicione informações sobre o pároco e outros membros do clero
          </p>
          <Button onClick={handleCreatePriest}>
            <Plus className="h-4 w-4" />
            Adicionar Primeiro Registro
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {priests.map((priest) => (
            <motion.div
              key={priest.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`p-6 ${!priest.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-4">
                  {priest.photo_url && (
                    <img
                      src={priest.photo_url}
                      alt={priest.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">{priest.name}</h4>
                    <p className="text-red-800 font-medium text-sm mb-2">{priest.title}</p>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{priest.short_bio}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {priest.ordination_year && <span>Ordenado: {priest.ordination_year}</span>}
                      {priest.parish_since && <span>Na paróquia: {priest.parish_since}</span>}
                      <span>{priest.is_active ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingPriest(priest);
                        setIsCreating(false);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePriest(priest)}
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

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editingPriest && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h4 className="text-lg font-semibold">
                  {isCreating ? 'Adicionar Padre' : 'Editar Informações'}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingPriest(null);
                    setIsCreating(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={editingPriest.name}
                      onChange={(e) => setEditingPriest(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título/Cargo
                    </label>
                    <input
                      type="text"
                      value={editingPriest.title}
                      onChange={(e) => setEditingPriest(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Ex: Pároco, Vigário, etc."
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ano de Ordenação
                    </label>
                    <input
                      type="number"
                      value={editingPriest.ordination_year || ''}
                      onChange={(e) => setEditingPriest(prev => prev ? { ...prev, ordination_year: e.target.value ? parseInt(e.target.value) : null } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Ex: 2005"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Na Paróquia Desde
                    </label>
                    <input
                      type="number"
                      value={editingPriest.parish_since || ''}
                      onChange={(e) => setEditingPriest(prev => prev ? { ...prev, parish_since: e.target.value ? parseInt(e.target.value) : null } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Ex: 2010"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto
                  </label>
                  {editingPriest.photo_url && (
                    <div className="mb-3">
                      <img
                        src={editingPriest.photo_url}
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover"
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
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        className="w-full"
                      >
                        <ImageIcon className="h-4 w-4" />
                        {isUploading ? 'Carregando...' : 'Carregar Foto'}
                      </Button>
                    </FileUpload>
                    {editingPriest.photo_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPriest(prev => prev ? { ...prev, photo_url: null } : null)}
                        className="text-red-600"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografia Resumida *
                  </label>
                  <textarea
                    value={editingPriest.short_bio}
                    onChange={(e) => setEditingPriest(prev => prev ? { ...prev, short_bio: e.target.value } : null)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Biografia resumida que aparecerá na seção principal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografia Completa
                  </label>
                  <textarea
                    value={editingPriest.full_bio}
                    onChange={(e) => setEditingPriest(prev => prev ? { ...prev, full_bio: e.target.value } : null)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Biografia completa que aparecerá no modal. Use parágrafos separados por linha em branco."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingPriest.is_active}
                      onChange={(e) => setEditingPriest(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Ativo (visível no site)
                    </span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleSavePriest} className="flex-1">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingPriest(null);
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
