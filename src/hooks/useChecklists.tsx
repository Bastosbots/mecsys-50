
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRealtime } from './useRealtime';

export interface ChecklistData {
  id: string;
  customer_name: string;
  plate: string;
  vehicle_name: string;
  status: string;
  priority: string;
  mechanic_id: string;
  general_observations?: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  mechanic?: {
    full_name: string;
  };
}

export interface CreateChecklistInput {
  customer_name: string;
  plate: string;
  vehicle_name: string;
  status: string;
  priority: string;
  mechanic_id: string;
  general_observations?: string;
  video_url?: string;
  completed_at?: string;
}

export const useChecklists = () => {
  // Setup realtime subscription
  useRealtime({
    table: 'checklists',
    queryKey: ['checklists']
  });

  return useQuery({
    queryKey: ['checklists'],
    queryFn: async () => {
      const { data: checklists, error: checklistsError } = await supabase
        .from('checklists')
        .select('*')
        .order('created_at', { ascending: false });

      if (checklistsError) throw checklistsError;

      const { data: mechanics, error: mechanicsError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (mechanicsError) throw mechanicsError;

      const checklistsWithMechanics = checklists?.map(checklist => ({
        ...checklist,
        mechanic: mechanics?.find(m => m.id === checklist.mechanic_id) || null
      })) || [];

      return checklistsWithMechanics as ChecklistData[];
    },
  });
};

export const useCreateChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checklistData: CreateChecklistInput) => {
      const { data, error } = await supabase
        .from('checklists')
        .insert(checklistData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast.success('Checklist criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar checklist:', error);
      toast.error('Erro ao criar checklist');
    },
  });
};

export const useUpdateChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...checklistData }: Partial<ChecklistData> & { id: string }) => {
      // Se o status está sendo alterado para "Concluído", definir completed_at
      if (checklistData.status === 'Concluído') {
        checklistData.completed_at = new Date().toISOString();
      }
      // Se o status está sendo alterado para algo diferente de "Concluído", remover completed_at
      else if (checklistData.status && checklistData.status !== 'Concluído') {
        checklistData.completed_at = null;
      }

      const { data, error } = await supabase
        .from('checklists')
        .update(checklistData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Checklist atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar checklist:', error);
      toast.error('Erro ao atualizar checklist');
    },
  });
};

export const useDeleteChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast.success('Checklist excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir checklist:', error);
      toast.error('Erro ao excluir checklist');
    },
  });
};
