
-- Create table for public checklist links
CREATE TABLE public.checklist_public_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  public_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Add RLS policies
ALTER TABLE public.checklist_public_links ENABLE ROW LEVEL SECURITY;

-- Policy for viewing public links (anyone with valid token)
CREATE POLICY "Anyone can view active public links by token" 
  ON public.checklist_public_links 
  FOR SELECT 
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Policy for creating public links (mechanics and admins)
CREATE POLICY "Users can create public links for their checklists" 
  ON public.checklist_public_links 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.checklists 
      WHERE id = checklist_id 
      AND (mechanic_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );

-- Policy for managing public links (mechanics and admins)
CREATE POLICY "Users can manage public links for their checklists" 
  ON public.checklist_public_links 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.checklists 
      WHERE id = checklist_id 
      AND (mechanic_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );

-- Function to generate or get existing public link
CREATE OR REPLACE FUNCTION public.get_or_create_checklist_public_link(p_checklist_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_token TEXT;
  new_token TEXT;
BEGIN
  -- Check if user has permission to access this checklist
  IF NOT EXISTS (
    SELECT 1 FROM public.checklists 
    WHERE id = p_checklist_id 
    AND (mechanic_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ))
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Check if active public link already exists
  SELECT public_token INTO existing_token
  FROM public.checklist_public_links
  WHERE checklist_id = p_checklist_id 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now());

  IF existing_token IS NOT NULL THEN
    RETURN existing_token;
  END IF;

  -- Generate new token
  new_token := encode(gen_random_bytes(32), 'hex');

  -- Insert new public link
  INSERT INTO public.checklist_public_links (checklist_id, public_token)
  VALUES (p_checklist_id, new_token);

  RETURN new_token;
END;
$$;
