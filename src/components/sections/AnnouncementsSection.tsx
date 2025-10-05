import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronRight, Megaphone, X, User, MessageCircle, ZoomIn } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface ParishAnnouncement {
  id: string;
  type: 'event' | 'announcement';
  title: string;
  content: string;
  event_date?: string;
  flyer_url?: string;
  whatsapp_contact?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // NOVO CAMPO: Adicionado o slug
  slug?: string; 
}

export function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<ParishAnnouncement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<ParishAnnouncement | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      // O Supabase irá retornar o campo 'slug' automaticamente se ele for adicionado à tabela
      const { data, error } = await supabase
        .from('parish_announcements')
        .select('*') 
        .eq('is_published', true)
        .order('event_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Erro ao carregar avisos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFullDateTime = (dateString: string) => {
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

  const handleWhatsAppClick = (whatsappContact: string, title: string) => {
    const cleanPhone = whatsappContact.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá! Gostaria de saber mais sobre: ${title}`);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const isUpcoming = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) > new Date();
  };

  const displayedAnnouncements = showAll ? announcements : announcements.slice(0, 6);

  if (loading) {
    return (
      <section id="announcements" className="py-16 sm:py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando avisos...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="announcements" className="py-16 sm:py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <Megaphone className="h-8 w-8 text-red-800 mr-3" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Avisos Paroquiais
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Fique por dentro dos eventos e comunicados importantes da nossa comunidade
            </p>
          </motion.div>

          {announcements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhum aviso no momento
              </h3>
              <p className="text-gray-500">
                Novos avisos e eventos serão publicados aqui
              </p>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <AnimatePresence>
                  {displayedAnnouncements.map((announcement, index) => (
                    <motion.div
                      key={announcement.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      layout
                    >
                      <button
                        // Se você quiser usar o slug para navegação, mude este <button> para um <Link>
                        // Ex: <Link to={`/avisos/${announcement.slug}`}>
                        onClick={() => setSelectedAnnouncement(announcement)}
                        className="w-full h-full text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-xl"
                      >
                        <Card
                          className="group h-full flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-l-4 border-red-800 overflow-hidden"
                        >
                          {announcement.flyer_url && (
                            <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-gray-100">
                              <img
                                src={announcement.flyer_url}
                                alt={announcement.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                            </div>
                          )}

                          <div className={`p-3 ${
                            announcement.type === 'event'
                              ? 'bg-gradient-to-r from-blue-50 to-blue-100'
                              : 'bg-gradient-to-r from-amber-50 to-amber-100'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {announcement.type === 'event' ? (
                                  <Calendar className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Megaphone className="h-4 w-4 text-amber-600" />
                                )}
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  announcement.type === 'event'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-amber-600 text-white'
                                }`}>
                                  {announcement.type === 'event' ? 'Evento' : 'Aviso'}
                                </span>
                              </div>

                              {announcement.event_date && (
                                <div className={`text-right ${
                                  isUpcoming(announcement.event_date)
                                    ? 'text-green-700'
                                    : 'text-gray-600'
                                }`}>
                                  <div className="text-xs font-medium">
                                    {formatDate(announcement.event_date)}
                                  </div>
                                  <div className="text-sm font-bold">
                                    {formatTime(announcement.event_date)}
                                  </div>
                                </div>
                              )}
                            </div>

                            {announcement.event_date && isUpcoming(announcement.event_date) && (
                              <div className="flex items-center gap-1 text-xs text-green-700 font-medium">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Próximo evento
                              </div>
                            )}
                          </div>

                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-800 group-hover:text-red-800 transition-colors mb-2 line-clamp-2 text-sm sm:text-base">
                              {announcement.title}
                            </h3>
                            
                            {/* O slug não é exibido, mas pode ser útil para debug:
                            {announcement.slug && <p className="text-xs text-gray-400">Slug: {announcement.slug}</p>}
                            */}

                            <p className="text-gray-600 text-xs sm:text-sm mb-3 flex-1 line-clamp-3 leading-relaxed">
                              {announcement.content}
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {new Date(announcement.created_at).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit'
                                  })}
                                </span>
                              </div>

                              <span
                                className="flex items-center text-red-800 font-medium group-hover:text-red-900 transition-colors text-xs"
                              >
                                <span>Ver mais</span>
                                <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                              </span>
                            </div>
                          </div>
                        </Card>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {announcements.length > 6 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-center mt-8"
                >
                  <Button
                    variant="outline"
                    onClick={() => setShowAll(!showAll)}
                    className="group"
                  >
                    {showAll ? 'Ver Menos' : `Ver Todos (${announcements.length})`}
                    <ChevronRight className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                      showAll ? 'rotate-90' : 'group-hover:translate-x-1'
                    }`} />
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Modal de Detalhes com Scroll (sem alterações de funcionalidade) */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center overflow-y-auto"
            onClick={() => setSelectedAnnouncement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-xl w-full max-w-2xl m-4 sm:my-8 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botão Fechar Fixo no Topo */}
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="outline"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="w-9 h-9 p-0 rounded-full bg-white hover:bg-gray-100 shadow-lg border-2 border-gray-300"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Conteúdo com Scroll */}
              <div className="overflow-y-auto flex-1">
                {selectedAnnouncement.flyer_url && (
                  <div
                    className="relative w-full h-64 sm:h-80 overflow-hidden bg-gray-100 cursor-pointer group"
                    onClick={() => setFullscreenImage(selectedAnnouncement.flyer_url!)}
                  >
                    <img
                      src={selectedAnnouncement.flyer_url}
                      alt={selectedAnnouncement.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                        <ZoomIn className="h-8 w-8 text-gray-800" />
                      </div>
                    </div>
                  </div>
                )}

              <div className={`p-4 sm:p-6 pr-12 sm:pr-6 ${
                selectedAnnouncement.type === 'event'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700'
                  : 'bg-gradient-to-r from-amber-600 to-amber-700'
              } text-white`}>
                <div className="flex items-center gap-3">
                  {selectedAnnouncement.type === 'event' ? (
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                  ) : (
                    <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-1 text-xs font-medium bg-white/20 rounded-full">
                        {selectedAnnouncement.type === 'event' ? 'Evento' : 'Aviso'}
                      </span>
                      {selectedAnnouncement.event_date && isUpcoming(selectedAnnouncement.event_date) && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-full flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                          Próximo
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold">{selectedAnnouncement.title}</h3>
                  </div>
                </div>

                {selectedAnnouncement.event_date && (
                  <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20">
                    <div className="flex items-center justify-center gap-4 text-center">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <div>
                          <div className="text-xs opacity-80">Data</div>
                          <div className="font-bold text-lg">
                            {formatDate(selectedAnnouncement.event_date)}
                          </div>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-white/30"></div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <div>
                          <div className="text-xs opacity-80">Horário</div>
                          <div className="font-bold text-lg">
                            {formatTime(selectedAnnouncement.event_date)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-2 text-sm opacity-90">
                      {formatFullDateTime(selectedAnnouncement.event_date)}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6">
                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-justify text-sm sm:text-base">
                    {selectedAnnouncement.content}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  {selectedAnnouncement.whatsapp_contact && (
                    <div className="mb-4">
                      <Button
                        variant="outline"
                        onClick={() => handleWhatsAppClick(selectedAnnouncement.whatsapp_contact!, selectedAnnouncement.title)}
                        className="w-full flex items-center justify-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300 text-sm"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="truncate">Entrar em Contato via WhatsApp</span>
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span>Publicado pela Paróquia</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {new Date(selectedAnnouncement.created_at).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <Button
                    variant="primary"
                    onClick={() => setSelectedAnnouncement(null)}
                    className="w-full sm:w-auto"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Imagem em Tela Cheia (sem alterações) */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setFullscreenImage(null)}
          >
            <Button
              variant="outline"
              onClick={() => setFullscreenImage(null)}
              className="fixed top-2 right-2 sm:top-4 sm:right-4 w-10 h-10 p-0 rounded-full bg-white hover:bg-gray-100 shadow-lg z-10 border-2 border-gray-300"
            >
              <X className="h-5 w-5" />
            </Button>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={fullscreenImage}
                alt="Imagem em tela cheia"
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
