import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '../ui/Button';
import { OptimizedImage } from '../ui/OptimizedImage';
import { supabase, Slide } from '../../lib/supabase';

export const SlidesSection: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    if (!isAutoPlay || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, slides.length]);

  const fetchSlides = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (data && data.length > 0) {
        setSlides(data);
      } else {
        // Default slides with Pexels images
        const defaultSlides: Slide[] = [
          {
            id: '1',
            title: '40 Anos de Fé e Comunhão',
            description: 'Celebrando quatro décadas de bênçãos, milagres e união em Cristo',
            image_url: 'https://images.pexels.com/photos/8468459/pexels-photo-8468459.jpeg',
            order_index: 0,
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Nossa Comunidade Unida',
            description: 'Fiéis de todas as idades unidos pela fé no Senhor Santo Cristo dos Milagres',
            image_url: 'https://images.pexels.com/photos/7220900/pexels-photo-7220900.jpeg',
            order_index: 1,
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Tradição e Modernidade',
            description: 'Preservando nossa rica tradição enquanto abraçamos o futuro com esperança',
            image_url: 'https://images.pexels.com/photos/6608313/pexels-photo-6608313.jpeg',
            order_index: 2,
            is_active: true,
            created_at: new Date().toISOString()
          }
        ];
        setSlides(defaultSlides);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  if (isLoading) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-red-800">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando slides...</p>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-red-800">
        <div className="text-center text-white max-w-2xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Paróquia Senhor Santo Cristo dos Milagres
          </h1>
          <p className="text-xl md:text-2xl text-amber-200 mb-4">
            40 Anos de Fé e Comunhão
          </p>
          <p className="text-lg text-amber-100">
            Tiradentes, São Paulo
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <OptimizedImage
            src={slides[currentSlide].image_url}
            alt={slides[currentSlide].title}
            width={1920}
            height={1080}
            quality={85}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.h1
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
              >
                {slides[currentSlide].title}
              </motion.h1>
              
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl md:text-2xl text-gray-200 leading-relaxed px-2"
              >
                {slides[currentSlide].description}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          {/* Mobile Navigation - Swipe indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 sm:hidden">
            <div className="flex gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden sm:block">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-full px-6 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
          </div>
          
          {/* Mobile Side Navigation */}
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 sm:hidden bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full w-12 h-12 p-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 sm:hidden bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full w-12 h-12 p-0"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Slide Counter */}
      {slides.length > 1 && (
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-20 bg-white/10 backdrop-blur-md rounded-lg px-3 py-1 sm:px-4 sm:py-2">
          <span className="text-white text-xs sm:text-sm font-medium">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      )}
    </section>
  );
};