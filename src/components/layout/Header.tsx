import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Church } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface HeaderProps {
  onNavigate: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoAlt, setLogoAlt] = useState('Logo da Paróquia');

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('logo_url, logo_alt')
        .eq('key', 'logo_settings')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setLogoUrl(data.logo_url);
        setLogoAlt(data.logo_alt || 'Logo da Paróquia');
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  };

  const menuItems = [
    { id: 'home', label: 'Início' },
    { id: 'history', label: 'História' },
    { id: 'pastorals', label: 'Pastorais' },
    { id: 'programs', label: 'Programações' },
    { id: 'announcements', label: 'Eventos' },
    { id: 'blog', label: 'Blog' },
    { id: 'photos', label: 'Fotos' },
    { id: 'festa2025', label: 'Festa 2025 🎉' },
    { id: 'contact', label: 'Contato' }
  ];

  const handleNavigate = (section: string) => {
    onNavigate(section);
    setIsMenuOpen(false);
  };

  // Função específica para Android com preventDefault e stopPropagation
  const handleMobileNavigate = (e: React.MouseEvent, section: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Força o fechamento do menu primeiro
    setIsMenuOpen(false);
    
    // Pequeno delay para garantir que o menu feche antes da navegação
    setTimeout(() => {
      onNavigate(section);
    }, 100);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-900/95 to-red-800/95 backdrop-blur-md shadow-lg safe-area-inset-top will-change-transform w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 w-full">
          <motion.div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            onClick={() => handleNavigate('home')}
            whileHover={{ scale: 1.05 }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={logoAlt}
                className="h-8 sm:h-12 w-auto object-contain max-w-[200px] sm:max-w-[300px]"
              />
            ) : (
              <>
                <Church className="h-6 w-6 sm:h-8 sm:w-8 text-amber-400" />
                <div className="hidden sm:block">
                  <h1 className="text-white font-bold text-sm sm:text-lg">Paróquia Senhor Santo Cristo</h1>
                  <p className="text-amber-200 text-xs sm:text-sm">40 Anos de Fé</p>
                </div>
                <div className="block sm:hidden">
                  <h1 className="text-white font-bold text-sm">Paróquia Santo Cristo</h1>
                </div>
              </>
            )}
          </motion.div>

          {/* Hamburger Menu Button - Always visible */}
          <button
            className="text-white hover:text-amber-300 p-2 -mr-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ touchAction: 'manipulation' }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="py-4 border-t border-red-700/50 bg-red-900/98 backdrop-blur-md w-full max-w-full overflow-hidden"
            >
              {menuItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="mx-2 w-auto max-w-full"
                  whileHover={{ x: 10 }}
                >
                  <button
                    onClick={(e) => handleMobileNavigate(e, item.id)}
                    className="block w-full text-left px-4 py-3 text-white hover:text-amber-300 font-medium transition-colors duration-200 hover:bg-red-800/50 rounded-lg touch-manipulation max-w-full overflow-hidden"
                    style={{ 
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                      minHeight: '48px'
                    }}
                  >
                    {item.label}
                  </button>
                </motion.div>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
