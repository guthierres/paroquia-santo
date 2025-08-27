import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, AlertTriangle, Image as ImageIcon, ExternalLink, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FileUpload } from '../ui/FileUpload';
import { supabase, UrgentPopup } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const UrgentPopupManager: React.FC = () => {
  const [popups, setPopups] = useState<UrgentPopup[]>([]);
  const [editingPopup, setEditingPopup] = useState<UrgentPopup | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewPopup, setPreviewPopup] = useState<UrgentPopup | null>(null);

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    try {
      const { data, error } = await supabase
        .from('urgent_popups')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPopups(data);
    } catch (error) {
      console.error('Error fetching popups:', error);
    }
  };

  const handleCreatePopup = () => {
    const newPopup: UrgentPopup = {
      id: '',
      title: '',
      content: '',
      image_url: null,
      cloudinary_public_id: null,
      link_url: null,
      link_text: 'Saiba mais',
      is_active: false,
      priority: 1,
      auto_close_seconds: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingPopup(newPopup);
    setIsCreating(true);
  };

  const handleSavePopup = async () => {
    if (!editingPopup || !editingPopup.title || !editingPopup.content) {
      toast.error('Preencha título e conteúdo');
      return;
    }

    try {
      const popupData = {
        title: editingPopup.title,
        content: editingPopup.content,
        image_url: editingPopup.image_url,
        cloudinary_public_id: editingPopup.cloudinary_public_id,
        link_url: editingPopup.link_url,
        link_text: editingPopup.link_text,
        is_active: editingPopup.is_active,
        priority: editingPopup.priority,
        auto_close_seconds: editingPopup.auto_close_seconds,
        updated_at: new Date().toISOString()
      };

      if (isCreating) {
        const { data, error } = await supabase
          .from('urgent_popups')
          .insert([popupData])
          .select()
          .single();

        if (error) throw error;
        setPopups(prev => [data, ...prev]);
      } else {
        const { error } = await supabase
          .from('urgent_popups')
          .update(popupData)
          .eq('id', editingPopup.id);

        if (error) throw error;
        setPopups(prev => prev.map(p =>
          p.id === editingPopup.id ? { ...editingPopup, ...popupData } : p
        ));
      }

      setEditingPopup(null);
      setIsCreating(false);
      toast.success('Pop-up salvo com sucesso!');
    } catch (error) {
      console.error('Error saving popup:', error);
      toast.error('Erro ao salvar pop-up');
    }
  };

  const handleDeletePopup = async (popup: UrgentPopup) => {
    if (!confirm('Tem certeza que deseja excluir este pop-up?')) return;

    try {
      const { error } = await supabase
        .from('urgent_popups')
        .delete()
        .eq('id', popup.id);

      if (error) throw error;
      setPopups(prev => prev.filter(p => p.id !== popup.id));
      toast.success('Pop-up excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting popup:', error);
      toast.error('Erro ao excluir pop-up');
    }
  };

  const handleToggleActive = async (popup: UrgentPopup) => {
    try {
      const { error } = await supabase
        .from('urgent_popups')
        .update({ 
          is_active: !popup.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', popup.id);

      if (error) throw error;
      setPopups(prev => prev.map(p =>
        p.id === popup.id ? { ...p, is_active: !p.is_active } : p
      ));
      toast.success('Status atualizado!');
    } catch (error) {
      console.error('Error toggling popup:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !editingPopup) return;

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
      const fileName = `popup-${Date.now()}.${fileExt}`;
      const filePath = `popups/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('parish-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('parish-photos')
        .getPublicUrl(filePath);

      setEditingPopup(prev => prev ? { ...prev, image_url: urlData.publicUrl } : null);
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao carregar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloudinaryUpload = async (result: { publicId: string; url: string; secureUrl: string }) => {
    if (!editingPopup) return;
    setEditingPopup(prev => prev ? { 
      ...prev, 
      image_url: result.secureUrl,
      cloudinary_public_id: result.publicId 
    } : null);
    toast.success('Imagem carregada com sucesso!');
  };

  const handleSupabaseUpload = async (result: { url: string; path: string }) => {
    if (!editingPopup) return;
    setEditingPopup(prev => prev ? { ...prev, image_url: result.url } : null);
    toast.success('Imagem carregada com sucesso!');
  };

  const clearOldSeenData = () => {
    try {
      const keys = Object.keys(localStorage);
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      keys.forEach(key => {
        if (key.startsWith('popup_seen_')) {
          const timestampKey = `${key}_timestamp`;
          const timestamp = localStorage.getItem(timestampKey);
          if (!timestamp || parseInt(timestamp) < thirtyDaysAgo) {
            localStorage.removeItem(key);
            localStorage.removeItem(timestampKey);
          }
        }
      });
      
      toast.success('Dados antigos limpos com sucesso!');
    } catch (error) {
      console.error('Error clearing old data:', error);
      toast.error('Erro ao limpar dados antigos');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Pop-ups Urgentes</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={clearOldSeenData}
            className="text-xs"
          >
            Limpar Cache
          </Button>
          <Button onClick={handleCreatePopup}>
            <Plus className="h-4 w-4" />
            Novo Pop-up
          </Button>
        </div>
      </div>

      {popups.length === 0 && (
        <Card className="p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum pop-up encontrado
          </h4>
          <p className="text-gray-500 mb-4">
            Crie pop-ups para avisos importantes, eventos especiais ou comunicados urgentes
          </p>
          <Button onClick={handleCreatePopup}>
            <Plus className="h-4 w-4" />
            Criar Primeiro Pop-up
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {popups.map((popup) => (
            <motion.div
              key={popup.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`p-6 ${!popup.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-4">
                  {popup.image_url && (
                    <img
                      src={popup.image_url}
                      alt={popup.title}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-800">{popup.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        popup.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {popup.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Prioridade {popup.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{popup.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {popup.auto_close_seconds}s auto-close
                      </span>
                      {popup.link_url && (
                        <span className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {popup.link_text}
                        </span>
                      )}
                      <span>Criado: {new Date(popup.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewPopup(popup)}
                      title="Visualizar"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(popup)}
                      title={popup.is_active ? 'Desativar' : 'Ativar'}
                    >
                      {popup.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingPopup(popup);
                        setIsCreating(false);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePopup(popup)}
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
        {editingPopup && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h4 className="text-lg font-semibold">
                  {isCreating ? 'Novo Pop-up' : 'Editar Pop-up'}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingPopup(null);
                    setIsCreating(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={editingPopup.title}
                    onChange={(e) => setEditingPopup(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Título do aviso importante"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conteúdo *
                  </label>
                  <textarea
                    value={editingPopup.content}
                    onChange={(e) => setEditingPopup(prev => prev ? { ...prev, content: e.target.value } : null)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Descrição do aviso ou evento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem (Flyer/Banner)
                  </label>
                  {editingPopup.image_url && (
                    <div className="mb-3">
                      <img
                        src={editingPopup.image_url}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
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
                      folder="popups"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        className="w-full"
                      >
                        <ImageIcon className="h-4 w-4" />
                        {isUploading ? 'Carregando...' : 'Carregar Imagem'}
                      </Button>
                    </FileUpload>
                    {editingPopup.image_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPopup(prev => prev ? { 
                          ...prev, 
                          image_url: null, 
                          cloudinary_public_id: null 
                        } : null)}
                        className="text-red-600"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioridade (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editingPopup.priority}
                      onChange={(e) => setEditingPopup(prev => prev ? { 
                        ...prev, 
                        priority: Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maior prioridade aparece primeiro
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-close (segundos)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={editingPopup.auto_close_seconds}
                      onChange={(e) => setEditingPopup(prev => prev ? { 
                        ...prev, 
                        auto_close_seconds: Math.max(5, Math.min(60, parseInt(e.target.value) || 10))
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Entre 5 e 60 segundos
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link de Ação (opcional)
                  </label>
                  <input
                    type="url"
                    value={editingPopup.link_url || ''}
                    onChange={(e) => setEditingPopup(prev => prev ? { ...prev, link_url: e.target.value || null } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="https://exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto do Botão
                  </label>
                  <input
                    type="text"
                    value={editingPopup.link_text}
                    onChange={(e) => setEditingPopup(prev => prev ? { ...prev, link_text: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Saiba mais"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingPopup.is_active}
                      onChange={(e) => setEditingPopup(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {editingPopup.is_active ? '✅ Pop-up ativo' : '⏸️ Pop-up inativo'}
                    </span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleSavePopup} className="flex-1">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPreviewPopup(editingPopup)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingPopup(null);
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

      {/* Preview Modal */}
      <AnimatePresence>
        {previewPopup && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Preview Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-yellow-50">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Preview do Pop-up</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewPopup(null)}
                  className="w-8 h-8 p-0 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Preview Content */}
              <div className="p-6">
                {previewPopup.image_url && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={previewPopup.image_url}
                      alt={previewPopup.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {previewPopup.title}
                </h3>

                <div className="prose prose-sm max-w-none mb-6">
                  {previewPopup.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-600 mb-2 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {previewPopup.link_url && (
                  <Button
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2 mb-4"
                    onClick={() => window.open(previewPopup.link_url!, '_blank')}
                  >
                    {previewPopup.link_text}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}

                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">
                    Auto-close em: {previewPopup.auto_close_seconds} segundos
                  </p>
                  <p className="text-xs text-gray-500">
                    Prioridade: {previewPopup.priority}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};