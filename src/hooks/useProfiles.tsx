
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRealtime } from './useRealtime';

export interface Profile {
  id: string;
  full_name: string | null;
  role: string;
  username: string | null;
  created_at: string;
  updated_at: string | null;
}

export const useProfiles = () => {
  // Setup realtime subscription
  useRealtime({
    table: 'profiles',
    queryKey: ['profiles']
  });

  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, username, role }: { id: string; username?: string; role?: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ username, role, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    },
  });
};

export const useUpdatePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const { data, error } = await supabase.functions.invoke('update-user-password', {
        body: { userId, newPassword }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha');
    },
  });
};

export const useUpdateUserData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, fullName, username }: { userId: string; fullName?: string; username?: string }) => {
      const { data, error } = await supabase.functions.invoke('update-user-data', {
        body: { userId, fullName, username }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Dados alterados com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao alterar dados:', error);
      toast.error('Erro ao alterar dados');
    },
  });
};
