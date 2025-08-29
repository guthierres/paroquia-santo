import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Calendar, Megaphone, Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { supabase, ParishAnnouncement } from '../../lib/supabase';
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
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingAnnouncement(newAnnouncement);
    setIsCreating(true);
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
        // O Supabase irá lidar com o fuso horário corretamente se o tipo for 'timestamp with time zone'
        event_date: editingAnnouncement.event_date,
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
