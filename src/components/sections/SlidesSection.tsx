import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase, Slide } from '../../lib/supabase';

export const SlidesSection: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length > 1 && !isMobile) {
      const nextIndex = (currentSlide + 1) % slides.length;
      const nextSlide = slides[nextIndex];
      if (nextSlide?.image_url && !imageLoaded[nextIndex]) {
        const img = new Image();
        img.onload = () => setImageLoaded(prev => ({ ...prev, [nextIndex]: true }));
        img.src = nextSlide.image_url;
      }
    }
  }, [currentSlide, slides, imageLoaded, isMobile]);

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
        if (data[0]?.image_url) {
          const img = new Image();
          img.onload = () => setImageLoaded(prev => ({ ...prev, 0: true }));
          img.src = data[0].image_url;
        }
      } else {
        const defaultSlides: Slide[] = [
          {
            id: '1',
            title: '40 Anos de Fé e Comunhão',
            description: 'Celebrando quatro décadas de bênçãos, milagres e união em Cristo',
            image_url: 'https://images.pexels.com/photos/8468459/pexels-photo-8468459.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
            order_index: 0,
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Nossa Comunidade Unida',
            description: 'Fiéis de todas as idades unidos pela fé no Senhor Santo Cristo dos Milagres',
            image_url: 'https://images.pexels.com/photos/7220900/pexels-photo-7220900.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
            order_index: 1,
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Tradição e Modernidade',
            description: 'Preservando nossa rica tradição enquanto abraçamos o futuro com esperança',
            image_url: 'https://images.pexels.com/photos/6608313/pexels-photo-6608313.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
            order_index: 2,
            is_active: true,
            created_at: new Date().toISOString()
          }
        ];
        setSlides(defaultSlides);
        const img = new Image();
        img.onload = () => setImageLoaded(prev => ({ ...prev, 0: true }));
        img.src = defaultSlides[0].image_url;
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    const newIndex = (currentSlide + 1) % slides.length;
    setCurrentSlide(newIndex);
    preloadImage(newIndex);
  };

  const prevSlide = () => {
    const newIndex = (currentSlide - 1 + slides.length) % slides.length;
    setCurrentSlide(newIndex);
    preloadImage(newIndex);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    preloadImage(index);
  };

  const preloadImage = (index: number) => {
    if (!imageLoaded[index] && slides[index]?.image_url) {
      const img = new Image();
      img.onload = () => setImageLoaded(prev => ({ ...prev, [index]: true }));
      img.src = slides[index].image_url;
    }
  };

  const handleButtonClick = (slide: Slide) => {
    if (!slide.button_link) return;

    if (slide.button_link_type === 'external') {
      window.open(slide.button_link, '_blank', 'noopener,noreferrer');
    } else {
      const targetId = slide.button_link.replace('#', '');
      const element = document.getElementById(targetId);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (slide.button_open_new_tab) {
        window.open(slide.button_link, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = slide.button_link;
      }
    }
  };

  const getSlidePosition = (index: number) => {
    const diff = index - currentSlide;
    const total = slides.length;

    if (diff > total / 2) return diff - total;
    if (diff < -total / 2) return diff + total;
    return diff;
  };

  if (isLoading) {
    return (
      <section className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center bg-gradient-to-br from-red-900 to-red-800">
        <div className="text-center text-white px-4">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-base sm:text-lg">Carregando slides...</p>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center bg-gradient-to-br from-red-900 to-red-800">
        <div className="text-center text-white max-w-2xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6">
            Paróquia Senhor Santo Cristo dos Milagres
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-amber-200 mb-2 sm:mb-4">
            40 Anos de Fé e Comunhão
          </p>
          <p className="text-sm sm:text-base md:text-lg text-amber-100">
            Cid. Tiradentes, São Paulo
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-br from-red-900 to-red-800">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full max-w-7xl mx-auto px-4">
          <div className="relative h-full flex items-center justify-center" style={{ perspective: '2000px' }}>
            {slides.map((slide, index) => {
              const position = getSlidePosition(index);
              const isActive = position === 0;
              const isVisible = Math.abs(position) <= (isMobile ? 0 : 1);

              if (!isVisible && !isMobile) return null;

              return (
                <motion.div
                  key={slide.id}
                  className="absolute"
                  initial={false}
                  animate={{
                    x: isMobile ? `${position * 100}%` : `${position * 55}%`,
                    scale: isActive ? 1 : 0.85,
                    z: isActive ? 0 : -100,
                    opacity: Math.abs(position) > 1 ? 0 : 1,
                    rotateY: isMobile ? 0 : position * 15,
                  }}
                  transition={{
                    duration: 0.5,
                    ease: 'easeInOut'
                  }}
                  style={{
                    width: isMobile ? '90%' : '60%',
                    transformStyle: 'preserve-3d',
                    zIndex: isActive ? 10 : 5 - Math.abs(position),
                  }}
                >
                  <div
                    className={`relative rounded-xl overflow-hidden shadow-2xl ${
                      isActive ? 'cursor-default' : 'cursor-pointer'
                    }`}
                    onClick={() => !isActive && goToSlide(index)}
                    style={{
                      aspectRatio: '16/9',
                      filter: isActive ? 'none' : 'brightness(0.6)',
                    }}
                  >
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.style.background = 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)';
                        }
                      }}
                    />

                    {isActive && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:p-12">
                          <motion.h2
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg"
                          >
                            {slide.title}
                          </motion.h2>

                          <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 mb-4 md:mb-6 max-w-3xl drop-shadow-md"
                          >
                            {slide.description}
                          </motion.p>

                          {slide.button_text && slide.button_link && (
                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ duration: 0.6, delay: 0.6 }}
                            >
                              <Button
                                onClick={() => handleButtonClick(slide)}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                              >
                                {slide.button_text}
                                {slide.button_link_type === 'external' && (
                                  <ExternalLink className="ml-2 h-4 w-4 inline-block" />
                                )}
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 hover:scale-110"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 hover:scale-110"
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          {/* BLOCO REMOVIDO: 
            Aqui estava a div com os botões circulares de navegação.
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'bg-white w-8 h-2'
                        : 'bg-white/50 w-2 h-2 hover:bg-white/70'
                    }`}
                    aria-label={`Ir para slide ${index + 1}`}
                  />
                ))}
              </div>
            </div> 
          */}
        </>
      )}
    </section>
  );
};
