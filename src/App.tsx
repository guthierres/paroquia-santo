import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Settings } from 'lucide-react';
import { Header } from './components/layout/Header';
import { HeroSection } from './components/sections/HeroSection';
import { HistorySection } from './components/sections/HistorySection';
import { PhotoGallery } from './components/sections/PhotoGallery';
import { ContactSection } from './components/sections/ContactSection';
import { TimelineSection } from './components/sections/TimelineSection';
import { SlidesSection } from './components/sections/SlidesSection';
import { BlogSection } from './components/sections/BlogSection';
import { FullGallery } from './components/sections/FullGallery';
import { AdminPanel } from './components/admin/AdminPanel';
import { LoginForm } from './components/admin/LoginForm';
import { Button } from './components/ui/Button';
import { supabase } from './lib/supabase';

function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [showFullGallery, setShowFullGallery] = useState(false);
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
    setCurrentSection(section);
    setShowFullGallery(false);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setShowAdmin(true);
  };

  const handleShowFullGallery = () => {
    setShowFullGallery(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromGallery = () => {
    setShowFullGallery(false);
    handleNavigate('photos');
  };

  // Handle browser navigation for admin routes
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin' || path === '/login') {
        if (isAuthenticated) {
          setShowAdmin(true);
        } else {
          setShowLogin(true);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-white">
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

      {showFullGallery ? (
        <FullGallery onBack={handleBackFromGallery} />
      ) : (
        <main>
          <SlidesSection />
          <HeroSection onNavigate={handleNavigate} />
          <HistorySection />
          <TimelineSection />
          <PhotoGallery onNavigateToFullGallery={handleShowFullGallery} />
          <BlogSection onNavigateHome={() => handleNavigate('home')} />
          <ContactSection />
        </main>
      )}

      {!showFullGallery && (
        <footer className="bg-gradient-to-r from-red-900 to-red-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h3 className="text-2xl font-bold mb-4">
                Paróquia Senhor Santo Cristo dos Milagres
              </h3>
              <p className="text-amber-200 mb-6">
                40 Anos de Fé, Esperança e Amor
              </p>
              <p className="text-sm text-red-200">
                © 2024 Paróquia Senhor Santo Cristo dos Milagres. Cidade Tiradentes, SP.
              </p>
              <p className="text-xs text-red-300 mt-2">
                "Que o Senhor abençoe a todos que visitam nossa casa"
              </p>
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
