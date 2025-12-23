-- 1. Migrera befintlig ai_email → beginner
UPDATE public.user_roles 
SET role = 'beginner'::app_role 
WHERE role = 'ai_email'::app_role;

-- 2. Lägg till alla användare som saknas i user_roles med intro-roll
INSERT INTO public.user_roles (user_id, role, display_name, email)
SELECT p.user_id, 'intro'::app_role, p.display_name, p.email
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.user_id
);

-- 3. Uppgradera mahad@datavoxx.se till admin
UPDATE public.user_roles 
SET role = 'admin'::app_role 
WHERE email = 'mahad@datavoxx.se';

-- 4. Skapa trigger för nya användare
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, display_name, email)
  VALUES (NEW.id, 'intro'::app_role, NEW.raw_user_meta_data ->> 'display_name', NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_add_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_role();

-- 5. Skapa has_role_level funktion för hierarki-koll
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
          WHEN 'pro' THEN 3
          WHEN 'beginner' THEN 2
          WHEN 'intro' THEN 1
          ELSE 0
        END
      ) >= (
        CASE _min_role
          WHEN 'admin' THEN 4
          WHEN 'pro' THEN 3
          WHEN 'beginner' THEN 2
          WHEN 'intro' THEN 1
          ELSE 0
        END
      )
  )
$$;