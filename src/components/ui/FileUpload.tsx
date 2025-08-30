import React, { useRef } from 'react';
import { uploadToCloudinary, getCloudinaryConfig } from '../../lib/cloudinary';
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

    // SEMPRE usar Cloudinary para uploads de fotos
    if (useCloudinary && onCloudinaryUpload) {
      setIsUploading(true);
      try {
        const config = await getCloudinaryConfig();
        
        if (!config.enabled || !config.cloudName) {
          toast.error('Configure o Cloudinary primeiro para fazer upload de fotos!');
          return;
        }

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
            console.error('Cloudinary upload failed:', cloudinaryError);
            toast.error(`Erro no Cloudinary para ${file.name}: ${cloudinaryError instanceof Error ? cloudinaryError.message : 'Erro desconhecido'}`);
          }
        }
      } catch (error) {
        console.error('Erro no upload:', error);
        toast.error('Erro ao enviar imagens para Cloudinary.');
      } finally {
        setIsUploading(false);
      }
    } else if (onFileSelect) {
      // Método tradicional apenas se não for para Cloudinary
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