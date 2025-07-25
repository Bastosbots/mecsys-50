
-- Criar função para permitir que administradores alterem dados de usuários
CREATE OR REPLACE FUNCTION public.admin_update_user_data(
  p_user_id UUID,
  p_full_name TEXT DEFAULT NULL,
  p_username TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Verificar se o usuário atual é admin
  SELECT role INTO current_user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Sem permissão para alterar dados de usuários';
  END IF;
  
  -- Verificar se o usuário alvo existe
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  
  -- Verificar se o username já está em uso (se fornecido)
  IF p_username IS NOT NULL AND p_username != '' THEN
    IF EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE username = p_username AND id != p_user_id
    ) THEN
      RAISE EXCEPTION 'Nome de usuário já está em uso';
    END IF;
  END IF;
  
  -- Atualizar o perfil
  UPDATE public.profiles 
  SET 
    full_name = COALESCE(p_full_name, full_name),
    username = COALESCE(p_username, username),
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Se username foi alterado, atualizar o email temporário no auth também
  IF p_username IS NOT NULL AND p_username != '' THEN
    UPDATE auth.users 
    SET email = p_username || '@mecsys.local'
    WHERE id = p_user_id;
  END IF;
END;
$$;

-- Criar função para permitir que administradores alterem senhas
CREATE OR REPLACE FUNCTION public.admin_update_user_password(
  p_user_id UUID,
  p_new_password TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Verificar se o usuário atual é admin
  SELECT role INTO current_user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Sem permissão para alterar senhas';
  END IF;
  
  -- Verificar se o usuário alvo existe
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  
  -- Alterar a senha usando a função admin do Supabase
  -- Nota: Esta função deve ser chamada via Edge Function para usar o service role
  RAISE NOTICE 'Solicitação de alteração de senha para usuário: %', p_user_id;
END;
$$;

-- Adicionar política para permitir que administradores atualizem perfis via função
CREATE POLICY "Admins can update profiles via secure function" 
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);
