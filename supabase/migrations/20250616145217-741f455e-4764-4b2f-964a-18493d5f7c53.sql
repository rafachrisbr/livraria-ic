
-- Adicionar o usuário como administrador caso não exista
INSERT INTO public.administrators (user_id, email, name)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'name', email)
FROM auth.users
WHERE email = 'rafael.christiano@yahoo.com.br'
ON CONFLICT (user_id) DO NOTHING;

-- Você pode rodar também um SELECT para conferir que o administrador foi inserido:
SELECT * FROM public.administrators WHERE email = 'rafael.christiano@yahoo.com.br';
