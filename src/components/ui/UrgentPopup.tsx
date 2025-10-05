import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { Button } from './Button';
import { supabase, UrgentPopup as UrgentPopupType } from '../../lib/supabase';

export const UrgentPopup: React.FC = () => {
  const [popup, setPopup] = useState<UrgentPopupType | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    fetchActivePopup();
  }, []);

  useEffect(() => {
    if (popup && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (popup && timeLeft === 0) {
      handleAutoClose();
    }
  }, [popup, timeLeft]);

  const fetchActivePopup = async () => {
    try {
      const { data, error } = await supabase
        .from('urgent_popups')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const activePopup = data[0];
        
        // Verificar se o usuário já viu este pop-up
        const seenKey = `popup_seen_${activePopup.id}`;
        const hasSeenPermanently = localStorage.getItem(seenKey) === 'true';
        const hasSeenThisSession = sessionStorage.getItem(seenKey) === 'true';

        if (!hasSeenPermanently && !hasSeenThisSession) {
          setPopup(activePopup);
          setTimeLeft(activePopup.auto_close_seconds);
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('Error fetching popup:', error);
    }
  };

  const handleClose = (permanent: boolean = false) => {
    if (!popup) return;
    
    setIsClosing(true);
    
    const seenKey = `popup_seen_${popup.id}`;
    
    if (permanent) {
      // Não mostrar novamente (permanente)
      localStorage.setItem(seenKey, 'true');
    } else {
      // Não mostrar apenas nesta sessão
      sessionStorage.setItem(seenKey, 'true');
    }

    setTimeout(() => {
      setIsVisible(false);
      setPopup(null);
      setIsClosing(false);
    }, 300);
  };

  const handleAutoClose = () => {
    handleClose(false); // Auto-close apenas para esta sessão
  };

  const handleLinkClick = () => {
    if (popup?.link_url) {
      window.open(popup.link_url, '_blank', 'noopener,noreferrer');
    }
    handleClose(false);
  };

  // Limpar dados antigos do localStorage (mais de 30 dias)
  useEffect(() => {
    const cleanOldData = () => {
      try {
        const keys = Object.keys(localStorage);
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        keys.forEach(key => {
          if (key.startsWith('popup_seen_')) {
            const timestamp = localStorage.getItem(`${key}_timestamp`);
            if (timestamp && parseInt(timestamp) < thirtyDaysAgo) {
              localStorage.removeItem(key);
              localStorage.removeItem(`${key}_timestamp`);
            }
          }
        });
      } catch (error) {
        console.warn('Error cleaning old popup data:', error);
      }
    };

    cleanOldData();
  }, []);

  if (!popup || !isVisible) return null;

  const progressPercentage = ((popup.auto_close_seconds - timeLeft) / popup.auto_close_seconds) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ 
            scale: isClosing ? 0.9 : 1, 
            opacity: isClosing ? 0 : 1, 
            y: isClosing ? 20 : 0 
          }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-red-600 to-red-800"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600">Aviso Importante</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{timeLeft}s</span>
              <button
                onClick={() => handleClose(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {popup.image_url && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={popup.image_url}
                  alt={popup.title}
                  className="w-full h-48 object-cover"
                  loading="eager"
                />
              </div>
            )}

            <h3 className="text-xl font-bold text-gray-800 mb-3">
              {popup.title}
            </h3>

            <div className="prose prose-sm max-w-none mb-6">
              {popup.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-600 mb-2 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {popup.link_url && (
                <Button
                  variant="primary"
                  onClick={handleLinkClick}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {popup.link_text}
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleClose(true)}
                  className="flex-1 text-sm"
                >
                  Não mostrar novamente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleClose(false)}
                  className="flex-1 text-sm"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};