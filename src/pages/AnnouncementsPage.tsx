import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Adicionado AnimatePresence para o modal
import { ArrowLeft, Calendar, MapPin, Share2, X, MessageCircle } from 'lucide-react'; // Adicionado X e MessageCircle
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
  // NOVO ESTADO: Armazena o aviso que está sendo visualizado (simula a página de detalhes)
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

  // ALTERADO: Agora apenas abre o modal/detalhes no estado
  const handleAnnouncementClick = (announcement: ParishAnnouncement) => {
    setSelectedAnnouncement(announcement);
    // Remove a navegação baseada em hash que estava causando problemas
    // window.location.hash = `#avisos/${announcement.slug}`; 
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
  
  // NOVO: Função para formatar data completa no modal
  const formatFullDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'Data não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // NOVO: Função para contato via WhatsApp
  const handleWhatsAppClick = (whatsappContact: string, title: string) => {
    const cleanPhone = whatsappContact.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá! Gostaria de saber mais sobre: ${title}`);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
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
                  onClick={() => handleAnnouncementClick(announcement)} // Chama o novo handler
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
      
      {/* NOVO: Modal de Detalhes para exibir o aviso selecionado */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setSelectedAnnouncement(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedAnnouncement.flyer_url && (
                <img
                  src={selectedAnnouncement.flyer_url}
                  alt={selectedAnnouncement.title}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{selectedAnnouncement.title}</h2>
                
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedAnnouncement.type === 'event' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedAnnouncement.type === 'event' ? 'Evento' : 'Aviso'}
                  </span>
                  {selectedAnnouncement.event_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3"/> {formatFullDateTime(selectedAnnouncement.event_date)}
                    </span>
                  )}
                </div>

                <p className="text-gray-700 whitespace-pre-wrap mb-6">{selectedAnnouncement.content}</p>

                {selectedAnnouncement.whatsapp_contact && (
                  <Button
                    variant="primary"
                    onClick={() => handleWhatsAppClick(selectedAnnouncement.whatsapp_contact!, selectedAnnouncement.title)}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 mb-4"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Falar no WhatsApp
                  </Button>
                )}
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <Button
                        variant="outline"
                        onClick={() => shareAnnouncement(selectedAnnouncement, new MouseEvent('click') as any)}
                        className="flex items-center gap-2"
                    >
                        <Share2 className="h-4 w-4" />
                        Compartilhar
                    </Button>
                    <Button variant="primary" onClick={() => setSelectedAnnouncement(null)}>
                        <X className="h-4 w-4" />
                        Fechar
                    </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
