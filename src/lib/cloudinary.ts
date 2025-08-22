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

// Gerar URL otimizada do Cloudinary
export const getCloudinaryUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    crop?: string;
    gravity?: string;
  } = {}
): string => {
  if (!configCache?.cloudName || !publicId) {
    return publicId; // Fallback para URL original
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'center'
  } = options;

  let transformations = [];
  
  if (width || height) {
    let sizeTransform = `c_${crop}`;
    if (gravity) sizeTransform += `,g_${gravity}`;
    if (width) sizeTransform += `,w_${width}`;
    if (height) sizeTransform += `,h_${height}`;
    transformations.push(sizeTransform);
  }

  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

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
      const testUrl = `https://res.cloudinary.com/${config.cloudName}/image/upload/sample.jpg`;
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

// Utilitários para diferentes tipos de imagem
export const getOptimizedImageUrl = (
  publicId: string,
  type: 'thumbnail' | 'medium' | 'large' | 'hero' = 'medium'
): string => {
  const configs = {
    thumbnail: { width: 150, height: 150, quality: 80 },
    medium: { width: 400, height: 400, quality: 85 },
    large: { width: 800, height: 600, quality: 90 },
    hero: { width: 1920, height: 1080, quality: 85 }
  };

  return getCloudinaryUrl(publicId, configs[type]);
};