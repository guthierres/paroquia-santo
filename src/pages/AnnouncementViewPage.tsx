import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Share2, MessageCircle, Loader } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase, ParishAnnouncement } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AnnouncementViewPageProps {
  slug: string;
  onBack: () => void;
}

export const AnnouncementViewPage: React.FC<AnnouncementViewPageProps> = ({ slug, onBack }) => {
  const [announcement, setAnnouncement] = useState<ParishAnnouncement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncement();
  }, [slug]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parish_announcements')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Aviso não encontrado');
        onBack();
        return;
      }

      setAnnouncement(data);
    } catch (error) {
      console.error('Error fetching announcement:', error);
      toast.error('Erro ao carregar aviso');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const shareAnnouncement = () => {
    if (!announcement) return;

    const url = `${window.location.origin}/#avisos/${announcement.slug}`;
    const text = `${announcement.title}`;

    if (navigator.share) {
      navigator.share({ title: announcement.title, text, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    }
  };

  const contactWhatsApp = () => {
    if (!announcement?.whatsapp_contact) return;

    const phone = announcement.whatsapp_contact.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá! Gostaria de saber mais sobre: ${announcement.title}`);
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="h-8 w-8 animate-spin text-red-800" />
      </div>
    );
  }

  if (!announcement) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {announcement.flyer_url && (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={announcement.flyer_url}
                alt={announcement.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                announcement.type === 'event'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {announcement.type === 'event' ? 'Evento' : 'Aviso'}
              </span>
              {announcement.event_date && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {new Date(announcement.event_date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {announcement.title}
            </h1>

            <div className="prose prose-lg max-w-none mb-8">
              {announcement.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="flex gap-4 flex-wrap pt-6 border-t">
              <Button
                variant="primary"
                onClick={shareAnnouncement}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>

              {announcement.whatsapp_contact && (
                <Button
                  variant="outline"
                  onClick={contactWhatsApp}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Entrar em Contato
                </Button>
              )}
            </div>

            <div className="mt-6 pt-6 border-t text-sm text-gray-500">
              Publicado em {new Date(announcement.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
};
