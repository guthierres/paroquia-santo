import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
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
                <h1 className="text-2xl sm:text-3xl font-bold">Política de Privacidade</h1>
                <p className="text-amber-200 text-sm sm:text-base truncate">
                  Conforme a Lei Geral de Proteção de Dados (LGPD)
                </p>
              </div>
            </div>
            <Shield className="h-8 w-8 sm:h-12 sm:w-12 text-amber-400 flex-shrink-0" />
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
                <Shield className="h-16 w-16 text-red-800 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Política de Privacidade</h2>
                <p className="text-gray-600">Última atualização: Janeiro de 2025</p>
              </div>

              <div className="space-y-8">
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <UserCheck className="h-6 w-6 text-red-800" />
                    <h3 className="text-xl font-bold text-gray-800">1. Informações Gerais</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    A Paróquia Senhor Santo Cristo dos Milagres, localizada na Cidade Tiradentes, São Paulo, 
                    está comprometida com a proteção da privacidade e dos dados pessoais de todos os usuários 
                    de nosso site, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                  </p>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <Database className="h-6 w-6 text-red-800" />
                    <h3 className="text-xl font-bold text-gray-800">2. Dados Coletados</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">2.1 Dados de Navegação</h4>
                      <p className="text-gray-700">
                        Coletamos automaticamente informações sobre sua navegação, incluindo endereço IP, 
                        tipo de navegador, páginas visitadas e tempo de permanência no site.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">2.2 Dados de Contato</h4>
                      <p className="text-gray-700">
                        Quando você entra em contato conosco através do site ou WhatsApp, coletamos 
                        informações como nome, telefone e mensagem para responder às suas solicitações.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <Eye className="h-6 w-6 text-red-800" />
                    <h3 className="text-xl font-bold text-gray-800">3. Finalidade do Tratamento</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Utilizamos seus dados pessoais para:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Fornecer informações sobre eventos e atividades paroquiais</li>
                    <li>Responder a dúvidas e solicitações de contato</li>
                    <li>Melhorar a experiência de navegação no site</li>
                    <li>Cumprir obrigações legais e regulamentares</li>
                  </ul>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="h-6 w-6 text-red-800" />
                    <h3 className="text-xl font-bold text-gray-800">4. Segurança dos Dados</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados 
                    pessoais contra acesso não autorizado, alteração, divulgação ou destruição. 
                    Utilizamos criptografia e serviços seguros para armazenamento de dados.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">5. Compartilhamento de Dados</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, 
                    exceto quando necessário para cumprir obrigações legais ou com seu consentimento expresso.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">6. Seus Direitos</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Conforme a LGPD, você tem direito a:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Confirmação da existência de tratamento de dados</li>
                    <li>Acesso aos seus dados pessoais</li>
                    <li>Correção de dados incompletos, inexatos ou desatualizados</li>
                    <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
                    <li>Portabilidade dos dados</li>
                    <li>Eliminação dos dados tratados com consentimento</li>
                    <li>Revogação do consentimento</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">7. Cookies</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Utilizamos cookies para melhorar sua experiência de navegação. Você pode 
                    configurar seu navegador para recusar cookies, mas isso pode afetar 
                    algumas funcionalidades do site.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">8. Contato</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Para exercer seus direitos ou esclarecer dúvidas sobre esta política, 
                    entre em contato conosco:
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

                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">9. Alterações</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Esta política pode ser atualizada periodicamente. Recomendamos que você 
                    revise esta página regularmente para se manter informado sobre nossas práticas de privacidade.
                  </p>
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