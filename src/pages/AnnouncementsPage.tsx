import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { supabase, ParishAnnouncement } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AnnouncementsPageProps {
  onBack: () => void;
}

// Formata data
const formatFullDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return 'Data não definida';
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

// Abre WhatsApp
const contactWhatsApp = (announcement: ParishAnnouncement) => {
  if (!announcement.whatsapp_contact) return;
  const phone = announcement.whatsapp_contact.replace(/\D/g, '');
  const message = encodeURIComponent(`Olá! Gostaria de saber mais sobre: ${announcement.title}`);
  window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
};

// Compartilhar
const shareAnnouncement = (announcement: ParishAnnouncement) => {
  const url = `${window.location.origin}/#avisos/${encodeURIComponent(announcement.slug)}`;
  if (navigator.share) {
    navigator.share({ title: announcement.title, text: announcement.title, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => toast.success('Link copiado!'));
  }
};

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ onBack }) => {
  const [announcements, setAnnouncements] = useState<ParishAnnouncement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<ParishAnnouncement | null>(null);
  const [filter, setFilter] = useState<'all' | 'event' | 'announcement'>('all');
  const [loading, setLoading] = useState(true);

  // Busca dados
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parish_announcements')
        .select('*')
        .eq('is_published', true)
        .order('event_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar avisos');
    } finally {
      setLoading(false);
    }
  };

  // Abre aviso (tela cheia)
  const handleOpen = (a: ParishAnnouncement) => {
    setSelectedAnnouncement(a);
    history.replaceState(null, '', `#avisos/${a.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fecha aviso
  const handleClose = () => {
    setSelectedAnnouncement(null);
    history.replaceState(null, '', window.location.pathname);
  };

  // Detecta hash na URL (abre aviso direto)
  useEffect(() => {
    if (!announcements.length) return;
    const hash = window.location.hash;
    if (hash.startsWith('#avisos/')) {
      const slug = decodeURIComponent(hash.replace('#avisos/', ''));
      const found = announcements.find(a => a.slug === slug);
      if (found) setSelectedAnnouncement(found);
    }
  }, [announcements]);

  // Se estiver em modo “detalhe” (tela cheia)
  if (selectedAnnouncement) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white shadow-md sticky top-0 z-10 p-4 flex items-center justify-between">
          <Button variant="outline" onClick={handleClose} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => shareAnnouncement(selectedAnnouncement)} className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
            {selectedAnnouncement.whatsapp_contact && (
              <Button
                variant="outline"
                onClick={() => contactWhatsApp(selectedAnnouncement)}
                className="flex items-center gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            )}
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto">
          {selectedAnnouncement.flyer_url && (
            <div className="w-full aspect-video bg-gray-200 overflow-hidden">
              <img
                src={selectedAnnouncement.flyer_url}
                alt={selectedAnnouncement.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedAnnouncement.type === 'event'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {selectedAnnouncement.type === 'event' ? 'Evento' : 'Aviso'}
              </span>
              {selectedAnnouncement.event_date && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {formatFullDateTime(selectedAnnouncement.event_date)}
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {selectedAnnouncement.title}
            </h1>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {selectedAnnouncement.content
                ?.split('\n')
                .map((p, i) => <p key={i} className="mb-4">{p}</p>)}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Página principal (lista)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Carregando avisos...</p>
      </div>
    );
  }

  const filtered = announcements.filter(a => filter === 'all' || a.type === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Button variant="outline" onClick={onBack} className="mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Avisos e Eventos</h1>
        <p className="text-lg text-gray-600 mb-6">Fique por dentro das novidades da paróquia</p>

        <div className="flex gap-3 mb-8 flex-wrap">
          <Button variant={filter === 'all' ? 'primary' : 'outline'} onClick={() => setFilter('all')}>Todos</Button>
          <Button variant={filter === 'event' ? 'primary' : 'outline'} onClick={() => setFilter('event')}>Eventos</Button>
          <Button variant={filter === 'announcement' ? 'primary' : 'outline'} onClick={() => setFilter('announcement')}>Avisos</Button>
        </div>

        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <h3 className="text-lg text-gray-600">Nenhum aviso encontrado</h3>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleOpen(a)}
                className="cursor-pointer group"
              >
                <Card className="overflow-hidden h-full flex flex-col">
                  {a.flyer_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={a.flyer_url}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-800 transition">
                      {a.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3 flex-1">{a.content}</p>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      {a.event_date && (
                        <>
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(a.event_date).toLocaleDateString('pt-BR')}
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
