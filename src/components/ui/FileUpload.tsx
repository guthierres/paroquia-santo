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

    // Verificar se deve usar Cloudinary
    if (useCloudinary && (onCloudinaryUpload || onSupabaseUpload)) {
      setIsUploading(true);
      try {
        const config = await getCloudinaryConfig();
        
        if (config.enabled && onCloudinaryUpload) {
          // Upload para Cloudinary
          const file = files[0]; // Por enquanto, apenas um arquivo
          const result = await uploadToCloudinary(file, folder);
          onCloudinaryUpload(result);
          toast.success('Imagem enviada para Cloudinary com sucesso!');
        } else if (onSupabaseUpload) {
          // Upload para Supabase quando Cloudinary não está habilitado
          const file = files[0];
          const result = await uploadToSupabase(file);
          onSupabaseUpload(result);
          toast.success('Imagem enviada com sucesso!');
        } else {
          // Fallback para método tradicional
          if (onFileSelect) {
            onFileSelect(files);
          }
        }
      } catch (error) {
        console.error('Erro no upload:', error);
        toast.error('Erro ao enviar imagem.');
        
        // Fallback para Supabase em caso de erro no Cloudinary
        if (onSupabaseUpload) {
          try {
            const file = files[0];
            const result = await uploadToSupabase(file);
            onSupabaseUpload(result);
            toast.success('Imagem enviada para Supabase como fallback!');
          } catch (fallbackError) {
            console.error('Erro no fallback:', fallbackError);
            if (onFileSelect) {
              onFileSelect(files);
            }
          }
        }
      } finally {
        setIsUploading(false);
      }
    } else if (onFileSelect) {
      // Método tradicional
      onFileSelect(files);
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