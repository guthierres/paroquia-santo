import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import { FileUpload } from '../ui/FileUpload';
import toast from 'react-hot-toast';

interface LogoSettings {
  logo_url: string | null;
  logo_alt: string;
  updated_at: string;
}

export const LogoManager: React.FC = () => {
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    logo_url: null,
    logo_alt: 'Logo da Paróquia',
    updated_at: new Date().toISOString()
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLogoSettings();
  }, []);

  const fetchLogoSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('logo_url, logo_alt')
        .eq('key', 'logo_settings')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setLogoSettings({
          logo_url: data.logo_url,
          logo_alt: data.logo_alt || 'Logo da Paróquia',
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching logo settings:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'logo_settings',
          logo_url: logoSettings.logo_url,
          logo_alt: logoSettings.logo_alt,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      toast.success('Logo atualizado com sucesso!');
      window.location.reload();
    } catch (error) {
      console.error('Error saving logo:', error);
      toast.error('Erro ao salvar logo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveLogo = () => {
    if (!confirm('Tem certeza que deseja remover o logo?')) return;
    setLogoSettings(prev => ({ ...prev, logo_url: null }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Gerenciar Logo do Cabeçalho</h3>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto Alternativo
            </label>
            <input
              type="text"
              value={logoSettings.logo_alt}
              onChange={(e) => setLogoSettings(prev => ({ ...prev, logo_alt: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="Ex: Logo da Paróquia Senhor Santo Cristo"
            />
            <p className="text-xs text-gray-500 mt-1">
              Usado para acessibilidade e SEO
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo do Cabeçalho
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Recomendado: imagem em formato paisagem (landscape), proporção 3:1 ou 4:1. Tamanho máximo: 1MB
            </p>

            {logoSettings.logo_url ? (
              <div className="space-y-4">
                <div className="relative bg-gradient-to-r from-red-900 to-red-800 p-6 rounded-lg">
                  <img
                    src={logoSettings.logo_url}
                    alt={logoSettings.logo_alt}
                    className="h-12 sm:h-16 w-auto mx-auto object-contain"
                  />
                </div>

                <div className="flex gap-2">
                  <FileUpload
                    onCloudinaryUpload={(result) => setLogoSettings(prev => ({
                      ...prev,
                      logo_url: result.secureUrl || result.url
                    }))}
                    useCloudinary={true}
                    folder="site-assets"
                  >
                    <Button variant="outline" className="flex-1">
                      <ImageIcon className="h-4 w-4" />
                      Alterar Logo
                    </Button>
                  </FileUpload>

                  <Button
                    variant="outline"
                    onClick={handleRemoveLogo}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                    Remover
                  </Button>
                </div>
              </div>
            ) : (
              <FileUpload
                onCloudinaryUpload={(result) => setLogoSettings(prev => ({
                  ...prev,
                  logo_url: result.secureUrl || result.url
                }))}
                useCloudinary={true}
                folder="site-assets"
              >
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-red-500 transition-colors cursor-pointer">
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Clique para selecionar o logo
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG ou JPG com fundo transparente recomendado
                    </p>
                  </div>
                </div>
              </FileUpload>
            )}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-2">Visualização no Cabeçalho:</h4>
            <div className="bg-gradient-to-r from-red-900/95 to-red-800/95 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                {logoSettings.logo_url ? (
                  <img
                    src={logoSettings.logo_url}
                    alt={logoSettings.logo_alt}
                    className="h-8 sm:h-10 w-auto object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-amber-400 rounded-full flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-red-900" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Paróquia Senhor Santo Cristo</p>
                      <p className="text-amber-200 text-xs">40 Anos de Fé</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
