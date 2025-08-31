import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Settings as AdminSettingsIcon } from 'lucide-react';
import { Header } from './components/layout/Header';
import { HeroSection } from './components/sections/HeroSection';
import { HistorySection } from './components/sections/HistorySection';
import { PhotoGallery } from './components/sections/PhotoGallery';
import { ContactSection } from './components/sections/ContactSection';
import { TimelineSection } from './components/sections/TimelineSection';
import { SlidesSection } from './components/sections/SlidesSection';
import { AnnouncementsSection } from './components/sections/AnnouncementsSection';
import { BlogSection } from './components/sections/BlogSection';
import { PriestSection } from './components/sections/PriestSection';
import { FullGallery } from './components/sections/FullGallery';
import { CelebrationsPage } from './components/sections/CelebrationsPage';
import { PastoralsPage } from './components/sections/PastoralsPage';
import { AlbumGallery } from './components/sections/AlbumGallery';
import { UrgentPopup } from './components/ui/UrgentPopup';
import { AdminPanel } from './components/admin/AdminPanel';
import { LoginForm } from './components/admin/LoginForm';
import { Button } from './components/ui/Button';
import { supabase } from './lib/supabase';

function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [showCelebrations, setShowCelebrations] = useState(false);
  const [showPastorals, setShowPastorals] = useState(false);
  const [showAlbumGallery, setShowAlbumGallery] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  React.useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setShowAdmin(false);
      }
    });

    // Handle initial URL hash for blog posts and admin routes
    const handleInitialHash = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      
      if (hash.startsWith('#post/')) {
        // Navigate to blog section when a post is accessed directly
        setCurrentSection('blog');
      } else if (path === '/admin' || path === '/login') {
        // Show admin panel or login based on authentication
        if (isAuthenticated) {
          setShowAdmin(true);
        } else {
          setShowLogin(true);
        }
      }
    };

    handleInitialHash();

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigate = (section: string) => {
    if (section === 'celebrations') {
      setShowCelebrations(true);
      setShowFullGallery(false);
      setShowPastorals(false);
      setShowAlbumGallery(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (section === 'pastorals') {
      setShowPastorals(true);
      setShowFullGallery(false);
      setShowCelebrations(false);
      setShowAlbumGallery(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setCurrentSection(section);
    setShowFullGallery(false);
    setShowCelebrations(false);
    setShowPastorals(false);
    setShowAlbumGallery(false);
    
    // Close mobile menu if open
    const mobileMenuButton = document.querySelector('[data-mobile-menu]');
    if (mobileMenuButton) {
      mobileMenuButton.click();
    }
    
    // Navegação melhorada para Android
    setTimeout(() => {
      const element = document.getElementById(section);
      if (element) {
        const headerHeight = window.innerWidth < 1024 ? 56 : 64;
        const elementPosition = element.offsetTop - headerHeight;
        
        // Força scroll para Android
        if (window.navigator.userAgent.includes('Android')) {
          window.scrollTo({ 
            top: elementPosition, 
            behavior: 'auto' // Usa auto no Android para garantir funcionamento
          });
          // Depois aplica smooth se suportado
          setTimeout(() => {
            window.scrollTo({ 
              top: elementPosition, 
              behavior: 'smooth' 
            });
          }, 50);
        } else {
          window.scrollTo({ 
            top: elementPosition, 
            behavior: 'smooth' 
          });
        }
      } else if (section === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 150); // Delay maior para garantir que o menu mobile feche
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setShowAdmin(true);
  };

  const handleShowFullGallery = () => {
    setShowAlbumGallery(true);
    setShowFullGallery(false);
    setShowCelebrations(false);
    setShowPastorals(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromGallery = () => {
    setShowAlbumGallery(false);
    setShowFullGallery(false);
    handleNavigate('photos');
  };

  const handleShowCelebrations = () => {
    setShowCelebrations(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromCelebrations = () => {
    setShowCelebrations(false);
    handleNavigate('home');
  };

  const handleBackFromPastorals = () => {
    setShowPastorals(false);
    handleNavigate('home');
  };

  // Handle browser navigation for admin routes
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      if (path === '/admin' || path === '/login' || hash === '#admin' || hash === '#login') {
        if (isAuthenticated) {
          setShowAdmin(true);
          setShowLogin(false);
        } else {
          setShowLogin(true);
          setShowAdmin(false);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  // Handle direct admin access via URL hash
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash === '#admin' || hash === '#login') {
        if (isAuthenticated) {
          setShowAdmin(true);
          setShowLogin(false);
        } else {
          setShowLogin(true);
          setShowAdmin(false);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-white w-full max-w-full overflow-x-hidden">
      <UrgentPopup />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#7F1D1D',
            color: '#FFF',
          },
        }}
      />
      
      <Header onNavigate={handleNavigate} />

      {showCelebrations ? (
        <CelebrationsPage onBack={handleBackFromCelebrations} />
      ) : showPastorals ? (
        <PastoralsPage onBack={handleBackFromPastorals} />
      ) : showAlbumGallery ? (
        <AlbumGallery onBack={handleBackFromGallery} />
      ) : (
        <main className="w-full max-w-full overflow-x-hidden">
          <SlidesSection />
          <HeroSection onNavigate={handleNavigate} />
          <HistorySection />
          <PriestSection />
          <TimelineSection />
          <PhotoGallery onNavigateToFullGallery={handleShowFullGallery} />
          <AnnouncementsSection />
          <BlogSection onNavigateHome={() => handleNavigate('home')} />
          <ContactSection />
        </main>
      )}

      {/* Admin Access Button - Removed from main page */}
      
      {!showAlbumGallery && !showCelebrations && !showPastorals && (
        <footer className="bg-gradient-to-r from-red-900 to-red-800 text-white py-8 sm:py-12 safe-area-inset-bottom w-full max-w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {/* Redes Sociais */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-amber-200">Siga-nos nas Redes Sociais</h3>
                <div className="flex items-center justify-center gap-6">
                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/paroquiasenhorsantocristo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-blue-600 rounded-full transition-all duration-300 hover:scale-110"
                    title="Facebook"
                  >
                    <svg className="w-5 h-5 text-white group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/paroquiasenhorsantocristo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 rounded-full transition-all duration-300 hover:scale-110"
                    title="Instagram"
                  >
                    <svg className="w-5 h-5 text-white group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/5511985888816"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-green-500 rounded-full transition-all duration-300 hover:scale-110"
                    title="WhatsApp"
                  >
                    <svg className="w-5 h-5 text-white group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-center mb-3">
                <img 
                  src="/footer.webp" 
                  alt="Logo Paróquia" 
                  className="h-8 w-auto object-contain"
                />
              </div>
                            <p className="text-sm text-red-200 mb-2">
                © 2024 Paróquia Senhor Santo Cristo dos Milagres. Cidade Cid. Tiradentes, SP.
              </p>
              <div className="mt-4 pt-3 border-t border-red-700/30">
                <p className="text-xs text-red-300/80">
                  Desenvolvido por <a 
                    href="https://instagram.com/guthierresc" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-red-200 transition-colors duration-200"
                  >
                    Sem. Guthierres
                  </a>
                </p>
              </div>
            </motion.div>
          </div>
        </footer>
      )}

      {/* Admin Modals */}
      <AnimatePresence>
        {showLogin && (
          <LoginForm onLogin={handleLoginSuccess} />
        )}
        {showAdmin && isAuthenticated && (
          <AdminPanel onClose={() => setShowAdmin(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
