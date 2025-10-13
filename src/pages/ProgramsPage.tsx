import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase, Program } from '../lib/supabase';

interface ProgramsPageProps {
  onBack: () => void;
}

export const ProgramsPage: React.FC<ProgramsPageProps> = ({ onBack }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
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
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data) setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayLabel = (dayId: string) => {
    return daysOfWeek.find(d => d.id === dayId)?.label || dayId;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando programações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      <div className="bg-gradient-to-r from-red-900 to-red-800 text-white shadow-lg sticky top-0 z-50 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <Button
                variant="outline"
                onClick={onBack}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 flex items-center gap-1 sm:gap-2 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold">Programações</h1>
                <p className="text-amber-200 text-sm sm:text-base truncate">
                  Conheça as programações da paróquia
                </p>
              </div>
            </div>
            <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-amber-400 flex-shrink-0" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {programs.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhuma programação cadastrada
            </h3>
            <p className="text-gray-500">
              Use o painel administrativo para adicionar as programações
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden h-full hover:shadow-xl transition-shadow duration-300">
                  {program.featured_image && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={program.featured_image}
                        alt={program.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {program.title}
                    </h3>

                    {program.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {program.description}
                      </p>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="h-4 w-4 text-red-800" />
                        <span className="font-semibold">{program.time}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-red-800 mt-1 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {program.days_of_week.map(day => (
                            <span
                              key={day}
                              className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium"
                            >
                              {getDayLabel(day)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12"
        >
          <Card className="p-6 bg-gradient-to-r from-red-50 to-amber-50 border border-red-100">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-red-800 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Participe!
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Venha participar das programações da nossa paróquia.
                Para mais informações, entre em contato conosco.
                Que Deus abençoe a todos!
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
