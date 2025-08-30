import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronRight, Megaphone } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface ParishAnnouncement {
  id: string;
  type: 'event' | 'announcement';
  title: string;
  content: string;
  event_date?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<ParishAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const displayedAnnouncements = showAll ? announcements : announcements.slice(0, 3);

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
            <div className="grid gap-6 md:gap-8">
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
                    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-red-800">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          {announcement.type === 'event' ? (
                            <Calendar className="h-6 w-6 text-red-800 mr-3 flex-shrink-0" />
                          ) : (
                            <Megaphone className="h-6 w-6 text-red-800 mr-3 flex-shrink-0" />
                          )}
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {announcement.title}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {announcement.event_date ? (
                                <span>Evento: {formatDate(announcement.event_date)}</span>
                              ) : (
                                <span>Publicado: {formatDate(announcement.created_at)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          announcement.type === 'event' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {announcement.type === 'event' ? 'Evento' : 'Aviso'}
                        </span>
                      </div>
                      
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {announcement.content}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {announcements.length > 3 && (
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
  );
}