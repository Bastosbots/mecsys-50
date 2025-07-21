
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCreatePublicLink = () => {
  return useMutation({
    mutationFn: async (checklistId: string) => {
      const { data, error } = await supabase
        .rpc('get_or_create_checklist_public_link', {
          p_checklist_id: checklistId
        });

      if (error) throw error;
      return data;
    },
    onSuccess: (token) => {
      const publicUrl = `${window.location.origin}/public/checklist/${token}`;
      navigator.clipboard.writeText(publicUrl);
      toast.success('Link público copiado para a área de transferência!');
    },
    onError: (error) => {
      console.error('Erro ao gerar link público:', error);
      toast.error('Erro ao gerar link público');
    },
  });
};

export const useCreateBudgetPublicLink = () => {
  return useMutation({
    mutationFn: async (budgetId: string) => {
      const { data, error } = await supabase
        .rpc('get_or_create_budget_public_link', {
          p_budget_id: budgetId
        });

      if (error) throw error;
      return data;
    },
    onSuccess: (token) => {
      const publicUrl = `${window.location.origin}/public/budget/${token}`;
      navigator.clipboard.writeText(publicUrl);
      toast.success('Link público do orçamento copiado para a área de transferência!');
    },
    onError: (error) => {
      console.error('Erro ao gerar link público do orçamento:', error);
      toast.error('Erro ao gerar link público do orçamento');
    },
  });
};
