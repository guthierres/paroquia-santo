import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { supabase, Schedule } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const ScheduleManager: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
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

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      if (data) setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleCreateSchedule = () => {
    const newSchedule: Schedule = {
      id: '',
      day_of_week: 'sunday',
      time: '',
      description: '',
      is_active: true,
      created_at: new Date().toISOString()
    };
    setEditingSchedule(newSchedule);
    setIsCreating(true);
  };

  const handleSaveSchedule = async () => {
    if (!editingSchedule || !editingSchedule.time) {
      toast.error('Preencha o horário');
      return;
    }

    try {
      const scheduleData = {
        day_of_week: editingSchedule.day_of_week,
        time: editingSchedule.time,
        description: editingSchedule.description,
        is_active: editingSchedule.is_active
      };

      if (isCreating) {
        const { data, error } = await supabase
          .from('schedules')
          .insert([scheduleData])
          .select()
          .single();

        if (error) throw error;
        setSchedules(prev => [...prev, data]);
      } else {
        const { error } = await supabase
          .from('schedules')
          .update(scheduleData)
          .eq('id', editingSchedule.id);

        if (error) throw error;
        setSchedules(prev => prev.map(s => 
          s.id === editingSchedule.id ? { ...editingSchedule, ...scheduleData } : s
        ));
      }

      setEditingSchedule(null);
      setIsCreating(false);
      toast.success('Horário salvo com sucesso!');
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Erro ao salvar horário');
    }
  };

  const handleDeleteSchedule = async (schedule: Schedule) => {
    if (!confirm('Tem certeza que deseja excluir este horário?')) return;

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', schedule.id);

      if (error) throw error;
      setSchedules(prev => prev.filter(s => s.id !== schedule.id));
      toast.success('Horário excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Erro ao excluir horário');
    }
  };

  const getDayLabel = (dayId: string) => {
    return daysOfWeek.find(d => d.id === dayId)?.label || dayId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Horários de Celebrações</h3>
        <Button onClick={handleCreateSchedule}>
          <Plus className="h-4 w-4" />
          Novo Horário
        </Button>
      </div>

      {schedules.length === 0 && (
        <Card className="p-8 text-center">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum horário configurado
          </h4>
          <p className="text-gray-500 mb-4">
            Configure os horários das missas e celebrações
          </p>
          <Button onClick={handleCreateSchedule}>
            <Plus className="h-4 w-4" />
            Adicionar Primeiro Horário
          </Button>
        </Card>
      )}

      <div className="grid gap-4">
        <AnimatePresence>
          {schedules.map((schedule) => (
            <motion.div
              key={schedule.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`p-6 ${!schedule.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Clock className="h-6 w-6 text-red-800" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {getDayLabel(schedule.day_of_week)} - {schedule.time}
                      </h4>
                      {schedule.description && (
                        <p className="text-gray-600 text-sm">{schedule.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {schedule.is_active ? 'Ativo' : 'Inativo'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingSchedule(schedule);
                        setIsCreating(false);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSchedule(schedule)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editingSchedule && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">
                  {isCreating ? 'Novo Horário' : 'Editar Horário'}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingSchedule(null);
                    setIsCreating(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dia da Semana
                  </label>
                  <select
                    value={editingSchedule.day_of_week}
                    onChange={(e) => setEditingSchedule(prev => prev ? { ...prev, day_of_week: e.target.value } : null)}
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
                    Horário *
                  </label>
                  <input
                    type="time"
                    value={editingSchedule.time}
                    onChange={(e) => setEditingSchedule(prev => prev ? { ...prev, time: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={editingSchedule.description}
                    onChange={(e) => setEditingSchedule(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: Missa Dominical, Terço, etc."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingSchedule.is_active}
                      onChange={(e) => setEditingSchedule(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Horário ativo</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveSchedule} className="flex-1">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingSchedule(null);
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