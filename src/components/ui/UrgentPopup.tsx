import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { OptimizedImage } from './OptimizedImage';
import { supabase, UrgentPopup as UrgentPopupType } from '../../lib/supabase';

export const UrgentPopup: React.FC = () => {
  const [popups, setPopups] = useState<UrgentPopupType[]>([]);
  const [currentPopup, setCurrentPopup] = useState<UrgentPopupType | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [dismissedPopups, setDismissedPopups] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchActivePopups();
  }, []);

  useEffect(() => {
    if (popups.length > 0 && !currentPopup) {
      // Encontrar o próximo popup que não foi dispensado
      const nextPopup = popups.find(popup => !dismissedPopups.has(popup.id));
      if (nextPopup) {
        setCurrentPopup(nextPopup);
        setIsVisible(true);
        setTimeLeft(nextPopup.auto_close_seconds);
      }
    }
  }, [popups, dismissedPopups, currentPopup]);

  useEffect(() => {
    if (isVisible && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isVisible && timeLeft === 0) {
      handleClose();
    }
  }, [isVisible, timeLeft]);

  const fetchActivePopups = async () => {
    try {
      const { data, error } = await supabase
        .from('urgent_popups')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPopups(data);
    } catch (error) {
      console.error('Error fetching popups:', error);
    }
  };

  const handleClose = () => {
    if (currentPopup) {
      setDismissedPopups(prev => new Set([...prev, currentPopup.id]));
    }
    setIsVisible(false);
    setCurrentPopup(null);
    
    // Verificar se há mais popups para mostrar após um pequeno delay
    setTimeout(() => {
      const nextPopup = popups.find(popup => !dismissedPopups.has(popup.id) && popup.id !== currentPopup?.id);
      if (nextPopup) {
        setCurrentPopup(nextPopup);
        setIsVisible(true);
        setTimeLeft(nextPopup.auto_close_seconds);
      }
    }, 1000);
  };

  const handleLinkClick = () => {
    if (currentPopup?.link_url) {
      window.open(currentPopup.link_url, '_blank', 'noopener,noreferrer');
    }
    handleClose();
  };

  if (!currentPopup || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          className="relative w-full max-w-md"
        >
          <Card className="overflow-hidden shadow-2xl">
            {/* Header com timer */}
            <div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Aviso Importante</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {timeLeft}s
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClose}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-8 h-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Barra de progresso */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <motion.div
                  className="h-full bg-amber-400"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: currentPopup.auto_close_seconds, ease: 'linear' }}
                />
              </div>
            </div>

            {/* Imagem se houver */}
            {currentPopup.image_url && (
              <div className="aspect-video overflow-hidden">
                <OptimizedImage
                  src={currentPopup.image_url}
                  alt={currentPopup.title}
                  width={600}
                  height={338}
                  quality={85}
                  publicId={currentPopup.cloudinary_public_id || undefined}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Conteúdo */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {currentPopup.title}
              </h3>
              
              <div className="text-gray-600 mb-6 leading-relaxed">
                {currentPopup.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-2">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3">
                {currentPopup.link_url && (
                  <Button
                    variant="primary"
                    onClick={handleLinkClick}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {currentPopup.link_text}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className={currentPopup.link_url ? 'flex-1' : 'w-full'}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};