
-- Primeiro, vamos adicionar uma constraint de unicidade na coluna user_id
ALTER TABLE public.administrators 
ADD CONSTRAINT administrators_user_id_unique UNIQUE (user_id);

-- Criar a função de verificação de admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.administrators 
    WHERE administrators.user_id = $1
  );
$$;

-- Agora vamos adicionar você como administrador
INSERT INTO public.administrators (user_id, email, name)
VALUES ('3d0cfd68-1833-499e-bdf3-c3f7f7ef14a9', 'rafael.christiano@yahoo.com.br', 'Rafael Christiano')
ON CONFLICT (user_id) DO NOTHING;
