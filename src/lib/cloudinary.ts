import { supabase } from './supabase';

// Configurações do Cloudinary
interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
  enabled: boolean;
  supabaseStorageEnabled: boolean;
}

// Cache das configurações
let configCache: CloudinaryConfig | null = null;
let configCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Buscar configurações do Cloudinary
export const getCloudinaryConfig = async (): Promise<CloudinaryConfig> => {
  // Verificar cache
  if (configCache && Date.now() - configCacheTime < CACHE_DURATION) {
    return configCache;
  }

  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', [
        'cloudinary_cloud_name',
        'cloudinary_api_key', 
        'cloudinary_api_secret',
        'cloudinary_upload_preset',
        'cloudinary_enabled',
        'supabase_storage_enabled'
      ]);

    if (error) throw error;

    const settings = data?.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>) || {};

    configCache = {
      cloudName: settings.cloudinary_cloud_name || '',
      apiKey: settings.cloudinary_api_key || '',
      apiSecret: settings.cloudinary_api_secret || '',
      uploadPreset: settings.cloudinary_upload_preset || 'parish_uploads',
      enabled: settings.cloudinary_enabled === 'true',
      supabaseStorageEnabled: settings.supabase_storage_enabled === 'true'
    };

    configCacheTime = Date.now();
    return configCache;
  } catch (error) {
    console.error('Error fetching Cloudinary config:', error);
    return {
      cloudName: '',
      apiKey: '',
      apiSecret: '',
      uploadPreset: 'parish_uploads',
      enabled: false,
      supabaseStorageEnabled: true
    };
  }
};

// Invalidar cache das configurações
export const invalidateConfigCache = () => {
  configCache = null;
  configCacheTime = 0;
};

// Gerar URL otimizada do Cloudinary com MÁXIMA ECONOMIA DE BANDWIDTH
export const getCloudinaryUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    crop?: string;
    gravity?: string;
    progressive?: boolean;
    fetchFormat?: string;
  } = {}
): string => {
  if (!configCache?.cloudName || !publicId) {
    return publicId; // Fallback para URL original
  }

  const {
    width,
    height,
    quality = 40, // REDUZIDO DRASTICAMENTE de auto:low para 40
    format = 'auto',
    crop = 'fill',
    gravity = 'center',
    progressive = true
  } = options;

  let transformations = [];
  
  // OTIMIZAÇÕES EXTREMAS PARA REDUZIR BANDWIDTH
  transformations.push('f_auto'); // WebP/AVIF quando possível
  transformations.push(`q_${quality}`); // Qualidade muito baixa mas aceitável
  transformations.push('fl_progressive'); // Progressive JPEG
  transformations.push('fl_lossy'); // Compressão lossy agressiva
  transformations.push('fl_strip_profile'); // Remove metadados
  transformations.push('dpr_auto'); // DPR automático
  
  // LIMITAR TAMANHOS MÁXIMOS DRASTICAMENTE
  const maxWidth = Math.min(width || 800, 800); // Máximo 800px
  const maxHeight = Math.min(height || 600, 600); // Máximo 600px
  
  if (width || height) {
    let sizeTransform = `c_${crop}`;
    if (gravity) sizeTransform += `,g_${gravity}`;
    sizeTransform += `,w_${maxWidth}`;
    if (height) sizeTransform += `,h_${maxHeight}`;
    transformations.push(sizeTransform);
  } else {
    // Se não especificado, limitar a 400px para economizar
    transformations.push(`c_limit,w_400,h_400`);
  }

  const transformString = transformations.join(',');
  
  return `https://res.cloudinary.com/${configCache.cloudName}/image/upload/${transformString}/${publicId}`;
};

// Upload de imagem para Cloudinary
export const uploadToCloudinary = async (
  file: File,
  folder: string = 'parish'
): Promise<{ publicId: string; url: string; secureUrl: string }> => {
  const config = await getCloudinaryConfig();
  
  if (!config.enabled || !config.cloudName) {
    throw new Error('Cloudinary não está configurado ou habilitado');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset);
  formData.append('folder', folder);
  
  // Adicionar timestamp para evitar cache
  formData.append('timestamp', Date.now().toString());

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erro no upload para Cloudinary');
    }

    const data = await response.json();
    
    return {
      publicId: data.public_id,
      url: data.url,
      secureUrl: data.secure_url
    };
  } catch (error) {
    console.error('Erro no upload para Cloudinary:', error);
    throw error;
  }
};

// Deletar imagem do Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  const config = await getCloudinaryConfig();
  
  if (!config.enabled || !config.cloudName || !config.apiKey || !config.apiSecret) {
    console.warn('Cloudinary não configurado para deleção');
    return false;
  }

  try {
    // Esta operação requer o backend ou uma função edge
    // Por enquanto, apenas logamos a tentativa
    console.log('Tentativa de deletar imagem:', publicId);
    return true;
  } catch (error) {
    console.error('Erro ao deletar do Cloudinary:', error);
    return false;
  }
};

// Validar configuração do Cloudinary
export const validateCloudinaryConfig = async (): Promise<{
  isValid: boolean;
  errors: string[];
}> => {
  const config = await getCloudinaryConfig();
  const errors: string[] = [];

  if (!config.cloudName) {
    errors.push('Nome da Cloud é obrigatório');
  }

  if (!config.apiKey) {
    errors.push('API Key é obrigatória');
  }

  if (!config.uploadPreset) {
    errors.push('Upload Preset é obrigatório');
  }

  // Testar conexão se todas as configurações estão presentes
  if (errors.length === 0 && config.enabled) {
    try {
      const testUrl = `https://res.cloudinary.com/${configCache.cloudName}/image/upload/c_limit,w_100,h_100,q_30,f_auto/sample.jpg`;
      const response = await fetch(testUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        errors.push('Não foi possível conectar com o Cloudinary');
      }
    } catch (error) {
      errors.push('Erro de conexão com o Cloudinary');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Migrar imagem existente para Cloudinary
export const migrateImageToCloudinary = async (
  imageUrl: string,
  folder: string = 'parish'
): Promise<{ publicId: string; url: string } | null> => {
  const config = await getCloudinaryConfig();
  
  if (!config.enabled || !config.cloudName) {
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('file', imageUrl);
    formData.append('upload_preset', config.uploadPreset);
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Erro na migração para Cloudinary');
    }

    const data = await response.json();
    
    return {
      publicId: data.public_id,
      url: data.secure_url
    };
  } catch (error) {
    console.error('Erro na migração:', error);
    return null;
  }
};

// CONFIGURAÇÕES EXTREMAMENTE OTIMIZADAS PARA ECONOMIA DE BANDWIDTH
export const getOptimizedImageUrl = (
  publicId: string,
  type: 'thumbnail' | 'medium' | 'large' | 'hero' = 'medium'
): string => {
  // Configurações MUITO mais agressivas para reduzir bandwidth
  const configs = {
    thumbnail: { width: 80, height: 80, quality: 30, progressive: true }, // Reduzido de 120x120
    medium: { width: 200, height: 200, quality: 35, progressive: true }, // Reduzido de 320x320
    large: { width: 400, height: 300, quality: 40, progressive: true }, // Reduzido de 640x480
    hero: { width: 800, height: 450, quality: 45, progressive: true } // Reduzido de 1280x720
  };

  return getCloudinaryUrl(publicId, configs[type]);
};

// Cache MUITO mais agressivo para URLs do Cloudinary
const urlCache = new Map<string, { url: string; timestamp: number }>();
const URL_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias (aumentado de 24h)

export const getCachedCloudinaryUrl = (
  publicId: string,
  options: any = {}
): string => {
  const cacheKey = `${publicId}_${JSON.stringify(options)}`;
  const cached = urlCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < URL_CACHE_DURATION) {
    return cached.url;
  }
  
  const url = getCloudinaryUrl(publicId, options);
  urlCache.set(cacheKey, { url, timestamp: Date.now() });
  
  return url;
};

// Função para gerar URLs responsivas com srcset OTIMIZADO
export const getResponsiveImageUrls = (publicId: string, baseWidth: number = 200) => {
  // REDUZIDO: baseWidth padrão de 400 para 200
  const sizes = [1, 1.5]; // REDUZIDO: apenas 2 tamanhos em vez de 4
  const urls = sizes.map(multiplier => {
    const width = Math.min(Math.round(baseWidth * multiplier), 600); // Máximo 600px
    return {
      url: getCachedCloudinaryUrl(publicId, {
        width,
        quality: 35, // Qualidade muito baixa
        format: 'auto',
        progressive: true,
        crop: 'fill'
      }),
      width: `${width}w`
    };
  });
  
  return {
    src: urls[0].url, // 1x como fallback
    srcSet: urls.map(u => `${u.url} ${u.width}`).join(', ')
  };
};

// NOVA FUNÇÃO: Gerar URL ultra-comprimida para thumbnails
export const getUltraCompressedUrl = (publicId: string, size: number = 100): string => {
  return getCloudinaryUrl(publicId, {
    width: size,
    height: size,
    quality: 25, // Qualidade muito baixa
    format: 'auto',
    crop: 'fill',
    progressive: true
  });
};

// NOVA FUNÇÃO: Detectar tipo de dispositivo e ajustar qualidade
export const getDeviceOptimizedUrl = (
  publicId: string,
  width?: number,
  height?: number
): string => {
  // Detectar conexão lenta ou dispositivo móvel
  const isSlowConnection = (navigator as any).connection?.effectiveType === '2g' || 
                          (navigator as any).connection?.effectiveType === 'slow-2g';
  const isMobile = window.innerWidth < 768;
  
  // Ajustar qualidade baseado no dispositivo/conexão
  let quality = 40;
  if (isSlowConnection) quality = 25;
  else if (isMobile) quality = 30;
  
  // Limitar tamanhos para mobile
  const maxWidth = isMobile ? Math.min(width || 300, 300) : Math.min(width || 600, 600);
  const maxHeight = isMobile ? Math.min(height || 300, 300) : Math.min(height || 600, 600);
  
  return getCloudinaryUrl(publicId, {
    width: maxWidth,
    height: maxHeight,
    quality,
    format: 'auto',
    crop: 'fill',
    progressive: true
  });
};

// NOVA FUNÇÃO: Preload inteligente com economia
export const preloadCriticalImages = async (publicIds: string[], maxConcurrent: number = 2) => {
  // Reduzido de 3 para 2 para economizar bandwidth
  const chunks = [];
  for (let i = 0; i < publicIds.length; i += maxConcurrent) {
    chunks.push(publicIds.slice(i, i + maxConcurrent));
  }

  for (const chunk of chunks) {
    await Promise.allSettled(
      chunk.map(publicId => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          // Usar versão ultra-comprimida para preload
          img.src = getUltraCompressedUrl(publicId, 50);
        });
      })
    );
  }
};