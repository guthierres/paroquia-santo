import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase, Parish } from '../../lib/supabase';

export const WhatsAppButton: React.FC = () => {
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchWhatsAppNumber();

    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchWhatsAppNumber = async () => {
    try {
      const { data } = await supabase
        .from('parishes')
        .select('whatsapp_phone')
        .limit(1)
        .single();

      if (data?.whatsapp_phone) {
        setWhatsappNumber(data.whatsapp_phone);
      }
    } catch (error) {
      console.error('Error fetching WhatsApp number:', error);
    }
  };

  const handleClick = () => {
    if (!whatsappNumber) return;

    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const message = encodeURIComponent('Olá! Gostaria de mais informações.');
    window.open(`https://wa.me/55${cleanNumber}?text=${message}`, '_blank');
  };

  if (!whatsappNumber) return null;

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Contato via WhatsApp"
      title="Fale conosco pelo WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
};
