import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, MessageCircle, Share2, X, ZoomIn } from 'lucide-react'; // Adicionado ZoomIn
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { supabase, ParishAnnouncement } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AnnouncementsPageProps {
  onBack: () => void;
}

// Funções auxiliares mantidas fora do componente
const formatFullDateTime = (dateString?: string | null) => {
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

const contactWhatsApp = (announcement: ParishAnnouncement) => {
  if (!announcement.whatsapp_contact) return;
  const phone = announcement.whatsapp_contact.replace(/\D/g, '');
  const message = encodeURIComponent(`Olá! Gostaria de saber mais sobre: ${announcement.title}`);
  window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
};

const shareAnnouncement = (announcement: ParishAnnouncement) => {
  // Usamos encodeURIComponent no slug para garantir que ele seja um hash válido
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
  const [showImageFull, setShowImageFull] = useState(false);

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
    } catch {
      toast.error('Erro ao carregar avisos');
    } finally {
      setLoading(false);
    }
  };

  // CORREÇÃO DO FLUXO DE NAVEGAÇÃO: Usa o hash para abrir o aviso individual
  const handleOpen = (a: ParishAnnouncement) => {
    // Limpa o estado interno e usa o roteamento do App.tsx para carregar o AnnouncementViewPage
    setSelectedAnnouncement(null); 
    // O App.tsx está configurado para ler o hash '#avisos/slug' e renderizar o componente de visualização
    window.location.hash = `#avisos/${a.slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClose = () => {
    setSelectedAnnouncement(null);
    // Usa o onBack que foi passado pelo App.tsx para voltar à lista
    onBack(); 
    // Adiciona o hash #avisos para garantir que o App.tsx volte para a página de lista de avisos
    window.location.hash = '#avisos'; 
  };

  // Lógica de leitura de hash para carregar o aviso diretamente se a URL for digitada
  useEffect(() => {
    if (!announcements.length) return;
    const hash = window.location.hash;
    if (hash.startsWith('#avisos/')) {
      const slug = decodeURIComponent(hash.replace('#avisos/', ''));
      const found = announcements.find(a => a.slug === slug);
      if (found) setSelectedAnnouncement(found);
    }
  }, [announcements]);

  // ======== DETALHE DO AVISO (TELA COMPLETA) - Agora usa a lógica de rota interna ========
  if (selectedAnnouncement) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pt-16"> 
        {/* Cabeçalho FIXO (Ajustado para não ficar por baixo do header principal) */}
        <div className="bg-white shadow-md fixed top-0 left-0 right-0 z-20 p-4 flex items-center justify-between">
          <Button variant="outline" onClick={handleClose} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() => shareAnnouncement(selectedAnnouncement)}
              className="flex items-center gap-2 text-sm"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Conteúdo do aviso */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto w-full">
          {selectedAnnouncement.flyer_url && (
            <div
              className="w-full max-w-3xl mx-auto bg-gray-200 overflow-hidden cursor-zoom-in"
              // ALTERADO: Proporção de imagem mais controlada
              style={{ maxHeight: '70vh' }} 
              onClick={() => setShowImageFull(true)}
            >
              <img
                src={selectedAnnouncement.flyer_url}
                alt={selectedAnnouncement.title}
                className="w-full h-auto object-contain"
              />
            </div>
          )}

          <div className="max-w-3xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedAnnouncement.type === 'event'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {selectedAnnouncement.type === 'event' ? 'Evento' : 'Aviso'}
              </span>
              {selectedAnnouncement.event_date && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {formatFullDateTime(selectedAnnouncement.event_date)}
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              {selectedAnnouncement.title}
            </h1>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed text-justify">
              {selectedAnnouncement.content
                ?.split('\n')
                .map((p, i) => <p key={i} className="mb-4">{p}</p>)}
            </div>

            {/* Botões de Ação no Rodapé do Conteúdo */}
            <div className="flex gap-4 flex-wrap pt-6 border-t mt-8 justify-center">
              <Button
                variant="primary"
                onClick={() => shareAnnouncement(selectedAnnouncement)}
                className="flex items-center gap-2"
              >
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
        </motion.div>

        {/* Lightbox da imagem */}
        <AnimatePresence>
          {showImageFull && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
              onClick={() => setShowImageFull(false)}
            >
              <motion.img
                src={selectedAnnouncement.flyer_url || ''}
                alt={selectedAnnouncement.title}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              <button
                className="absolute top-6 right-6 text-white hover:text-gray-300 z-10"
                onClick={() => setShowImageFull(false)}
              >
                <X className="w-8 h-8" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ======== LISTA DE AVISOS (SE NÃO HOUVER selectedAnnouncement) ========
  // ... (Restante do código da lista de avisos permanece o mesmo) ...

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
          <Button variant={filter === 'all' ? 'primary' : 'outline'} onClick={() => setFilter('all')}>
            Todos
          </Button>
          <Button variant={filter === 'event' ? 'primary' : 'outline'} onClick={() => setFilter('event')}>
            Eventos
          </Button>
          <Button variant={filter === 'announcement' ? 'primary' : 'outline'} onClick={() => setFilter('announcement')}>
            Avisos
          </Button>
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
