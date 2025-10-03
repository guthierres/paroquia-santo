import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Church } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FileUpload } from '../ui/FileUpload'; // Assuming FileUpload passes a File object
import { supabase, Parish } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const ParishManager: React.FC = () => {
  const [parish, setParish] = useState<Partial<Parish>>({
    name: '',
    history: '',
    founded_year: 1985,
    address: '',
    phone: '',
    landline_phone: '',
    whatsapp_phone: '',
    email: '',
    logo_url: null,
    confession_hours: '',
    spiritual_direction_hours: '',
    office_hours: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchParishData();
  }, []);

  const fetchParishData = async () => {
    try {
      const { data, error } = await supabase
        .from('parishes')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is expected for initial setup
        throw error;
      }

      if (data) {
        setParish(data);
      }
    } catch (error) {
      console.error('Error fetching parish data:', error);
      // Only show a toast if it's a real error, not just no data found
      if (error instanceof Error && error.message !== 'PGRST116') {
        toast.error('Erro ao buscar dados da paróquia.');
      }
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // First, check if a parish record already exists
      const { data: existingData, error: fetchError } = await supabase
        .from('parishes')
        .select('id')
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw fetchError;
      }

      if (existingData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('parishes')
          .update({
            ...parish,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);

        if (updateError) throw updateError;
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('parishes')
          .insert([parish]);

        if (insertError) throw insertError;
      }

      toast.success('Informações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving parish data:', error);
      toast.error('Erro ao salvar informações');
    } finally {
      setIsLoading(false);
    }
  };

  // This is the single, corrected image upload function
  const handleCloudinaryUpload = async (result: { publicId: string; url: string; secureUrl: string }) => {
    setParish(prev => ({ 
      ...prev, 
      logo_url: result.secureUrl,
      cloudinary_public_id: result.publicId 
    }));
    toast.success('Logo carregado com sucesso!');
  };

  const handleSupabaseUpload = async (result: { url: string; path: string }) => {
    setParish(prev => ({ ...prev, logo_url: result.url }));
    toast.success('Logo carregado com sucesso!');
  };

  const handleLogoUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem muito grande (máximo 5MB)');
        return;
      }

      const fileExt = file.name.split('.').pop();
      // Ensure a consistent file name for the logo, using upsert to replace it
      const fileName = `logo.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Upload the file, using upsert to overwrite if it exists
      const { error: uploadError } = await supabase.storage
        .from('parish-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL of the uploaded file
      const { data: urlData } = supabase.storage
        .from('parish-photos')
        .getPublicUrl(filePath);

      setParish(prev => ({ ...prev, logo_url: urlData.publicUrl }));
      toast.success('Logo carregado com sucesso!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Erro ao carregar logo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Informações da Paróquia</h3>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4" />
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Informações Básicas</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Paróquia
              </label>
              <input
                type="text"
                value={parish.name || ''}
                onChange={(e) => setParish(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Nome completo da paróquia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano de Fundação
              </label>
              <input
                type="number"
                value={parish.founded_year || ''}
                onChange={(e) => setParish(prev => ({ ...prev, founded_year: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <input
                type="text"
                value={parish.address || ''}
                onChange={(e) => setParish(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Endereço completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone Fixo
              </label>
              <input
                type="text"
                value={parish.landline_phone || ''}
                onChange={(e) => setParish(prev => ({ ...prev, landline_phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="(11) 1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <input
                type="text"
                value={parish.whatsapp_phone || ''}
                onChange={(e) => setParish(prev => ({ ...prev, whatsapp_phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={parish.email || ''}
                onChange={(e) => setParish(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="contato@paroquia.com.br"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horários de Confissões
              </label>
              <textarea
                value={parish.confession_hours || ''}
                onChange={(e) => setParish(prev => ({ ...prev, confession_hours: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Ex: Sábado: 16h às 17h"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horários de Direção Espiritual
              </label>
              <textarea
                value={parish.spiritual_direction_hours || ''}
                onChange={(e) => setParish(prev => ({ ...prev, spiritual_direction_hours: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Ex: Ter e Qui: 14h às 17h (com agendamento)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horários de Atendimento da Secretaria
              </label>
              <textarea
                value={parish.office_hours || ''}
                onChange={(e) => setParish(prev => ({ ...prev, office_hours: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Ex: Seg a Sex: 9h às 12h e 14h às 17h"
              />
            </div>
          </div>
        </Card>

        {/* Logo Upload */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Logo da Paróquia</h4>
          
          <div className="text-center">
            {parish.logo_url ? (
              <div className="mb-4">
                <img
                  src={parish.logo_url}
                  alt="Logo da Paróquia"
                  className="w-48 h-48 object-contain mx-auto rounded-lg border border-gray-200"
                />
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <Church className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            <FileUpload
              onCloudinaryUpload={handleCloudinaryUpload}
              onSupabaseUpload={handleSupabaseUpload}
              onFileSelect={handleLogoUpload}
              disabled={isUploading}
            >
              <Button variant="secondary" disabled={isUploading}>
                <Church className="h-4 w-4" />
                {isUploading ? 'Carregando...' : 'Carregar Logo'}
              </Button>
            </FileUpload>
            {parish.logo_url && ( // Option to remove logo if one is present
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setParish(prev => ({ ...prev, logo_url: null }))}
                    className="text-red-600 mt-2"
                >
                    Remover Logo
                </Button>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Formatos aceitos: JPG, PNG, SVG
            </p>
          </div>
        </Card>
      </div>

      {/* History */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">História da Paróquia</h4>
        <textarea
          value={parish.history || ''}
          onChange={(e) => setParish(prev => ({ ...prev, history: e.target.value }))}
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          placeholder="Conte a história da paróquia, seus marcos importantes, crescimento da comunidade..."
        />
        <p className="text-xs text-gray-500 mt-2">
          Use parágrafos separados por linha em branco para melhor formatação
        </p>
      </Card>
    </div>
  );
};
