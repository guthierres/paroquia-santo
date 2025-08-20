import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Church, User, Mail, Phone } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { OptimizedImage } from '../ui/OptimizedImage';
import { supabase, Priest } from '../../lib/supabase';

export const PriestSection: React.FC = () => {
  const [priests, setPriests] = useState<Priest[]>([]);
  const [selectedPriest, setSelectedPriest] = useState<Priest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPriests();
  }, []);

  const fetchPriests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('priests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setPriests(data);
      } else {
        // Dados padrão se não houver no banco
        const defaultPriest: Priest = {
          id: '1',
          name: 'Padre João Silva',
          title: 'Pároco',
          photo_url: 'https://images.pexels.com/photos/8468502/pexels-photo-8468502.jpeg',
          short_bio: 'Padre João Silva é o pároco da Paróquia Senhor Santo Cristo dos Milagres há mais de 15 anos. Dedicado ao serviço da comunidade, ele tem sido uma fonte de inspiração e orientação espiritual para todos os fiéis.',
          full_bio: `Padre João Silva nasceu em São Paulo em 1975 e desde jovem sentiu o chamado para a vida religiosa. Ordenado sacerdote em 2005, dedicou sua vida ao serviço de Deus e da comunidade.

Chegou à Paróquia Senhor Santo Cristo dos Milagres em 2009, onde tem desenvolvido um trabalho pastoral exemplar. Sob sua liderança, a paróquia cresceu significativamente, tanto em número de fiéis quanto em atividades pastorais.

Padre João é conhecido por sua proximidade com os paroquianos, sempre disponível para ouvir, aconselhar e celebrar os momentos importantes da vida de cada família. Ele coordena diversos grupos pastorais, incluindo a Pastoral da Criança, Grupo de Jovens e Ministério da Eucaristia.

Além de suas atividades paroquiais, Padre João é ativo em obras sociais da região, ajudando famílias em situação de vulnerabilidade e promovendo ações de caridade. Sua dedicação e amor pela comunidade fazem dele uma figura querida e respeitada por todos.

"Minha missão é ser instrumento de Deus para levar esperança, paz e amor a todos que buscam o Senhor", costuma dizer Padre João, refletindo sua filosofia de vida e ministério.`,
          ordination_year: 2005,
          parish_since: 2009,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setPriests([defaultPriest]);
      }
    } catch (error) {
      console.error('Error fetching priests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section id="priest" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando informações...</p>
          </div>
        </div>
      </section>
    );
  }

  if (priests.length === 0) {
    return (
      <section id="priest" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent mb-4">
              Nosso Pároco
            </h2>
            <Card className="p-12 max-w-2xl mx-auto">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Informações do pároco em breve
              </h3>
              <p className="text-gray-500">
                Use o painel administrativo para adicionar informações sobre o pároco
              </p>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const mainPriest = priests[0]; // Assumindo que o primeiro é o pároco principal

  return (
    <>
      <section id="priest" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent mb-4">
              Nosso Pároco
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conheça quem nos guia espiritualmente em nossa jornada de fé
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Card className="overflow-hidden cursor-pointer group" onClick={() => setSelectedPriest(mainPriest)}>
                <div className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Foto do Padre */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <OptimizedImage
                          src={mainPriest.photo_url || 'https://images.pexels.com/photos/8468502/pexels-photo-8468502.jpeg'}
                          alt={mainPriest.name}
                          width={200}
                          height={200}
                          quality={80}
                          className="w-[200px] h-[200px] rounded-full object-cover border-4 border-red-100 group-hover:border-red-300 transition-colors duration-300"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>

                    {/* Informações do Padre */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="mb-4">
                        <h3 className="text-3xl font-bold text-gray-800 mb-2 group-hover:text-red-800 transition-colors duration-300">
                          {mainPriest.name}
                        </h3>
                        <p className="text-xl text-red-800 font-semibold mb-2">
                          {mainPriest.title}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-sm text-gray-600 mb-4">
                          {mainPriest.ordination_year && (
                            <div className="flex items-center gap-2">
                              <Church className="h-4 w-4 text-red-800" />
                              <span>Ordenado em {mainPriest.ordination_year}</span>
                            </div>
                          )}
                          {mainPriest.parish_since && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-red-800" />
                              <span>Na paróquia desde {mainPriest.parish_since}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed mb-6 text-justify">
                        {mainPriest.short_bio}
                      </p>

                      <Button
                        variant="primary"
                        className="group-hover:shadow-lg transition-shadow duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPriest(mainPriest);
                        }}
                      >
                        Ler Biografia Completa
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Outros padres se houver */}
            {priests.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-12"
              >
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
                  Outros Membros do Clero
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {priests.slice(1).map((priest, index) => (
                    <Card 
                      key={priest.id} 
                      className="p-6 cursor-pointer group hover:shadow-lg transition-shadow duration-300"
                      onClick={() => setSelectedPriest(priest)}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={priest.photo_url || 'https://images.pexels.com/photos/8468502/pexels-photo-8468502.jpeg'}
                          alt={priest.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-red-100"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 group-hover:text-red-800 transition-colors">
                            {priest.name}
                          </h4>
                          <p className="text-red-800 text-sm font-medium">{priest.title}</p>
                          <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                            {priest.short_bio}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Modal da Biografia Completa */}
      <AnimatePresence>
        {selectedPriest && (
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
              className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Modal */}
              <div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedPriest.photo_url || 'https://images.pexels.com/photos/8468502/pexels-photo-8468502.jpeg'}
                      alt={selectedPriest.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
                    />
                    <div>
                      <h3 className="text-2xl font-bold">{selectedPriest.name}</h3>
                      <p className="text-amber-200">{selectedPriest.title}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPriest(null)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Foto e Informações Básicas */}
                  <div className="text-center">
                    <img
                      src={selectedPriest.photo_url || 'https://images.pexels.com/photos/8468502/pexels-photo-8468502.jpeg'}
                      alt={selectedPriest.name}
                      className="w-[200px] h-[200px] rounded-full object-cover border-4 border-red-100 mx-auto mb-6"
                    />
                    
                    <div className="space-y-4">
                      {selectedPriest.ordination_year && (
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Church className="h-5 w-5 text-red-800" />
                          <div>
                            <p className="font-medium">Ordenação</p>
                            <p className="text-sm">{selectedPriest.ordination_year}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedPriest.parish_since && (
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Calendar className="h-5 w-5 text-red-800" />
                          <div>
                            <p className="font-medium">Na Paróquia</p>
                            <p className="text-sm">Desde {selectedPriest.parish_since}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Biografia Completa */}
                  <div className="md:col-span-2">
                    <h4 className="text-2xl font-bold text-gray-800 mb-6">Biografia</h4>
                    
                    <div className="prose prose-lg max-w-none">
                      {selectedPriest.full_bio.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="text-gray-700 mb-4 leading-relaxed text-justify">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botão de Fechar */}
                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="primary"
                    onClick={() => setSelectedPriest(null)}
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
