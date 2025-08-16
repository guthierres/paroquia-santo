import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Heart, Award, Church } from 'lucide-react';
import { Card } from '../ui/Card';
import { supabase, Parish } from '../../lib/supabase';

export const HistorySection: React.FC = () => {
  const [parishData, setParishData] = useState<Parish | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchParishData();
  }, []);

  const fetchParishData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('parishes')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setParishData(data);
      } else {
        // Use default data if none exists
        setParishData({
          id: '1',
          name: 'Paróquia Senhor Santo Cristo dos Milagres',
          history: `Nossa paróquia foi fundada em 1984, nascendo do sonho e da fé de uma comunidade unida em Cristo. Ao longo destes 40 anos, temos sido testemunhas de inúmeros milagres e bênçãos.

Iniciamos nossas atividades em uma pequena capela, que com o tempo e o crescimento da comunidade, se transformou no belo templo que conhecemos hoje. Nossa história é marcada por momentos de alegria, celebrações memoráveis e o crescimento espiritual de toda nossa família paroquial.

Durante estas quatro décadas, tivemos o privilégio de celebrar milhares de batismos, casamentos, primeiras comunhões e crismas. Cada sacramento celebrado fortaleceu ainda mais os laços de nossa comunidade e nossa fé no Senhor Santo Cristo dos Milagres.

Nossa paróquia sempre esteve comprometida com as obras sociais, ajudando famílias em situação de vulnerabilidade e promovendo a educação cristã para crianças e jovens. Mantemos grupos de oração, pastoral da criança, e diversas atividades que fortalecem nossa comunhão.

Hoje, olhamos para o futuro com esperança, gratos por tudo que o Senhor nos concedeu e prontos para continuar sendo instrumentos de Sua paz e amor em nossa cidade de Tiradentes.`,
          founded_year: 1984,
          address: 'Tiradentes, São Paulo',
          phone: '',
          email: '',
          logo_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching parish data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const milestones = [
    {
      year: '1984',
      title: 'Fundação da Paróquia',
      description: 'Início das atividades religiosas na comunidade',
      icon: Calendar
    },
    {
      year: '1990',
      title: 'Construção do Templo',
      description: 'Inauguração do novo templo para acolher mais fiéis',
      icon: Award
    },
    {
      year: '2000',
      title: 'Expansão da Comunidade',
      description: 'Crescimento significativo do número de paroquianos',
      icon: Users
    },
    {
      year: '2025',
      title: '40 Anos de Fé',
      description: 'Celebração de quatro décadas de bênçãos e milagres',
      icon: Heart
    }
  ];

  if (isLoading) {
    return (
      <section id="history" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando história...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!parishData) {
    return (
      <section id="history" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent mb-4">
              Nossa História
            </h2>
            <Card className="p-12 max-w-2xl mx-auto">
              <Church className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                História em construção
              </h3>
              <p className="text-gray-500">
                Use o painel administrativo para adicionar a história da paróquia
              </p>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="history" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent mb-4">
            Nossa História
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            40 anos de fé, comunhão e milagres em nossa querida Tiradentes
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full text-center group">
                  <div className="mb-4">
                    <milestone.icon className="h-12 w-12 text-red-800 mx-auto mb-3 group-hover:text-amber-600 transition-colors duration-300" />
                    <h3 className="text-2xl font-bold text-red-900 mb-2">{milestone.year}</h3>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">{milestone.title}</h4>
                  <p className="text-gray-600 text-sm">{milestone.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* History Text */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="p-8 lg:p-12">
            <div className="prose prose-lg max-w-none">
              {parishData.logo_url && (
                <div className="text-center mb-8">
                  <img
                    src={parishData.logo_url}
                    alt="Logo da Paróquia"
                    className="w-24 h-24 object-contain mx-auto"
                  />
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-red-900 mb-6 text-center">
                {parishData.name}
              </h3>
              
              {parishData.history.split('\n\n').map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-gray-700 mb-6 leading-relaxed text-justify"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
