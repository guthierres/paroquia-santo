import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Church, Music, Users, Heart, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import festaImage from '../public/festa-santo.png';

interface FestaPatroeiroPageProps {
  onBack: () => void;
}

export const FestaPatroeiroPage: React.FC<FestaPatroeiroPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTEyIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0yNCAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
              <span className="text-amber-200 font-semibold">Edição Especial 40 Anos</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Festa do Padroeiro 2025
            </h1>
            <p className="text-xl sm:text-2xl text-primary-foreground/90 mb-2 font-light">
              Senhor Santo Cristo dos Milagres
            </p>
            <p className="text-lg text-amber-200 italic">
              "Salve, Senhor Santo Cristo, és nossa força nossa caminhada"
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Celebration Dates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-gradient-to-br from-accent via-accent/95 to-accent/90 rounded-2xl p-8 mb-12 shadow-2xl"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Calendar className="h-8 w-8 text-accent-foreground" />
            <h2 className="text-3xl font-bold text-accent-foreground">Data da Celebração</h2>
          </div>
          <div className="text-center">
            <p className="text-5xl sm:text-6xl font-bold text-accent-foreground mb-2">
              13 a 23 de Novembro
            </p>
            <p className="text-xl text-accent-foreground/80">
              Novena e Festa Paroquial
            </p>
          </div>
        </motion.div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-12"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={festaImage}
              alt="Novena e Festa ao Senhor Santo Cristo dos Milagres - De 13 a 23 de Novembro"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          </div>
        </motion.div>

        {/* Invitation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-card rounded-2xl p-8 sm:p-12 mb-12 shadow-xl"
        >
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary" />
              Convite Especial
            </h2>
            
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                Queridos irmãos e irmãs em Cristo,
              </p>
              
              <p className="text-lg">
                Com imensa alegria e gratidão ao Senhor, convidamos toda a comunidade paroquial e amigos para participarem 
                da <strong className="text-foreground">Festa do Padroeiro 2025</strong>, em honra ao <strong className="text-foreground">Senhor Santo Cristo dos Milagres</strong>.
              </p>

              <p className="text-lg">
                Este ano é ainda mais especial, pois celebramos <strong className="text-primary text-xl">40 anos de fundação</strong> da 
                nossa querida Paróquia! Quatro décadas de fé, comunhão e serviço ao Reino de Deus, sempre sob a proteção e 
                bênção do nosso Padroeiro.
              </p>

              <div className="bg-accent/20 rounded-xl p-6 my-8 border-l-4 border-primary">
                <p className="text-lg font-semibold text-foreground mb-2">
                  A celebração será marcada por:
                </p>
                <ul className="space-y-2 text-lg">
                  <li className="flex items-start gap-2">
                    <Church className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span><strong>Novena Solene:</strong> De 13 a 21 de novembro, momentos de oração, reflexão e louvor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Music className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span><strong>Festividades:</strong> Programação especial celebrando 40 anos de nossa paróquia</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span><strong>Confraternização:</strong> Momentos de comunhão e união fraterna</span>
                  </li>
                </ul>
              </div>

              <p className="text-lg">
                Cada dia da novena será uma oportunidade para renovarmos nossa fé, fortalecermos nossos laços comunitários 
                e agradecermos pelas bênçãos recebidas ao longo destes 40 anos de caminhada.
              </p>

              <p className="text-lg">
                Venha celebrar conosco este momento único! Traga sua família, seus amigos e seu coração aberto para receber 
                as graças e bênçãos do Senhor Santo Cristo dos Milagres.
              </p>

              <p className="text-lg font-semibold text-foreground">
                Que o Senhor Santo Cristo dos Milagres continue abençoando nossa paróquia, nossas famílias e toda a nossa 
                comunidade. Contamos com a presença de todos!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Event Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Church className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Novena</h3>
            </div>
            <p className="text-muted-foreground">
              Acompanhe a novena diária com reflexões profundas e momentos de oração em comunidade.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">40 Anos</h3>
            </div>
            <p className="text-muted-foreground">
              Celebração especial pelos 40 anos de fundação da nossa paróquia e sua história de fé.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Comunhão</h3>
            </div>
            <p className="text-muted-foreground">
              Momentos de confraternização e união entre os fiéis, fortalecendo os laços fraternos.
            </p>
          </div>
        </motion.div>

        {/* Signature */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-xl p-8 text-center border border-accent/30"
        >
          <p className="text-muted-foreground mb-2">Com as bênçãos do Senhor,</p>
          <p className="text-2xl font-bold text-foreground mb-1">Padre Márcio Rodrigues</p>
          <p className="text-primary font-semibold">Pároco</p>
        </motion.div>
      </div>
    </div>
  );
};
