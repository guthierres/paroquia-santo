import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Church, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { supabase, Celebration } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const CelebrationManager: React.FC = () => {
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [editingCelebration, setEditingCelebration] = useState<Celebration | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const daysOfWeek = [
    { id: 'sunday', label: 'Domingo' },
    { id: 'monday', label: 'Segunda-feira' },
    { id: 'tuesday', label: 'Terça-feira' },
    { id: 'wednesday', label: 'Quarta-feira' },
    { id: 'thursday', label: 'Quinta-feira' },
    { id: 'friday', label: 'Sexta-feira' },
    { id: 'saturday', label: 'Sábado' }
  ];

  const celebrationTypes = [
    { id: 'Missa', label: 'Missa' },
    { id: 'Celebração', label: 'Celebração' }
  ];

  useEffect(() => {
    fetchCelebrations();
  }, []);

  const fetchCelebrations = async () => {
    try {
      const { data, error } = await supabase
        .from('celebrations')
        .select('*')
        .order('day_of_week', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data) setCelebrations(data);
    } catch (error) {
      console.error('Error fetching celebrations:', error);
    }
  };

  const handleCreateCelebration = () => {
    const newCelebration: Celebration = {
      id: '',
      community_name: '',
      celebrant_name: '',
      celebration_type: 'Missa',
      time: '',
      day_of_week: 'sunday',
      is_active: true,
      order_index: celebrations.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingCelebration(newCelebration);
    setIsCreating(true);
  };

  const handleSaveCelebration = async () => {
    if (!editingCelebration || !editingCelebration.community_name || !editingCelebration.celebrant_name || !editingCelebration.time) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const celebrationData = {
        community_name: editingCelebration.community_name,
        celebrant_name: editingCelebration.celebrant_name,
        celebration_type: editingCelebration.celebration_type,
        time: editingCelebration.time,
        day_of_week: editingCelebration.day_of_week,
        is_active: editingCelebration.is_active,
        order_index: editingCelebration.order_index,
        updated_at: new Date().toISOString()
      };

      if (isCreating) {
        const { data, error } = await supabase
          .from('celebrations')
          .insert([celebrationData])
          .select()
          .single();

        if (error) throw error;
        setCelebrations(prev => [...prev, data].sort((a, b) => {
          if (a.day_of_week !== b.day_of_week) {
            return daysOfWeek.findIndex(d => d.id === a.day_of_week) - daysOfWeek.findIndex(d => d.id === b.day_of_week);
          }
          return a.order_index - b.order_index;
        }));
      } else {
        const { error } = await supabase
          .from('celebrations')
          .update(celebrationData)
          .eq('id', editingCelebration.id);

        if (error) throw error;
        setCelebrations(prev => prev.map(c =>
          c.id === editingCelebration.id ? { ...editingCelebration, ...celebrationData } : c
        ));
      }

      setEditingCelebration(null);
      setIsCreating(false);
      toast.success('Celebração salva com sucesso!');
    } catch (error) {
      console.error('Error saving celebration:', error);
      toast.error('Erro ao salvar celebração');
    }
  };

  const handleDeleteCelebration = async (celebration: Celebration) => {
    if (!confirm('Tem certeza que deseja excluir esta celebração?')) return;

    try {
      const { error } = await supabase
        .from('celebrations')
        .delete()
        .eq('id', celebration.id);

      if (error) throw error;
      setCelebrations(prev => prev.filter(c => c.id !== celebration.id));
      toast.success('Celebração excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting celebration:', error);
      toast.error('Erro ao excluir celebração');
    }
  };

  const handleMoveCelebration = async (celebration: Celebration, direction: 'up' | 'down') => {
    const sameDayCelebrations = celebrations.filter(c => c.day_of_week === celebration.day_of_week);
    const currentIndex = sameDayCelebrations.findIndex(c => c.id === celebration.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sameDayCelebrations.length) return;

    const targetCelebration = sameDayCelebrations[targetIndex];

    try {
      const { error: error1 } = await supabase
        .from('celebrations')
        .update({ order_index: targetCelebration.order_index })
        .eq('id', celebration.id);

      const { error: error2 } = await supabase
        .from('celebrations')
        .update({ order_index: celebration.order_index })
        .eq('id', targetCelebration.id);

      if (error1 || error2) {
        throw new Error(error1?.message || error2?.message);
      }

      await fetchCelebrations();
      toast.success('Ordem atualizada!');
    } catch (error) {
      console.error('Error moving celebration:', error);
      toast.error('Erro ao mover celebração');
    }
  };

  const getDayLabel = (dayId: string) => {
    return daysOfWeek.find(d => d.id === dayId)?.label || dayId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Gerenciar Celebrações</h3>
        <Button onClick={handleCreateCelebration}>
          <Plus className="h-4 w-4" />
          Nova Celebração
        </Button>
      </div>

      {celebrations.length === 0 && (
        <Card className="p-8 text-center">
          <Church className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhuma celebração cadastrada
          </h4>
          <p className="text-gray-500 mb-4">
            Comece criando a primeira celebração da escala
          </p>
          <Button onClick={handleCreateCelebration}>
            <Plus className="h-4 w-4" />
            Criar Primeira Celebração
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {celebrations.map((celebration, index) => {
            const sameDayCelebrations = celebrations.filter(c => c.day_of_week === celebration.day_of_week);
            const dayIndex = sameDayCelebrations.findIndex(c => c.id === celebration.id);
            
            return (
              <motion.div
                key={celebration.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`p-6 ${!celebration.is_active ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                          {getDayLabel(celebration.day_of_week)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          celebration.celebration_type === 'Missa'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {celebration.celebration_type}
                        </span>
                        {!celebration.is_active && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            Inativo
                          </span>
                        )}
                      </div>
                      
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">
                        {celebration.community_name}
                      </h4>
                      
                      <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <p><strong>Celebrante:</strong> {celebration.celebrant_name}</p>
                        <p><strong>Horário:</strong> {celebration.time}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveCelebration(celebration, 'up')}
                          disabled={dayIndex === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveCelebration(celebration, 'down')}
                          disabled={dayIndex === sameDayCelebrations.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCelebration(celebration);
                            setIsCreating(false);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCelebration(celebration)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editingCelebration && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold flex-1 pr-4">
                  {isCreating ? 'Nova Celebração' : 'Editar Celebração'}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingCelebration(null);
                    setIsCreating(false);
                  }}
                  className="w-8 h-8 p-0 rounded-full flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dia da Semana *
                  </label>
                  <select
                    value={editingCelebration.day_of_week}
                    onChange={(e) => setEditingCelebration(prev => prev ? { ...prev, day_of_week: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    {daysOfWeek.map(day => (
                      <option key={day.id} value={day.id}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Comunidade/Paróquia *
                  </label>
                  <input
                    type="text"
                    value={editingCelebration.community_name}
                    onChange={(e) => setEditingCelebration(prev => prev ? { ...prev, community_name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: Paróquia Santo Cristo, Comunidade São José..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Celebrante *
                  </label>
                  <input
                    type="text"
                    value={editingCelebration.celebrant_name}
                    onChange={(e) => setEditingCelebration(prev => prev ? { ...prev, celebrant_name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: Pe. João Silva, Diác. Maria Santos..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Celebração *
                  </label>
                  <select
                    value={editingCelebration.celebration_type}
                    onChange={(e) => setEditingCelebration(prev => prev ? { ...prev, celebration_type: e.target.value as 'Missa' | 'Celebração' } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    {celebrationTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário *
                  </label>
                  <input
                    type="time"
                    value={editingCelebration.time}
                    onChange={(e) => setEditingCelebration(prev => prev ? { ...prev, time: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingCelebration.is_active}
                      onChange={(e) => setEditingCelebration(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Celebração ativa</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveCelebration} className="flex-1">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingCelebration(null);
                      setIsCreating(false);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};