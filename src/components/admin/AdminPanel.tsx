import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, FileText, Image, Calendar, Users, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ParishManager } from './ParishManager';
import { PhotoManager } from './PhotoManager';
import { TimelineManager } from './TimelineManager';
import { SlideManager } from './SlideManager';
import { BlogManager } from './BlogManager';
import { ScheduleManager } from './ScheduleManager';
import { PriestManager } from './PriestManager';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('parish');

  const tabs = [
    { id: 'parish', label: 'Informações da Paróquia', icon: FileText },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'priests', label: 'Clero', icon: Users },
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
      case 'blog':
        return <BlogManager />;
      case 'priests':
        return <PriestManager />;
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden overscroll-contain"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Painel Administrativo</h2>
              <p className="text-red-200">Gerenciar conteúdo da paróquia</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-red-800 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
