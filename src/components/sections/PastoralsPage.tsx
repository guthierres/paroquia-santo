import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Phone, User, Heart, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase, Pastoral } from '../../lib/supabase';

interface PastoralsPageProps {
  onBack: () => void;
}

export const PastoralsPage: React.FC<PastoralsPageProps> = ({ onBack }) => {
  const [pastorals, setPastorals] = useState<Pastoral[]>([]);
  const [selectedPastoral, setSelectedPastoral] = useState<Pastoral | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPastorals();
  }, []);

  const fetchPastorals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pastorals')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data) setPastorals(data);
    } catch (error) {
      console.error('Error fetching pastorals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactClick = (phone: string) => {
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pastorais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Header */}
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
                <h1 className="text-2xl sm:text-3xl font-bold">Pastorais da Paróquia</h1>
                <p className="text-amber-200 text-sm sm:text-base truncate">
                  Conheça nossos grupos pastorais e como participar
                </p>
              </div>
            </div>
            <Heart className="h-8 w-8 sm:h-12 sm:w-12 text-amber-400 flex-shrink-0" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pastorals.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhuma pastoral cadastrada
            </h3>
            <p className="text-gray-500">
              Use o painel administrativo para adicionar as pastorais da paróquia
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastorals.map((pastoral, index) => (
              <motion.div
                key={pastoral.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="group h-full flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                  <div
                    className="p-6 flex-1 flex flex-col"
                    onClick={() => setSelectedPastoral(pastoral)}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-red-100 rounded-full">
                        <Heart className="h-6 w-6 text-red-800" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-800 transition-colors">
                          {pastoral.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-4 w-4 text-red-800" />
                      <span className="text-sm text-gray-600">Coordenador:</span>
                      <span className="text-sm font-medium text-gray-800">{pastoral.coordinator}</span>
                    </div>

                    <p className="text-gray-600 mb-4 flex-1 line-clamp-3 text-sm leading-relaxed">
                      {pastoral.description}
                    </p>

                    {pastoral.contact_phone && (
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContactClick(pastoral.contact_phone);
                          }}
                          className="w-full flex items-center justify-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Phone className="h-4 w-4" />
                          Entrar em Contato
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Informações Gerais */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12"
        >
          <Card className="p-6 bg-gradient-to-r from-red-50 to-amber-50 border border-red-100">
            <div className="text-center">
              <Users className="h-8 w-8 text-red-800 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Venha Participar!
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Todas as pastorais estão abertas para novos membros. 
                Entre em contato com os coordenadores para saber mais sobre como participar 
                e contribuir com a missão da nossa paróquia.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedPastoral && (
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
              {/* Header do Modal */}
              <div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="h-6 w-6" />
                    <div>
                      <h3 className="text-xl font-bold">{selectedPastoral.name}</h3>
                      <p className="text-amber-200 text-sm">Pastoral da Paróquia</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPastoral(null)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <div className="space-y-6">
                  {/* Coordenador */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <User className="h-6 w-6 text-red-800" />
                    <div>
                      <p className="text-sm text-gray-600">Coordenador(a)</p>
                      <p className="font-semibold text-gray-800">{selectedPastoral.coordinator}</p>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Sobre a Pastoral</h4>
                    <div className="prose max-w-none">
                      {selectedPastoral.description.split('\n').map((paragraph, index) => (
                        <p key={index} className="text-gray-700 mb-4 leading-relaxed text-justify">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Contato */}
                  {selectedPastoral.contact_phone && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Entre em Contato
                      </h4>
                      <p className="text-green-700 text-sm mb-3">
                        Para saber mais sobre a {selectedPastoral.name} ou para participar, 
                        entre em contato com o coordenador:
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => handleContactClick(selectedPastoral.contact_phone)}
                        className="w-full flex items-center justify-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-100 border-green-300"
                      >
                        <Phone className="h-4 w-4" />
                        {selectedPastoral.contact_phone} (WhatsApp)
                      </Button>
                    </div>
                  )}
                </div>

                {/* Botão de Fechar */}
                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="primary"
                    onClick={() => setSelectedPastoral(null)}
                  >
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