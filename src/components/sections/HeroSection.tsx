import React from 'react';
import { motion } from 'framer-motion';
import { Church, Calendar, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-amber-800"></div>
      
      {/* Overlay Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <Church className="h-20 w-20 text-amber-400 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Paróquia Senhor Santo Cristo
          </h1>
          <p className="text-xl md:text-2xl text-amber-200 mb-2">
            dos Milagres
          </p>
          <p className="text-lg text-amber-100 mb-8">
            Tiradentes, São Paulo
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-amber-300 mb-4">
            40 Anos de Fé e Comunhão
          </h2>
          <p className="text-lg text-white leading-relaxed mb-6">
            Celebrando quatro décadas de fé, esperança e amor em nossa comunidade. 
            Uma jornada de milagres, bênçãos e união entre irmãos em Cristo.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 text-white/90 mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-amber-400" />
              <span>Fundada em 1984</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-amber-400" />
              <span>Tiradentes, SP</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigate('history')}
            >
              Conheça Nossa História
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate('photos')}
            >
              Ver Fotos
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-white/70"
        >
          <p className="text-sm">
            "Porque onde estiverem dois ou três reunidos em meu nome, aí estou eu no meio deles."
          </p>
          <p className="text-xs mt-1 text-amber-200">- Mateus 18,20</p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/70 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};
