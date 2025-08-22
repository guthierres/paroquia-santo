import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Bell, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase, ParishAnnouncement } from '../../lib/supabase';

export const AnnouncementsSection: React.FC = () => {
  const [announcements, setAnnouncements] = useState<ParishAnnouncement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<ParishAnnouncement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('parish_announcements')
        .select('*')
        .eq('is_published', true)
        .order('event_date', { ascending: true })
        .limit(6);

      if (error) throw error;
      if (data) setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) {
      return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `Amanhã às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getIcon = (type: string) => {
    return type === 'event' ? Calendar : Bell;
  };

  const isEventSoon = (dateString: string | null) => {
    if (!dateString) return false;
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 48; // Próximas 48 horas
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando eventos e avisos...</p>
          </div>
        </div>
      </section>
    );
  }

  if (announcements.length === 0) {
    return null; // Não mostra a seção se não há anúncios
  }

  return (
    <>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent mb-4">
              Eventos e Avisos Paroquiais
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fique por dentro das novidades e próximos eventos da nossa comunidade
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((announcement, index) => {
              const IconComponent = getIcon(announcement.type);
              const dateTime = formatDateTime(announcement.event_date);
              const isSoon = isEventSoon(announcement.event_date);
              
              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer group h-full flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => setSelectedAnnouncement(announcement)}
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`p-2 rounded-full flex-shrink-0 ${
                          announcement.type === 'event' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              announcement.type === 'event' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {announcement.type === 'event' ? 'Evento' : 'Aviso'}
                            </span>
                            {isSoon && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium animate-pulse">
                                Em breve!
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-red-800 transition-colors line-clamp-2">
                        {announcement.title}
                      </h3>

                      <p className="text-gray-600 mb-4 flex-1 line-clamp-3 text-sm">
                        {announcement.content}
                      </p>

                      {dateTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <Clock className="h-4 w-4" />
                          <span>{dateTime}</span>
                        </div>
                      )}

                      <div 
                        className="flex items-center text-red-800 font-medium group-hover:text-red-900 transition-colors text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAnnouncement(announcement);
                        }}
                      >
                        <span>Ver detalhes</span>
                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {React.createElement(getIcon(selectedAnnouncement.type), {
                      className: "h-6 w-6"
                    })}
                    <div>
                      <span className="text-amber-200 text-sm">
                        {selectedAnnouncement.type === 'event' ? 'Evento' : 'Aviso'}
                      </span>
                      <h3 className="text-xl font-bold">{selectedAnnouncement.title}</h3>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAnnouncement(null)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                {selectedAnnouncement.event_date && (
                  <div className="flex items-center gap-2 text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-red-800" />
                    <span className="font-medium">
                      {formatDateTime(selectedAnnouncement.event_date)}
                    </span>
                    {isEventSoon(selectedAnnouncement.event_date) && (
                      <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        Em breve!
                      </span>
                    )}
                  </div>
                )}

                <div className="prose max-w-none">
                  {selectedAnnouncement.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                  <Button
                    variant="primary"
                    onClick={() => setSelectedAnnouncement(null)}
                  >
                    Fechar
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