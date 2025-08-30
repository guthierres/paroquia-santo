import React, { useRef } from 'react';
import { uploadToCloudinary, getCloudinaryConfig } from '../../lib/cloudinary';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFileSelect?: (files: FileList | null) => void;
  onCloudinaryUpload?: (result: { publicId: string; url: string; secureUrl: string }) => void;
  onSupabaseUpload?: (result: { url: string; path: string }) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  folder?: string;
  useCloudinary?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onCloudinaryUpload,
  onSupabaseUpload,
  accept = 'image/*',
  multiple = false,
  disabled = false,
  children,
  className = '',
  folder = 'parish',
  useCloudinary = true
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleClick = () => {
    if (!disabled && !isUploading && inputRef.current) {
      inputRef.current.click();
    }
  };

  const uploadToSupabase = async (file: File): Promise<{ url: string; path: string }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('parish-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('parish-photos')
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath
    };
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) return;

    // Validar arquivos antes do upload
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    
    fileArray.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name}: Não é uma imagem válida`);
        return;
      }
      
      if (file.size > 1024 * 1024) { // 1MB limit
        toast.error(`${file.name}: Arquivo muito grande (máximo 1MB)`);
        return;
      }
      
      validFiles.push(file);
    });

    if (validFiles.length === 0) {
      toast.error('Nenhum arquivo válido selecionado');
      return;
    }

    // Limitar a 10 arquivos por vez
    const limitedFiles = validFiles.slice(0, 10);
    if (validFiles.length > 10) {
      toast.error(`Máximo 10 arquivos por vez. ${validFiles.length - 10} arquivos foram ignorados.`);
    }

    // Verificar se deve usar Cloudinary
    if (useCloudinary && (onCloudinaryUpload || onSupabaseUpload)) {
      setIsUploading(true);
      try {
        const config = await getCloudinaryConfig();
        
        // Se Supabase Storage está desabilitado, força Cloudinary
        const forceCloudinary = !config.supabaseStorageEnabled;
        
        if ((config.enabled || forceCloudinary) && onCloudinaryUpload) {
          // Upload para Cloudinary - processar múltiplos arquivos
          for (let i = 0; i < limitedFiles.length; i++) {
            const file = limitedFiles[i];
            try {
              const result = await uploadToCloudinary(file, folder);
              onCloudinaryUpload(result);
              
              if (limitedFiles.length === 1) {
                toast.success('Imagem enviada para Cloudinary com sucesso!');
              } else if (i === limitedFiles.length - 1) {
                toast.success(`${limitedFiles.length} imagens enviadas para Cloudinary com sucesso!`);
              }
            } catch (cloudinaryError) {
              if (forceCloudinary) {
                console.error('Cloudinary obrigatório falhou:', cloudinaryError);
                toast.error(`Erro no Cloudinary para ${file.name}. Verifique as configurações.`);
                throw cloudinaryError;
              } else {
                throw cloudinaryError;
              }
            }
          }
        } else if (onSupabaseUpload && config.supabaseStorageEnabled) {
          // Upload para Supabase quando Cloudinary não está habilitado - processar múltiplos arquivos
          for (let i = 0; i < limitedFiles.length; i++) {
            const file = limitedFiles[i];
            const result = await uploadToSupabase(file);
            onSupabaseUpload(result);
            
            if (limitedFiles.length === 1) {
              toast.success('Imagem enviada com sucesso!');
            } else if (i === limitedFiles.length - 1) {
              toast.success(`${limitedFiles.length} imagens enviadas com sucesso!`);
            }
          }
        } else if (!config.supabaseStorageEnabled) {
          // Se Supabase está desabilitado mas Cloudinary não está configurado
          toast.error('Supabase Storage desabilitado. Configure o Cloudinary primeiro!');
          return;
        } else {
          // Fallback para método tradicional
          if (onFileSelect) {
            onFileSelect(files); // Manter compatibilidade
          }
        }
      } catch (error) {
        console.error('Erro no upload:', error);
        
        const config = await getCloudinaryConfig();
        
        // Fallback para Supabase apenas se permitido
        if (onSupabaseUpload && config.supabaseStorageEnabled) {
          try {
            const file = limitedFiles[0]; // Usar arquivo validado
            const result = await uploadToSupabase(file);
            onSupabaseUpload(result);
            toast.success('Imagem enviada para Supabase como fallback!');
          } catch (fallbackError) {
            console.error('Erro no fallback:', fallbackError);
            toast.error('Erro ao enviar imagem.');
            if (onFileSelect) {
              onFileSelect(files); // Manter compatibilidade
            }
          }
        } else {
          toast.error('Erro ao enviar imagem.');
          if (onFileSelect) {
            onFileSelect(files); // Manter compatibilidade
          }
        }
      } finally {
        setIsUploading(false);
      }
    } else if (onFileSelect) {
      // Método tradicional
      onFileSelect(files); // Manter compatibilidade
    }

    // Reset input to allow selecting the same file again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />
      <div 
        onClick={handleClick} 
        className={`cursor-pointer ${
          disabled || isUploading ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
};