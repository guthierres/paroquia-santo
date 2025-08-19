import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ArrowRight, X, FileText, Clock, ArrowLeft } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase, BlogPost } from '../../lib/supabase';

interface BlogSectionProps {
  onNavigateHome?: () => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onNavigateHome }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching posts:', error);
      } else if (data) {
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostClick = (post: BlogPost) => {
    console.log('Post clicked:', post.title);
    setSelectedPost(post);
  };

  const handleClosePost = () => {
    setSelectedPost(null);
  };

  const copyPostLink = (post: BlogPost) => {
    const url = `${window.location.origin}${window.location.pathname}#blog-post-${post.id}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copiado para a área de transferência!');
      }).catch(() => {
        fallbackCopyTextToClipboard(url);
      });
    } else {
      fallbackCopyTextToClipboard(url);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      alert('Link copiado para a área de transferência!');
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      alert('Não foi possível copiar o link automaticamente. URL: ' + text);
    }
    
    document.body.removeChild(textArea);
  };

  const sharePost = (post: BlogPost, platform: string) => {
    const url = `${window.location.origin}${window.location.pathname}#blog-post-${post.id}`;
    const text = `Confira esta postagem: ${post.title}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({ title: post.title, text, url });
        } else {
          copyPostLink(post);
        }
        break;
    }
  };

  if (isLoading) {
    return (
      <section id="blog" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent mb-4">
              Blog da Paróquia
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Acompanhe as novidades, reflexões e acontecimentos da nossa comunidade
            </p>
          </motion.div>
          
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando publicações...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="blog" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent mb-4">
              Blog da Paróquia
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Acompanhe as novidades, reflexões e acontecimentos da nossa comunidade
            </p>
          </motion.div>

          {posts.length === 0 ? (
            <Card className="p-12 text-center max-w-2xl mx-auto">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhuma publicação encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                As publicações do blog aparecerão aqui quando forem criadas no painel administrativo.
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="mx-auto"
              >
                Recarregar
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer group h-full flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 card-mobile"
                    onClick={() => handlePostClick(post)}
                  >
                    {post.featured_image && (
                      <div className="aspect-video overflow-hidden rounded-t-xl">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(post.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {post.author}
                        </div>
                      </div>
                      
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 group-hover:text-red-800 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-sm sm:text-base text-gray-600 mb-4 flex-1 line-clamp-3">
                        {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 flex-wrap">
                        <Clock className="h-3 w-3" />
                        <span>Publicado em {new Date(post.created_at).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}</span>
                      </div>
                      
                      <div 
                        className="flex items-center text-red-800 font-medium group-hover:text-red-900 transition-colors text-sm sm:text-base"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePostClick(post);
                        }}
                      >
                        <span>Ler mais</span>
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal do Post */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm">
              <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between safe-area-inset-top">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handleClosePost}
                    className="flex items-center gap-2 text-sm sm:text-base"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                  <div className="hidden sm:flex items-center gap-2 text-red-800">
                    <FileText className="h-5 w-5" />
                    <span className="font-semibold">Blog da Paróquia</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => sharePost(selectedPost, 'native')}
                  className="flex items-center gap-2 text-sm sm:text-base"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span className="hidden sm:inline">Compartilhar</span>
                </Button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto px-4 py-6 sm:py-8"
            >
              {selectedPost.featured_image && (
                <div className="aspect-video overflow-hidden rounded-xl mb-6 sm:mb-8 shadow-lg">
                  <img
                    src={selectedPost.featured_image}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.parentElement!.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedPost.created_at).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {selectedPost.author}
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 sm:mb-8 leading-tight">
                {selectedPost.title}
              </h1>
              
              <div 
                className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700 leading-relaxed prose-headings:text-gray-800 prose-a:text-red-800 prose-strong:text-gray-800 prose-blockquote:border-red-800 prose-blockquote:bg-red-50"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              />
              
              <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 text-center">
                <Button
                  variant="primary"
                  onClick={handleClosePost}
                  className="flex items-center gap-2 mx-auto mb-4 sm:mb-6 text-sm sm:text-base"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao Blog
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-4">Compartilhe:</p>
                  <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPostLink(selectedPost)}
                      className="flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span className="hidden sm:inline">Copiar Link</span>
                      <span className="sm:hidden">Link</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sharePost(selectedPost, 'whatsapp')}
                      className="flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sharePost(selectedPost, 'facebook')}
                      className="flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};