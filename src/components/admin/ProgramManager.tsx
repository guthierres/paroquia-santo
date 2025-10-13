import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Adicionado Image
import { Plus, Edit, Trash2, Save, X, Calendar, ArrowUp, ArrowDown, Image } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { supabase, Program } from '../../lib/supabase';
import { FileUpload } from '../ui/FileUpload';
import toast from 'react-hot-toast';

export const ProgramManager: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
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
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data) setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleCreateProgram = () => {
    const newProgram: Program = {
      id: '',
      title: '',
      description: '',
      featured_image: null,
      days_of_week: [],
      time: '',
      slug: '',
      is_active: true,
      order_index: programs.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingProgram(newProgram);
    setIsCreating(true);
  };

    // Removida a função handleFeaturedImageUpload, voltando a lógica para inline
    // para usar o formato mais simples de onUpload, que retorna a string URL.

  const handleSaveProgram = async () => {
    if (!editingProgram || !editingProgram.title || !editingProgram.time || editingProgram.days_of_week.length === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const slug = generateSlug(editingProgram.title);
      const programData = {
        title: editingProgram.title,
        description: editingProgram.description,
        featured_image: editingProgram.featured_image,
        days_of_week: editingProgram.days_of_week,
        time: editingProgram.time,
        slug: slug,
        is_active: editingProgram.is_active,
        order_index: editingProgram.order_index,
        updated_at: new Date().toISOString()
      };

      if (isCreating) {
        const { data, error } = await supabase
          .from('programs')
          .insert([programData])
          .select()
          .single();

        if (error) throw error;
        setPrograms(prev => [...prev, data].sort((a, b) => a.order_index - b.order_index));
      } else {
        const { error } = await supabase
          .from('programs')
          .update(programData)
          .eq('id', editingProgram.id);

        if (error) throw error;
        setPrograms(prev => prev.map(p =>
          p.id === editingProgram.id ? { ...editingProgram, ...programData } : p
        ));
      }

      setEditingProgram(null);
      setIsCreating(false);
      toast.success('Programação salva com sucesso!');
    } catch (error) {
      console.error('Error saving program:', error);
      toast.error('Erro ao salvar programação');
    }
  };

  const handleDeleteProgram = async (program: Program) => {
    if (!confirm('Tem certeza que deseja excluir esta programação?')) return;

    try {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', program.id);

      if (error) throw error;
      setPrograms(prev => prev.filter(p => p.id !== program.id));
      toast.success('Programação excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting program:', error);
      toast.error('Erro ao excluir programação');
    }
  };

  const handleMoveProgram = async (program: Program, direction: 'up' | 'down') => {
    const currentIndex = programs.findIndex(p => p.id === program.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= programs.length) return;

    const targetProgram = programs[targetIndex];

    try {
      const { error: error1 } = await supabase
        .from('programs')
        .update({ order_index: targetProgram.order_index })
        .eq('id', program.id);

      const { error: error2 } = await supabase
        .from('programs')
        .update({ order_index: program.order_index })
        .eq('id', targetProgram.id);

      if (error1 || error2) {
        throw new Error(error1?.message || error2?.message);
      }

      await fetchPrograms();
      toast.success('Ordem atualizada!');
    } catch (error) {
      console.error('Error moving program:', error);
      toast.error('Erro ao mover programação');
    }
  };

  const getDayLabel = (dayId: string) => {
    return daysOfWeek.find(d => d.id === dayId)?.label || dayId;
  };

  const toggleDay = (dayId: string) => {
    if (!editingProgram) return;

    const days = [...editingProgram.days_of_week];
    const index = days.indexOf(dayId);

    if (index > -1) {
      days.splice(index, 1);
    } else {
      days.push(dayId);
    }

    setEditingProgram({ ...editingProgram, days_of_week: days });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Gerenciar Programações</h3>
        <Button onClick={handleCreateProgram}>
          <Plus className="h-4 w-4" />
          Nova Programação
        </Button>
      </div>

      {programs.length === 0 && (
        <Card className="p-8 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhuma programação cadastrada
          </h4>
          <p className="text-gray-500 mb-4">
            Comece criando a primeira programação da paróquia
          </p>
          <Button onClick={handleCreateProgram}>
            <Plus className="h-4 w-4" />
            Criar Primeira Programação
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`p-6 ${!program.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-4">
                  {program.featured_image && (
                    <img
                      src={program.featured_image}
                      alt={program.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {!program.is_active && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          Inativo
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800 mb-1">
                      {program.title}
                    </h4>

                    <p className="text-sm text-gray-600 mb-2">
                      {program.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {program.days_of_week.map(day => (
                        <span key={day} className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          {getDayLabel(day)}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-gray-600">
                      <strong>Horário:</strong> {program.time}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveProgram(program, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveProgram(program, 'down')}
                        disabled={index === programs.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingProgram(program);
                          setIsCreating(false);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProgram(program)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editingProgram && (
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
                  {isCreating ? 'Nova Programação' : 'Editar Programação'}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingProgram(null);
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
                    Título *
                  </label>
                  <input
                    type="text"
                    value={editingProgram.title}
                    onChange={(e) => setEditingProgram(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: Catequese Infantil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={editingProgram.description}
                    onChange={(e) => setEditingProgram(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    rows={3}
                    placeholder="Descreva a programação"
                  />
                </div>

                {/* --- Lógica de Upload/Preview da Imagem (Ajustada) --- */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem de Destaque
                  </label>
                  {editingProgram.featured_image ? (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={editingProgram.featured_image}
                          alt="Preview da imagem de destaque"
                          className="w-full h-48 object-cover"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProgram(prev => prev ? {
                            ...prev,
                            featured_image: null // Remove a URL
                          } : null)}
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                        >
                          <X className="h-3 w-3" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  ) : (
                        // Componente FileUpload com o callback onUpload simples (URL como string)
                    <FileUpload
                      onUpload={(url) => setEditingProgram(prev => prev ? { ...prev, featured_image: url } : null)}
                      accept="image/*"
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-500 transition-colors">
                        <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Clique para selecionar uma imagem
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG ou WEBP
                        </p>
                      </div>
                    </FileUpload>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    A imagem será usada como capa da programação.
                  </p>
                </div>
                {/* --- Fim da Lógica de Upload/Preview da Imagem --- */}


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dias da Semana *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {daysOfWeek.map(day => (
                      <label key={day.id} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={editingProgram.days_of_week.includes(day.id)}
                          onChange={() => toggleDay(day.id)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm">{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário *
                  </label>
                  <input
                    type="time"
                    value={editingProgram.time}
                    onChange={(e) => setEditingProgram(prev => prev ? { ...prev, time: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingProgram.is_active}
                      onChange={(e) => setEditingProgram(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Programação ativa</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveProgram} className="flex-1">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingProgram(null);
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