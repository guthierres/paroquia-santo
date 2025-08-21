import React, { useRef } from 'react';
import { uploadToCloudinary, getCloudinaryConfig } from '../../lib/cloudinary';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFileSelect?: (files: FileList | null) => void;
  onCloudinaryUpload?: (result: { publicId: string; url: string; secureUrl: string }) => void;
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

    // Se deve usar Cloudinary e callback está definido
    if (useCloudinary && onCloudinaryUpload) {
      setIsUploading(true);
      try {
        const config = await getCloudinaryConfig();
        
        if (config.enabled) {
          // Upload para Cloudinary
          const file = files[0]; // Por enquanto, apenas um arquivo
          const result = await uploadToCloudinary(file, folder);
          onCloudinaryUpload(result);
          toast.success('Imagem enviada para Cloudinary com sucesso!');
        } else {
          // Fallback para método tradicional
          if (onFileSelect) {
            onFileSelect(files);
          }
        }
      } catch (error) {
        console.error('Erro no upload:', error);
        toast.error('Erro ao enviar imagem. Tentando método tradicional...');
        
        // Fallback para método tradicional em caso de erro
        if (onFileSelect) {
          onFileSelect(files);
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