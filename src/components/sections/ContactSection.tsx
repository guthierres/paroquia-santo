import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Church } from 'lucide-react';
import { Card } from '../ui/Card';
import { supabase, Parish, Schedule } from '../../lib/supabase';

export const ContactSection: React.FC = () => {
  const [parishData, setParishData] = useState<Parish | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch parish data
      const { data: parishData } = await supabase
        .from('parishes')
        .select('*')
        .limit(1)
        .single();

      if (parishData) {
        setParishData(parishData);
      }

      // Fetch schedules
      const { data: schedulesData } = await supabase
        .from('schedules')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week', { ascending: true });

      if (schedulesData) {
        setSchedules(schedulesData);
      }
    } catch (error) {
      console.error('Error fetching contact data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayLabel = (dayId: string) => {
    const days: { [key: string]: string } = {
      'sunday': 'Domingo',
      'monday': 'Segunda',
      'tuesday': 'Terça',
      'wednesday': 'Quarta',
      'thursday': 'Quinta',
      'friday': 'Sexta',
      'saturday': 'Sábado'
    };
    return days[dayId] || dayId;
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Endereço',
      content: parishData?.address || 'R. dos Têxteis, 653 - Chacara Santa Etelvina',
      subContent: 'São Paulo - SP, 08490-582 - Cidade Tiradentes'
    },
    {
      icon: Phone,
      title: 'Telefone',
      content: parishData?.phone || '(11) 9999-9999',
      subContent: 'Segunda a Sexta, 8h às 18h'
    },
    {
      icon: Mail,
      title: 'E-mail',
      content: parishData?.email || 'contato@paroquiatiradentes.com.br',
      subContent: 'Resposta em até 24h'
    },
    {
      icon: Clock,
      title: 'Horário de Missas',
      content: schedules.length > 0 ? 'Veja horários ao lado' : 'Dom: 8h, 10h e 19h',
      subContent: schedules.length > 0 ? 'Horários atualizados' : 'Ter a Sex: 19h | Sáb: 17h'
    }
  ];

  const defaultSchedules = [
    { day: 'Domingo', times: '8h00, 10h00 e 19h00' },
    { day: 'Segunda', times: 'Sem missa' },
    { day: 'Terça', times: '19h00' },
    { day: 'Quarta', times: '19h00' },
    { day: 'Quinta', times: '19h00' },
    { day: 'Sexta', times: '19h00' },
    { day: 'Sábado', times: '17h00' }
  ];

  if (isLoading) {
    return (
      <section id="contact" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando informações de contato...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent mb-4">
            Contato
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Venha nos visitar e fazer parte da nossa família paroquial
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              <Church className="h-7 w-7 text-red-800" />
              Informações de Contato
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full">
                    <info.icon className="h-8 w-8 text-red-800 mb-4" />
                    <h4 className="font-semibold text-gray-800 mb-2">{info.title}</h4>
                    <p className="text-gray-700 font-medium mb-1">{info.content}</p>
                    <p className="text-sm text-gray-600">{info.subContent}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Mass Schedule */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-8">
              Horários de Missas
            </h3>
            
            <Card className="p-6">
              <div className="space-y-4">
                {(schedules.length > 0 ? schedules : defaultSchedules).map((schedule, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="font-medium text-gray-800">
                      {schedules.length > 0 ? getDayLabel(schedule.day_of_week || schedule.day) : schedule.day}
                    </span>
                    <div className="text-right">
                      <span className="text-red-800 font-semibold">
                        {schedules.length > 0 ? schedule.time : schedule.times}
                      </span>
                      {schedules.length > 0 && schedule.description && (
                        <div className="text-xs text-gray-600">{schedule.description}</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-6 p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-lg border border-red-100"
              >
                <p className="text-sm text-gray-700">
                  <strong>Nota:</strong> Em datas especiais e festividades, os horários podem sofrer alterações. 
                  Consulte nossos avisos paroquiais ou entre em contato conosco.
                </p>
              </motion.div>
            </Card>
          </motion.div>
        </div>

        {/* Map placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Card className="p-8 text-center bg-gradient-to-br from-red-50 to-amber-50">
            <MapPin className="h-16 w-16 text-red-800 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Localização
            </h3>
            <p className="text-gray-600 mb-6">
              Estamos localizados no coração da Cidade Tiradentes, São Paulo. 
              Venha nos visitar e participar das nossas celebrações.
            </p>
            <a
              href="https://maps.app.goo.gl/i7CEYTHvX4pAKrmR8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:bg-red-50 transition-colors duration-200 rounded-lg p-3 group"
            >
              <p className="text-lg font-semibold text-red-800 mb-2 group-hover:text-red-900 transition-colors">
                R. dos Têxteis, 653 - Chacara Santa Etelvina
              </p>
              <p className="text-base text-gray-700 group-hover:text-gray-800 transition-colors">
                São Paulo - SP, 08490-582 - Cidade Tiradentes
              </p>
              <div className="flex items-center justify-center gap-2 mt-2 text-sm text-red-600 group-hover:text-red-700 transition-colors">
                <MapPin className="h-4 w-4" />
                <span>Abrir no Google Maps</span>
              </div>
            </a>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
