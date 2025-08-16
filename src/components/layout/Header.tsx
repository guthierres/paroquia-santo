import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Church } from 'lucide-react';

interface HeaderProps {
  onNavigate: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Início' },
    { id: 'blog', label: 'Blog' },
    { id: 'timeline', label: 'Linha do Tempo' },
    { id: 'history', label: 'História' },
    { id: 'photos', label: 'Fotos' },
    { id: 'contact', label: 'Contato' }
  ];

  const handleNavigate = (section: string) => {
    onNavigate(section);
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-900/95 to-red-800/95 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavigate('home')}
            whileHover={{ scale: 1.05 }}
          >
            <Church className="h-8 w-8 text-amber-400" />
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-lg">Paróquia Senhor Santo Cristo</h1>
              <p className="text-amber-200 text-sm">40 Anos de Fé</p>
            </div>
          </motion.div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className="text-white hover:text-amber-300 font-medium transition-colors duration-200"
                whileHover={{ y: -2 }}
              >
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-amber-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-red-700/50"
            >
              {menuItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className="block w-full text-left px-4 py-2 text-white hover:text-amber-300 font-medium transition-colors duration-200"
                  whileHover={{ x: 10 }}
                >
                  {item.label}
                </motion.button>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};