import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CreditCard as Edit, Trash2, Save, X, Calendar, Megaphone, Bell, Image } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FileUpload } from '../ui/FileUpload';
import { supabase, ParishAnnouncement } from '../../lib/supabase';
import { uploadToCloudinary, getCloudinaryConfig } from '../../lib/cloudinary';
import toast from 'react-hot-toast';

export const AnnouncementManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<ParishAnnouncement[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<ParishAnnouncement | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('parish_announcements')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      if (data) setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const handleCreateAnnouncement = () => {
    const newAnnouncement: ParishAnnouncement = {
      id: '',
      type: 'announcement',
      title: '',
      content: '',
      event_date: null,
      flyer_url: null,
      whatsapp_contact: null,
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingAnnouncement(newAnnouncement);
    setIsCreating(true);
  };

  const handleFlyerUpload = async (file: File) => {
    try {
      const config = await getCloudinaryConfig();

      if (!config.enabled) {
        toast.error('Sistema de upload não está configurado');
        return;
      }

      toast.loading('Enviando imagem...');
      const result = await uploadToCloudinary(file, 'announcements');

      setEditingAnnouncement(prev => prev ? {
        ...prev,
        flyer_url: result.secureUrl
      } : null);

      toast.dismiss();
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      toast.dismiss();
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar imagem');
    }
  };

  const handleSaveAnnouncement = async () => {
    if (!editingAnnouncement || !editingAnnouncement.title || !editingAnnouncement.content) {
      toast.error('Preencha título e conteúdo');
      return;
    }

    try {
      const announcementData = {
        type: editingAnnouncement.type,
        title: editingAnnouncement.title,
        content: editingAnnouncement.content,
        event_date: editingAnnouncement.event_date,
        flyer_url: editingAnnouncement.flyer_url,
        whatsapp_contact: editingAnnouncement.whatsapp_contact,
        is_published: editingAnnouncement.is_published,
        updated_at: new Date().toISOString()
      };

      if (isCreating) {
        const { data, error } = await supabase
          .from('parish_announcements')
          .insert([announcementData])
          .select()
          .single();

        if (error) throw error;
        setAnnouncements(prev => [data, ...prev]);
      } else {
        const { error } = await supabase
          .from('parish_announcements')
          .update(announcementData)
          .eq('id', editingAnnouncement.id);

        if (error) throw error;
        setAnnouncements(prev => prev.map(a =>
          a.id === editingAnnouncement.id ? { ...editingAnnouncement, ...announcementData } : a
        ));
      }

      setEditingAnnouncement(null);
      setIsCreating(false);
      toast.success('Salvo com sucesso!');
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Erro ao salvar');
    }
  };

  const handleDeleteAnnouncement = async (announcement: ParishAnnouncement) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;

    try {
      const { error } = await supabase
        .from('parish_announcements')
        .delete()
        .eq('id', announcement.id);

      if (error) throw error;
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
      toast.success('Excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Erro ao excluir');
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIcon = (type: string) => {
    return type === 'event' ? Calendar : Bell;
  };

  // Nova função para formatar a data e hora para o input datetime-local
  const formatDateTimeForInput = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Eventos e Avisos Paroquiais</h3>
        <Button onClick={handleCreateAnnouncement}>
          <Plus className="h-4 w-4" />
          Novo
        </Button>
      </div>

      {announcements.length === 0 && (
        <Card className="p-8 text-center">
          <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum evento ou aviso encontrado
          </h4>
          <p className="text-gray-500 mb-4">
            Comece criando o primeiro evento ou aviso paroquial
          </p>
          <Button onClick={handleCreateAnnouncement}>
            <Plus className="h-4 w-4" />
            Criar Primeiro
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {announcements.map((announcement) => {
            const IconComponent = getIcon(announcement.type);
            return (
              <motion.div
                key={announcement.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`p-6 ${!announcement.is_published ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${
                      announcement.type === 'event' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-800">{announcement.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          announcement.type === 'event'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {announcement.type === 'event' ? 'Evento' : 'Aviso'}
                        </span>
                        {!announcement.is_published && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            Rascunho
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {announcement.event_date && (
                          <span>📅 {formatDateTime(announcement.event_date)}</span>
                        )}
                        {announcement.whatsapp_contact && (
                          <span className="flex items-center gap-1 text-green-600">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                            </svg>
                            WhatsApp
                          </span>
                        )}
                        <span>Criado: {new Date(announcement.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingAnnouncement(announcement);
                          setIsCreating(false);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAnnouncement(announcement)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editingAnnouncement && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h4 className="text-lg font-semibold flex-1 pr-4">
                  {isCreating ? 'Novo' : 'Editar'} {editingAnnouncement.type === 'event' ? 'Evento' : 'Aviso'}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingAnnouncement(null);
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
                    Tipo
                  </label>
                  <select
                    value={editingAnnouncement.type}
                    onChange={(e) => setEditingAnnouncement(prev => prev ? {
                      ...prev,
                      type: e.target.value as 'event' | 'announcement'
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="announcement">Aviso</option>
                    <option value="event">Evento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={editingAnnouncement.title}
                    onChange={(e) => setEditingAnnouncement(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Título do evento ou aviso"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data e Hora {editingAnnouncement.type === 'event' ? '*' : '(opcional)'}
                  </label>
                  <input
                    type="datetime-local"
                    value={formatDateTimeForInput(editingAnnouncement.event_date)}
                    onChange={(e) => setEditingAnnouncement(prev => prev ? {
                      ...prev,
                      event_date: e.target.value ? new Date(e.target.value).toISOString() : null
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conteúdo *
                  </label>
                  <textarea
                    value={editingAnnouncement.content}
                    onChange={(e) => setEditingAnnouncement(prev => prev ? { ...prev, content: e.target.value } : null)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Descrição completa do evento ou aviso"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem do Flyer (opcional)
                  </label>
                  {editingAnnouncement.flyer_url ? (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={editingAnnouncement.flyer_url}
                          alt="Preview do flyer"
                          className="w-full h-48 object-cover"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingAnnouncement(prev => prev ? {
                            ...prev,
                            flyer_url: null
                          } : null)}
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                        >
                          <X className="h-3 w-3" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <FileUpload
                      onFileSelect={handleFlyerUpload}
                      accept="image/*"
                      maxSize={5}
                      icon={Image}
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Envie uma imagem para destacar o evento/aviso (máx. 5MB)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp para Contato (opcional)
                  </label>
                  <input
                    type="text"
                    value={editingAnnouncement.whatsapp_contact || ''}
                    onChange={(e) => setEditingAnnouncement(prev => prev ? {
                      ...prev,
                      whatsapp_contact: e.target.value || null
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="(11) 99999-9999"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Número para contato via WhatsApp sobre este evento/aviso
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingAnnouncement.is_published}
                      onChange={(e) => setEditingAnnouncement(prev => prev ? {
                        ...prev,
                        is_published: e.target.checked
                      } : null)}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {editingAnnouncement.is_published ? '✅ Publicado' : '📝 Rascunho'}
                    </span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleSaveAnnouncement} className="flex-1">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingAnnouncement(null);
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
