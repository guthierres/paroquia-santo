import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Church, Clock, User, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase, Celebration } from '../../lib/supabase';

interface CelebrationsPageProps {
  onBack: () => void;
}

export const CelebrationsPage: React.FC<CelebrationsPageProps> = ({ onBack }) => {
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const daysOfWeek = [
    { id: 'sunday', label: 'Domingo', shortLabel: 'Dom' },
    { id: 'monday', label: 'Segunda-feira', shortLabel: 'Seg' },
    { id: 'tuesday', label: 'Terça-feira', shortLabel: 'Ter' },
    { id: 'wednesday', label: 'Quarta-feira', shortLabel: 'Qua' },
    { id: 'thursday', label: 'Quinta-feira', shortLabel: 'Qui' },
    { id: 'friday', label: 'Sexta-feira', shortLabel: 'Sex' },
    { id: 'saturday', label: 'Sábado', shortLabel: 'Sáb' }
  ];

  useEffect(() => {
    fetchCelebrations();
  }, []);

  const fetchCelebrations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('celebrations')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week', { ascending: true })
        .order('order_index', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      if (data) setCelebrations(data);
    } catch (error) {
      console.error('Error fetching celebrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayLabel = (dayId: string) => {
    return daysOfWeek.find(d => d.id === dayId)?.label || dayId;
  };

  const getDayShortLabel = (dayId: string) => {
    return daysOfWeek.find(d => d.id === dayId)?.shortLabel || dayId;
  };

  const groupCelebrationsByDay = () => {
    const grouped: { [key: string]: Celebration[] } = {};
    
    celebrations.forEach(celebration => {
      if (!grouped[celebration.day_of_week]) {
        grouped[celebration.day_of_week] = [];
      }
      grouped[celebration.day_of_week].push(celebration);
    });

    return grouped;
  };

  const groupedCelebrations = groupCelebrationsByDay();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando celebrações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Celebrações Dominicais</h1>
                <p className="text-amber-200 text-sm sm:text-base">
                  Escala de celebrações da paróquia e comunidades
                </p>
              </div>
            </div>
            <Church className="h-12 w-12 text-amber-400 hidden sm:block" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {celebrations.length === 0 ? (
          <Card className="p-12 text-center">
            <Church className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhuma celebração cadastrada
            </h3>
            <p className="text-gray-500">
              Use o painel administrativo para adicionar as celebrações
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {daysOfWeek.map(day => {
              const dayCelebrations = groupedCelebrations[day.id];
              if (!dayCelebrations || dayCelebrations.length === 0) return null;

              return (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="overflow-hidden">
                    {/* Day Header */}
                    <div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-4 sm:p-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-amber-400" />
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold">{day.label}</h2>
                          <p className="text-amber-200 text-sm">
                            {dayCelebrations.length} celebração{dayCelebrations.length !== 1 ? 'ões' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Celebrations List */}
                    <div className="p-4 sm:p-6">
                      <div className="grid gap-4 sm:gap-6">
                        {dayCelebrations.map((celebration, index) => (
                          <motion.div
                            key={celebration.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
                          >
                            <div className="grid sm:grid-cols-4 gap-4 items-center">
                              {/* Community Name */}
                              <div className="sm:col-span-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Church className="h-4 w-4 text-red-800" />
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                                    Comunidade
                                  </span>
                                </div>
                                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                                  {celebration.community_name}
                                </h3>
                              </div>

                              {/* Celebrant */}
                              <div className="sm:col-span-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="h-4 w-4 text-red-800" />
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                                    Celebrante
                                  </span>
                                </div>
                                <p className="font-medium text-gray-700 text-sm sm:text-base">
                                  {celebration.celebrant_name}
                                </p>
                              </div>

                              {/* Type */}
                              <div className="sm:col-span-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                                    Tipo
                                  </span>
                                </div>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                  celebration.celebration_type === 'Missa'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {celebration.celebration_type}
                                </span>
                              </div>

                              {/* Time */}
                              <div className="sm:col-span-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="h-4 w-4 text-red-800" />
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                                    Horário
                                  </span>
                                </div>
                                <p className="font-bold text-red-800 text-lg">
                                  {celebration.time}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12"
        >
          <Card className="p-6 bg-gradient-to-r from-red-50 to-amber-50 border border-red-100">
            <div className="text-center">
              <Church className="h-8 w-8 text-red-800 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Informações Importantes
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Em caso de alterações na escala ou horários especiais, 
                consulte os avisos paroquiais ou entre em contato conosco. 
                Que Deus abençoe a todos!
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};