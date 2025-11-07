import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Church, Music, Users, Heart, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';

// Caminho de importação corrigido (assumindo src/pages/FestaPatroeiroPage.tsx)
import festaImage from '../../public/festa-santo.png';

interface FestaPatroeiroPageProps {
  onBack: () => void;
}

// 1. Componente de SEO Refinado para limpeza agressiva
const FestaPatroeiroSEO: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  
  const title = "Festa do Padroeiro 2025 - Senhor Santo Cristo (40 Anos)";
  const description = "Convidamos você e sua família para a Novena e Festa Paroquial em honra ao Senhor Santo Cristo dos Milagres, celebrando 40 anos de fundação. De 13 a 23 de Novembro.";
  const url = `${window.location.origin}/festa-padroeiro`;

  useEffect(() => {
    const head = document.head;

    // --- LÓGICA DE LIMPEZA AGRESSIVA ---
    // Remove as tags de SEO padrão do index.html para que as novas possam ser aplicadas.
    const tagsToRemove = head.querySelectorAll(
      '[property^="og:"], [name^="twitter:"], [name="description"], [rel="canonical"]'
    );
    tagsToRemove.forEach(meta => meta.remove());

    // 1. Define o título do documento
    document.title = title;

    // 2. Cria as tags de metadados
    const tagsData = [
      // SEO Básico
      { name: 'description', content: description },
      { rel: 'canonical', href: url },
      
      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: `${window.location.origin}${imageUrl}` }, // URL ABSOLUTA
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: `${window.location.origin}${imageUrl}` }, // URL ABSOLUTA
    ];

    tagsData.forEach(({ name, property, content, rel, href }) => {
      const tag = rel === 'canonical' ? document.createElement('link') : document.createElement('meta');
      
      if (name) tag.setAttribute('name', name);
      if (property) tag.setAttribute('property', property);
      if (content) tag.setAttribute('content', content);
      if (rel) tag.setAttribute('rel', rel);
      if (href) tag.setAttribute('href', href);
      
      tag.setAttribute('data-seo-tag', 'festa-page'); // Marcador
      head.appendChild(tag);
    });

    return () => {
      // 3. Função de limpeza: remove as tags específicas desta página ao navegar
      const cleanupTags = head.querySelectorAll('[data-seo-tag="festa-page"]');
      cleanupTags.forEach(tag => tag.remove());
      // Você deve re-aplicar o SEO padrão do index.html aqui se necessário,
      // mas geralmente o próximo componente/rota fará isso.
    };
  }, [imageUrl, title, description, url]);

  return null;
};

export const FestaPatroeiroPage: React.FC<FestaPatroeiroPageProps> = ({ onBack }) => {
  return (
    <>
      {/* O valor de festaImage aqui precisa ser a URL pública, que é o que o bundler retorna. */}
      {/* Se o bundler injeta o caminho completo (ex: /assets/festa-santo.xxxx.png), 
          usamos ele diretamente. Se ele retorna o caminho para a importação, usamos. 
          Assumindo que o bundler retorna um caminho público iniciado por '/' */}
      <FestaPatroeiroSEO imageUrl={festaImage as string} /> 
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-red-900 via-red-800 to-amber-900 text-white py-16 overflow-hidden">
          
          {/* Fundo de Padrão (Pattern Background) */}
          <div className="absolute inset-0 opacity-10">
            {/* Padrão animado sutil - Mantido para um toque de animação no topo */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC41Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OS00IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTEyIDM0YzAtMi4yMS0xLjQ0LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OS00LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSAzLjM5LTQgMy4zOS00LTEuMTgtNC0zLjM5ek0yNCAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjcyLTQgMy44MiAxLjc5IDQuMTggNCA0LjE4IDQtMS41OS00LTMuNzF6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRsLTQgNC4yMSAxLjI1IDMuNDkgMy4zOS00LjY4IDMuNDktMS42MS0xLjI1LTN6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRsLTQuNDUgMy4zNy0uNzgtLjIzLjY5LTMuMTQgLTIuOTMtLjc4IDIuNzktLjY0LTQuNjktLjI0LTQuMTItLjQ0eiIvPjwvZz48L2c+PC9zdmc=')] animate-pulse"></div>
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
              <p className="text-xl sm:text-2xl text-white/90 mb-2 font-light">
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
            className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 rounded-2xl p-8 mb-12 shadow-2xl"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Calendar className="h-8 w-8 text-white" />
              <h2 className="text-3xl font-bold text-white">Data da Celebração</h2>
            </div>
            <div className="text-center">
              <p className="text-5xl sm:text-6xl font-bold text-white mb-2">
                13 a 23 de Novembro
              </p>
              <p className="text-xl text-white/90">
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
            className="bg-white rounded-2xl p-8 sm:p-12 mb-12 shadow-xl"
          >
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-700" />
                Convite Especial
              </h2>
              
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  Queridos irmãos e irmãs em Cristo,
                </p>
                
                <p className="text-lg">
                  Com imensa alegria e gratidão ao Senhor, convidamos toda a comunidade paroquial e amigos para participarem 
                  da <strong className="text-gray-900">Festa do Padroeiro 2025</strong>, em honra ao <strong className="text-gray-900">Senhor Santo Cristo dos Milagres</strong>.
                </p>

                <p className="text-lg">
                  Este ano é ainda mais especial, pois celebramos <strong className="text-red-700 text-xl">40 anos de fundação</strong> da 
                  nossa querida Paróquia! Quatro décadas de fé, comunhão e serviço ao Reino de Deus, sempre sob a proteção e 
                  bênção do nosso Padroeiro.
                </p>

                <div className="bg-amber-50 rounded-xl p-6 my-8 border-l-4 border-red-700">
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    A celebração será marcada por:
                  </p>
                  <ul className="space-y-2 text-lg">
                    <li className="flex items-start gap-2">
                      <Church className="h-5 w-5 text-red-700 mt-1 flex-shrink-0" />
                      <span><strong>Novena Solene:</strong> De 13 a 21 de novembro, momentos de oração, reflexão e louvor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Music className="h-5 w-5 text-red-700 mt-1 flex-shrink-0" />
                      <span><strong>Festividades:</strong> Programação especial celebrando 40 anos de nossa paróquia</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-red-700 mt-1 flex-shrink-0" />
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

                <p className="text-lg font-semibold text-gray-900">
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
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Church className="h-6 w-6 text-red-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Novena</h3>
              </div>
              <p className="text-gray-700">
                Acompanhe a novena diária com reflexões profundas e momentos de oração em comunidade.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Sparkles className="h-6 w-6 text-amber-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">40 Anos</h3>
              </div>
              <p className="text-gray-700">
                Celebração especial pelos 40 anos de fundação da nossa paróquia e sua história de fé.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Heart className="h-6 w-6 text-red-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Comunhão</h3>
              </div>
              <p className="text-gray-700">
                Momentos de confraternização e união entre os fiéis, fortalecendo os laços fraternos.
              </p>
            </div>
          </motion.div>

          {/* Signature */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white rounded-xl p-8 text-center border-2 border-amber-200"
          >
            <p className="text-gray-600 mb-2">Com as bênçãos do Senhor,</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">Padre Márcio Rodrigues</p>
            <p className="text-red-700 font-semibold">Pároco</p>
          </motion.div>
        </div>
      </div>
    </>
  );
};
