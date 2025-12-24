-- Byt namn på enum-värden
ALTER TYPE public.app_role RENAME VALUE 'ai_email' TO 'gen_1';
ALTER TYPE public.app_role RENAME VALUE 'beginner' TO 'gen_2';
ALTER TYPE public.app_role RENAME VALUE 'pro' TO 'gen_3';

-- Uppdatera has_role_level funktionen med nya värden
CREATE OR REPLACE FUNCTION public.has_role_level(_user_id uuid, _min_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        CASE role
          WHEN 'admin' THEN 4
          WHEN 'gen_3' THEN 3
          WHEN 'gen_2' THEN 2
          WHEN 'gen_1' THEN 2
          WHEN 'intro' THEN 1
          ELSE 0
        END
      ) >= (
        CASE _min_role
          WHEN 'admin' THEN 4
          WHEN 'gen_3' THEN 3
          WHEN 'gen_2' THEN 2
          WHEN 'gen_1' THEN 2
          WHEN 'intro' THEN 1
          ELSE 0
        END
      )
  )
$$;