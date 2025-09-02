import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface TermsOfUsePageProps {
  onBack: () => void;
}

export const TermsOfUsePage: React.FC<TermsOfUsePageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 text-white shadow-lg sticky top-0 z-50 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <Button
                variant="outline"
                onClick={onBack}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 flex items-center gap-1 sm:gap-2 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold">Termos de Uso</h1>
                <p className="text-amber-200 text-sm sm:text-base truncate">
                  Condições de uso do site da paróquia
                </p>
              </div>
            </div>
            <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-amber-400 flex-shrink-0" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8">
            <div className="prose prose-lg max-w-none">
              <div className="text-center mb-8">
                <FileText className="h-16 w-16 text-red-800 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Termos de Uso</h2>
                <p className="text-gray-600">Última atualização: Janeiro de 2025</p>
              </div>

              <div className="space-y-8">
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="h-6 w-6 text-red-800" />
                    <h3 className="text-xl font-bold text-gray-800">1. Aceitação dos Termos</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Ao acessar e utilizar o site da Paróquia Senhor Santo Cristo dos Milagres, 
                    você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. 
                    Se você não concordar com qualquer parte destes termos, não deve usar nosso site.
                  </p>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-red-800" />
                    <h3 className="text-xl font-bold text-gray-800">2. Uso Permitido</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      Este site é destinado a fornecer informações sobre nossa paróquia, eventos, 
                      celebrações e atividades pastorais. Você pode:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Navegar e visualizar o conteúdo do site</li>
                      <li>Compartilhar informações sobre eventos e celebrações</li>
                      <li>Entrar em contato conosco através dos canais disponibilizados</li>
                      <li>Participar de atividades e eventos divulgados</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <XCircle className="h-6 w-6 text-red-800" />
                    <h3 className="text-xl font-bold text-gray-800">3. Uso Proibido</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    É expressamente proibido:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Usar o site para fins comerciais não autorizados</li>
                    <li>Publicar ou transmitir conteúdo ofensivo, difamatório ou inadequado</li>
                    <li>Tentar acessar áreas restritas do site sem autorização</li>
                    <li>Interferir no funcionamento normal do site</li>
                    <li>Violar direitos autorais ou propriedade intelectual</li>
                    <li>Usar o site para atividades ilegais ou não éticas</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">4. Propriedade Intelectual</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Todo o conteúdo deste site, incluindo textos, imagens, logos, gráficos e design, 
                    é propriedade da Paróquia Senhor Santo Cristo dos Milagres ou de seus licenciadores. 
                    É protegido por leis de direitos autorais e outras leis de propriedade intelectual.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">5. Conteúdo do Usuário</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Ao enviar qualquer conteúdo para nosso site (comentários, mensagens, etc.), 
                    você garante que possui todos os direitos necessários e concede à paróquia 
                    uma licença para usar, modificar e exibir esse conteúdo conforme necessário.
                  </p>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-800" />
                    <h3 className="text-xl font-bold text-gray-800">6. Limitação de Responsabilidade</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    A paróquia não se responsabiliza por danos diretos, indiretos, incidentais ou 
                    consequenciais resultantes do uso ou incapacidade de usar este site. 
                    As informações são fornecidas "como estão" sem garantias de qualquer tipo.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">7. Links Externos</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Nosso site pode conter links para sites de terceiros. Não somos responsáveis 
                    pelo conteúdo ou práticas de privacidade desses sites externos. 
                    Recomendamos que você leia os termos e políticas de privacidade de cada site visitado.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">8. Modificações</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Reservamo-nos o direito de modificar estes termos de uso a qualquer momento. 
                    As alterações entrarão em vigor imediatamente após sua publicação no site. 
                    O uso continuado do site após as modificações constitui aceitação dos novos termos.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">9. Lei Aplicável</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Estes termos são regidos pelas leis brasileiras. Qualquer disputa será 
                    resolvida nos tribunais competentes da comarca de São Paulo, SP.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">10. Contato</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Para dúvidas sobre estes termos de uso, entre em contato:
                  </p>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">
                      <strong>Paróquia Senhor Santo Cristo dos Milagres</strong><br />
                      R. dos Têxteis, 653 - Chacara Santa Etelvina<br />
                      São Paulo - SP, 08490-582<br />
                      Telefone: (11) 98588-8816<br />
                      E-mail: contato@paroquiasantocristo.com.br
                    </p>
                  </div>
                </section>
              </div>

              <div className="text-center mt-8 pt-6 border-t border-gray-200">
                <Button variant="primary" onClick={onBack}>
                  Voltar ao Site
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};