import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, FileText, Image, Calendar, Users, LogOut, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ParishManager } from './ParishManager';
import { PhotoManager } from './PhotoManager';
import { TimelineManager } from './TimelineManager';
import { SlideManager } from './SlideManager';
import { BlogManager } from './BlogManager';
import { AnnouncementManager } from './AnnouncementManager';
import { ScheduleManager } from './ScheduleManager';
import { PriestManager } from './PriestManager';
import { CloudinarySettings } from './CloudinarySettings';
import { CelebrationManager } from './CelebrationManager';
import { PastoralManager } from './PastoralManager';
import { UrgentPopupManager } from './UrgentPopupManager';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('parish');

  const tabs = [
    { id: 'parish', label: 'Informações da Paróquia', icon: FileText },
    { id: 'cloudinary', label: 'Cloudinary', icon: Settings },
    { id: 'popups', label: 'Pop-ups Urgentes', icon: Calendar },
    { id: 'pastorals', label: 'Pastorais', icon: Users },
    { id: 'announcements', label: 'Eventos e Avisos', icon: Calendar },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'priests', label: 'Clero', icon: Users },
    { id: 'celebrations', label: 'Celebrações', icon: Calendar },
    { id: 'photos', label: 'Galeria de Fotos', icon: Image },
    { id: 'timeline', label: 'Linha do Tempo', icon: Calendar },
    { id: 'slides', label: 'Slides do Site', icon: Settings },
    { id: 'schedules', label: 'Horários de Celebrações', icon: Calendar }
  ];

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logout realizado com sucesso');
      onClose();
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'parish':
        return <ParishManager />;
      case 'cloudinary':
        return <CloudinarySettings />;
      case 'popups':
        return <UrgentPopupManager />;
      case 'pastorals':
        return <PastoralManager />;
      case 'announcements':
        return <AnnouncementManager />;
      case 'blog':
        return <BlogManager />;
      case 'priests':
        return <PriestManager />;
      case 'celebrations':
        return <CelebrationManager />;
      case 'photos':
        return <PhotoManager />;
      case 'timeline':
        return <TimelineManager />;
      case 'slides':
        return <SlideManager />;
      case 'schedules':
        return <ScheduleManager />;
      default:
        return <ParishManager />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden overscroll-contain"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-xl sm:text-2xl font-bold">Painel Administrativo</h2>
              <p className="text-red-200 text-sm sm:text-base truncate">Gerenciar conteúdo da paróquia</p>
            </div>
            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="hover:bg-red-100 hover:text-red-800 transition-colors"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Fechar</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row h-[calc(95vh-80px)] sm:h-[calc(95vh-120px)]">
          {/* Sidebar */}
          <div className="w-full sm:w-72 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200 p-2 sm:p-4 overflow-y-auto max-h-40 sm:max-h-none">
            <nav className="flex sm:flex-col gap-1 sm:gap-2 pb-2 sm:pb-4 overflow-x-auto sm:overflow-x-visible">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 sm:w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-left transition-all duration-200 text-xs sm:text-sm whitespace-nowrap font-medium ${
                    activeTab === tab.id
                      ? 'bg-red-800 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-200 hover:text-red-800'
                  }`}
                >
                  <tab.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="truncate hidden sm:inline">{tab.label}</span>
                  <span className="truncate sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-w-0 bg-white">
            {renderContent()}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
