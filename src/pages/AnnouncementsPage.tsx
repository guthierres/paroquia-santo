import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Share2, MessageCircle, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { supabase, ParishAnnouncement } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AnnouncementsPageProps {
  onBack: () => void;
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ onBack }) => {
  const [announcements, setAnnouncements] = useState<ParishAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'event' | 'announcement'>('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<ParishAnnouncement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parish_announcements')
        .select('*')
        .eq('is_published', true)
        .order('event_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Erro ao carregar avisos');
    } finally {
      setLoading(false);
    }
  };

  const handleAnnouncementClick = (announcement: ParishAnnouncement, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedAnnouncement(announcement);
  };

  const handleCloseModal = () => {
    setSelectedAnnouncement(null);
  };

  const shareAnnouncement = (announcement: ParishAnnouncement, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#avisos/${announcement.slug}`;
    const text = `${announcement.title}`;

    if (navigator.share) {
      navigator.share({ title: announcement.title, text, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    }
  };

  const contactWhatsApp = (announcement: ParishAnnouncement) => {
    if (!announcement.whatsapp_contact) return;

    const phone = announcement.whatsapp_contact.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá! Gostaria de saber mais sobre: ${announcement.title}`);
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  };

  const filteredAnnouncements = announcements.filter(a =>
    filter === 'all' || a.type === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando avisos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Avisos e Eventos
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Fique por dentro de todos os acontecimentos da nossa paróquia
            </p>

            <div className="flex gap-4 flex-wrap">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilter('all')}
              >
                Todos
              </Button>
              <Button
                variant={filter === 'event' ? 'primary' : 'outline'}
                onClick={() => setFilter('event')}
              >
                Eventos
              </Button>
              <Button
                variant={filter === 'announcement' ? 'primary' : 'outline'}
                onClick={() => setFilter('announcement')}
              >
                Avisos
              </Button>
            </div>
          </motion.div>

          {filteredAnnouncements.length === 0 ? (
            <Card className="p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhum aviso encontrado
              </h3>
              <p className="text-gray-500">
                No momento não há avisos ou eventos publicados.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAnnouncements.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="group cursor-pointer hover:shadow-xl transition-all duration-300 h-full flex flex-col"
                    onClick={(e) => handleAnnouncementClick(announcement, e)}
                  >
                    {announcement.flyer_url && (
                      <div className="aspect-video overflow-hidden rounded-t-xl">
                        <img
                          src={announcement.flyer_url}
                          alt={announcement.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          announcement.type === 'event'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {announcement.type === 'event' ? 'Evento' : 'Aviso'}
                        </span>
                        {announcement.event_date && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(announcement.event_date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-red-800 transition-colors line-clamp-2">
                        {announcement.title}
                      </h3>

                      <p className="text-gray-600 mb-4 flex-1 line-clamp-3">
                        {announcement.content}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <span className="text-sm text-gray-500">
                          Ver detalhes
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => shareAnnouncement(announcement, e)}
                          className="flex items-center gap-2"
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedAnnouncement.flyer_url && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={selectedAnnouncement.flyer_url}
                    alt={selectedAnnouncement.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedAnnouncement.type === 'event'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedAnnouncement.type === 'event' ? 'Evento' : 'Aviso'}
                  </span>
                  {selectedAnnouncement.event_date && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-5 w-5" />
                      <span>
                        {new Date(selectedAnnouncement.event_date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {selectedAnnouncement.title}
                </h2>

                <div className="prose prose-lg max-w-none mb-6">
                  {selectedAnnouncement.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <Button
                    variant="primary"
                    onClick={(e) => shareAnnouncement(selectedAnnouncement, e as any)}
                    className="flex items-center gap-2 flex-1"
                  >
                    <Share2 className="h-4 w-4" />
                    Compartilhar
                  </Button>

                  {selectedAnnouncement.whatsapp_contact && (
                    <Button
                      variant="outline"
                      onClick={() => contactWhatsApp(selectedAnnouncement)}
                      className="flex items-center gap-2 flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleCloseModal}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
