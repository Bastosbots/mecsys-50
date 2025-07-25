
import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signUp: (username: string, password: string, fullName: string, role: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        // Ignore SIGNED_UP events to prevent automatic login when creating users
        if (event === 'SIGNED_UP') {
          console.log('Ignoring SIGNED_UP event to prevent automatic login');
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile with a slight delay to avoid timing issues
          setTimeout(async () => {
            try {
              console.log('Fetching profile for user:', session.user.id);
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                console.error('Error fetching profile:', error);
              } else {
                console.log('Profile fetched:', profileData);
                setProfile(profileData);
              }
            } catch (err) {
              console.error('Exception fetching profile:', err);
            }
          }, 100);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      console.log('Tentando fazer login com username:', username);
      
      // Buscar o perfil pelo username usando ILIKE para busca case-insensitive
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', username)
        .maybeSingle();

      console.log('Resultado da busca do perfil:', { profileData, profileError });

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        return { error: { message: 'Erro interno do servidor' } };
      }

      if (!profileData) {
        console.log('Usuário não encontrado na tabela profiles');
        return { error: { message: 'Usuário não encontrado' } };
      }

      // Usar o email temporário baseado no username real (com case original) para fazer login
      const tempEmail = `${profileData.username}@mecsys.local`;
      console.log('Tentando login com email temporário:', tempEmail);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password,
      });

      console.log('Resultado do signIn:', { signInError });

      return { error: signInError };
    } catch (err) {
      console.error('Erro durante o signIn:', err);
      return { error: { message: 'Erro interno do servidor' } };
    }
  };

  const signUp = async (username: string, password: string, fullName: string, role: string) => {
    try {
      // Verificar se o username já existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingUser) {
        return { error: { message: 'Nome de usuário já existe' } };
      }

      // Criar um email temporário baseado no username
      const tempEmail = `${username}@mecsys.local`;

      // Usar signUp mas desabilitar confirmação automática
      const { error } = await supabase.auth.signUp({
        email: tempEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            role: role,
            username: username
          }
        }
      });

      // Importante: Não fazer login automático, apenas retornar o resultado
      return { error };
    } catch (err) {
      console.error('Erro durante o signUp:', err);
      return { error: { message: 'Erro interno do servidor' } };
    }
  };

  const signOut = async () => {
    try {
      console.log('Iniciando processo de logout');
      
      // Limpar estados locais primeiro
      setLoading(true);
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Limpar localStorage manualmente para garantir
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-lkfglhtrfoafuahckmsg-auth-token');
      
      // Tentar fazer logout no Supabase (mesmo que falhe, continuamos)
      try {
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        if (error) {
          console.warn('Erro ao fazer logout no Supabase (continuando mesmo assim):', error);
        } else {
          console.log('Logout no Supabase realizado com sucesso');
        }
      } catch (supabaseError) {
        console.warn('Exceção ao fazer logout no Supabase (continuando mesmo assim):', supabaseError);
      }
      
      // Garantir que todos os estados estão limpos
      setLoading(false);
      
      console.log('Logout local concluído, redirecionando para página de login');
      
      // Redirecionar para a página de login em vez de recarregar
      window.location.href = '/auth';
      
    } catch (err) {
      console.error('Erro geral durante logout:', err);
      
      // Em caso de erro, limpar tudo e redirecionar mesmo assim
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
      
      // Limpar localStorage manualmente
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-lkfglhtrfoafuahckmsg-auth-token');
      
      window.location.href = '/auth';
    }
  };

  const value = {
    user,
    session,
    profile,
    signIn,
    signUp,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
