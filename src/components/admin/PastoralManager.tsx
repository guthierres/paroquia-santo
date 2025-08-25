import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { supabase, Pastoral } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const PastoralManager: React.FC = () => {
  const [pastorals, setPastorals] = useState<Pastoral[]>([]);
  const [editingPastoral, setEditingPastoral] = useState<Pastoral | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchPastorals();
  }, []);

  const fetchPastorals = async () => {
    try {
      const { data, error } = await supabase
        .from('pastorals')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data) setPastorals(data);
    } catch (error) {
      console.error('Error fetching pastorals:', error);
    }
  };

  const handleCreatePastoral = () => {
    const newPastoral: Pastoral = {
      id: '',
      name: '',
      coordinator: '',
      description: '',
      contact_phone: '',
      is_active: true,
      order_index: pastorals.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingPastoral(newPastoral);
    setIsCreating(true);
  };

  const handleSavePastoral = async () => {
    if (!editingPastoral || !editingPastoral.name || !editingPastoral.coordinator || !editingPastoral.description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const pastoralData = {
        name: editingPastoral.name,
        coordinator: editingPastoral.coordinator,
        description: editingPastoral.description,
        contact_phone: editingPastoral.contact_phone,
        is_active: editingPastoral.is_active,
        order_index: editingPastoral.order_index,
        updated_at: new Date().toISOString()
      };

      if (isCreating) {
        const newOrderIndex = pastorals.length > 0 ? Math.max(...pastorals.map(p => p.order_index)) + 1 : 0;
        const { data, error } = await supabase
          .from('pastorals')
          .insert([{ ...pastoralData, order_index: newOrderIndex }])
          .select()
          .single();

        if (error) throw error;
        setPastorals(prev => [...prev, data].sort((a, b) => a.order_index - b.order_index));
      } else {
        const { error } = await supabase
          .from('pastorals')
          .update(pastoralData)
          .eq('id', editingPastoral.id);

        if (error) throw error;
        setPastorals(prev => prev.map(p =>
          p.id === editingPastoral.id ? { ...editingPastoral, ...pastoralData } : p
        ));
      }

      setEditingPastoral(null);
      setIsCreating(false);
      toast.success('Pastoral salva com sucesso!');
    } catch (error) {
      console.error('Error saving pastoral:', error);
      toast.error('Erro ao salvar pastoral');
    }
  };

  const handleDeletePastoral = async (pastoral: Pastoral) => {
    if (!confirm('Tem certeza que deseja excluir esta pastoral?')) return;

    try {
      const { error } = await supabase
        .from('pastorals')
        .delete()
        .eq('id', pastoral.id);

      if (error) throw error;
      setPastorals(prev => prev.filter(p => p.id !== pastoral.id));
      toast.success('Pastoral excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting pastoral:', error);
      toast.error('Erro ao excluir pastoral');
    }
  };

  const handleMovePastoral = async (pastoral: Pastoral, direction: 'up' | 'down') => {
    const currentIndex = pastorals.findIndex(p => p.id === pastoral.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= pastorals.length) return;

    const targetPastoral = pastorals[targetIndex];

    try {
      const { error: error1 } = await supabase
        .from('pastorals')
        .update({ order_index: targetPastoral.order_index })
        .eq('id', pastoral.id);

      const { error: error2 } = await supabase
        .from('pastorals')
        .update({ order_index: pastoral.order_index })
        .eq('id', targetPastoral.id);

      if (error1 || error2) {
        throw new Error(error1?.message || error2?.message);
      }

      const updatedPastorals = [...pastorals];
      updatedPastorals[currentIndex] = { ...pastoral, order_index: targetPastoral.order_index };
      updatedPastorals[targetIndex] = { ...targetPastoral, order_index: pastoral.order_index };
      
      setPastorals(updatedPastorals.sort((a, b) => a.order_index - b.order_index));
      toast.success('Ordem atualizada!');
    } catch (error) {
      console.error('Error moving pastoral:', error);
      toast.error('Erro ao mover pastoral');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Gerenciar Pastorais</h3>
        <Button onClick={handleCreatePastoral}>
          <Plus className="h-4 w-4" />
          Nova Pastoral
        </Button>
      </div>

      {pastorals.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhuma pastoral cadastrada
          </h4>
          <p className="text-gray-500 mb-4">
            Comece criando a primeira pastoral da paróquia
          </p>
          <Button onClick={handleCreatePastoral}>
            <Plus className="h-4 w-4" />
            Criar Primeira Pastoral
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {pastorals.map((pastoral, index) => (
            <motion.div
              key={pastoral.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`p-6 ${!pastoral.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">{pastoral.name}</h4>
                    <p className="text-red-800 font-medium text-sm mb-2">
                      Coordenador: {pastoral.coordinator}
                    </p>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{pastoral.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {pastoral.contact_phone && <span>📞 {pastoral.contact_phone}</span>}
                      <span>Ordem: {pastoral.order_index}</span>
                      <span>{pastoral.is_active ? 'Ativa' : 'Inativa'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMovePastoral(pastoral, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMovePastoral(pastoral, 'down')}
                        disabled={index === pastorals.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPastoral(pastoral);
                          setIsCreating(false);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePastoral(pastoral)}
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

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editingPastoral && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h4 className="text-lg font-semibold">
                  {isCreating ? 'Nova Pastoral' : 'Editar Pastoral'}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingPastoral(null);
                    setIsCreating(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Pastoral *
                  </label>
                  <input
                    type="text"
                    value={editingPastoral.name}
                    onChange={(e) => setEditingPastoral(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: Pastoral da Criança"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coordenador(a) *
                  </label>
                  <input
                    type="text"
                    value={editingPastoral.coordinator}
                    onChange={(e) => setEditingPastoral(prev => prev ? { ...prev, coordinator: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Nome do coordenador"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone de Contato
                  </label>
                  <input
                    type="text"
                    value={editingPastoral.contact_phone}
                    onChange={(e) => setEditingPastoral(prev => prev ? { ...prev, contact_phone: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição da Pastoral *
                  </label>
                  <textarea
                    value={editingPastoral.description}
                    onChange={(e) => setEditingPastoral(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Descreva os objetivos, atividades e como participar da pastoral..."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingPastoral.is_active}
                      onChange={(e) => setEditingPastoral(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Pastoral ativa (visível no site)
                    </span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleSavePastoral} className="flex-1">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingPastoral(null);
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