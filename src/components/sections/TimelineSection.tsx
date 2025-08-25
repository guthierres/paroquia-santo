import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  image_url?: string;
  created_at: string;
}

export const TimelineSection: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTimelineEvents();
  }, []);

  const fetchTimelineEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .order('year', { ascending: true });

      if (data && data.length > 0) {
        setEvents(data);
      } else {
        // Default timeline events
        const defaultEvents: TimelineEvent[] = [
          {
            id: '1',
            year: 1985,
            title: 'Fundação da Paróquia',
            description: 'Início das atividades religiosas na comunidade de Tiradentes, marcando o começo de uma jornada de fé que perdura até hoje.',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            year: 1990,
            title: 'Construção do Templo',
            description: 'Inauguração do novo templo, um marco arquitetônico que se tornou referência na cidade e acolhe centenas de fiéis.',
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            year: 1995,
            title: 'Primeira Grande Festa',
            description: 'Realização da primeira festa em honra ao Senhor Santo Cristo dos Milagres, tradição que se mantém viva até os dias atuais.',
            created_at: new Date().toISOString()
          },
          {
            id: '4',
            year: 2000,
            title: 'Expansão da Comunidade',
            description: 'Crescimento significativo do número de paroquianos e início dos grupos de oração e pastorais.',
            created_at: new Date().toISOString()
          },
          {
            id: '5',
            year: 2010,
            title: 'Renovação do Templo',
            description: 'Grandes reformas e melhorias na estrutura física da paróquia, modernizando os espaços de celebração.',
            created_at: new Date().toISOString()
          },
          {
            id: '6',
            year: 2020,
            title: 'Era Digital',
            description: 'Adaptação às novas tecnologias com transmissões online das missas durante a pandemia, mantendo a comunidade unida.',
            created_at: new Date().toISOString()
          },
          {
            id: '7',
            year: 2024,
            title: '40 Anos de Fé',
            description: 'Celebração de quatro décadas de bênçãos, milagres e crescimento espiritual da nossa querida comunidade paroquial.',
            created_at: new Date().toISOString()
          }
        ];
        setEvents(defaultEvents);
      }
    } catch (error) {
      console.error('Error fetching timeline events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextEvent = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const prevEvent = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  if (isLoading) {
    return (
      <section id="timeline" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando linha do tempo...</p>
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section id="timeline" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent mb-4">
              Linha do Tempo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              A história da nossa paróquia será exibida aqui
            </p>
            <Card className="p-12 max-w-2xl mx-auto">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Timeline em construção
              </h3>
              <p className="text-gray-500">
                Use o painel administrativo para adicionar eventos históricos da paróquia
              </p>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const currentEvent = events[currentIndex];

  return (
    <section id="timeline" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent mb-4">
            Linha do Tempo
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            40 anos de marcos importantes e momentos especiais
          </p>
        </motion.div>

        {/* Timeline Navigation */}
        {events.length > 1 && (
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button
                variant="outline"
                onClick={prevEvent}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg">
                <Calendar className="h-4 w-4" />
                <span className="font-bold">{currentEvent.year}</span>
              </div>
              
              <Button
                variant="outline"
                onClick={nextEvent}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Timeline Dots */}
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {events.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-red-800' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Current Event */}
        <motion.div
          key={currentEvent.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="overflow-hidden">
            <div className={`grid ${currentEvent.image_url ? 'md:grid-cols-2' : 'grid-cols-1'} gap-8`}>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-800 to-amber-600 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-red-900">{currentEvent.year}</h3>
                    <p className="text-sm text-gray-500">
                      {currentIndex + 1} de {events.length}
                    </p>
                  </div>
                </div>
                
                <h4 className="text-2xl font-bold text-gray-800 mb-4">
                  {currentEvent.title}
                </h4>
                
                <p className="text-gray-600 leading-relaxed">
                  {currentEvent.description}
                </p>
              </div>
              
              {currentEvent.image_url && (
                <div className="md:p-8 p-4">
                  <img
                    src={currentEvent.image_url}
                    alt={currentEvent.title}
                    className="w-[350px] h-[350px] object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity mx-auto"
                    onClick={() => {
                      // Create a modal for the image
                      const modal = document.createElement('div');
                      modal.className = 'fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4';
                      modal.onclick = () => modal.remove();
                      
                      const content = document.createElement('div');
                      content.className = 'relative max-w-4xl max-h-[95vh] bg-white rounded-xl overflow-hidden shadow-2xl';
                      content.onclick = (e) => e.stopPropagation();
                      
                      content.innerHTML = `
                        <button class="absolute top-4 right-4 z-10 bg-white/95 hover:bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center" onclick="this.closest('.fixed').remove()">
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                        <div class="max-h-[95vh] overflow-y-auto">
                          <div class="aspect-video overflow-hidden">
                            <img src="${currentEvent.image_url}" alt="${currentEvent.title}" class="w-full h-full object-cover" />
                          </div>
                          <div class="p-8">
                            <div class="flex items-center gap-3 mb-4">
                              <div class="w-12 h-12 bg-gradient-to-r from-red-800 to-amber-600 rounded-full flex items-center justify-center">
                                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                              </div>
                              <h3 class="text-3xl font-bold text-red-900">${currentEvent.year}</h3>
                            </div>
                            <h1 class="text-3xl font-bold text-gray-800 mb-6">${currentEvent.title}</h1>
                            <p class="text-gray-700 leading-relaxed text-lg">${currentEvent.description}</p>
                          </div>
                        </div>
                      `;
                      
                      modal.appendChild(content);
                      document.body.appendChild(modal);
                    }}
                  />
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* All Years Overview */}
        {events.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16"
          >
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
              Todos os Marcos
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {events.map((event, index) => (
                <motion.button
                  key={event.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`p-4 rounded-lg text-center transition-all ${
                    index === currentIndex
                      ? 'bg-red-800 text-white shadow-lg'
                      : 'bg-white border border-gray-200 hover:border-red-300 hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-lg font-bold mb-1">{event.year}</div>
                  <div className="text-xs opacity-80 line-clamp-2">{event.title}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
