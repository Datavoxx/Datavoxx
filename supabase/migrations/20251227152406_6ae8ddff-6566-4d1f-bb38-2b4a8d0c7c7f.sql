-- Skapa bonus_requests tabell
CREATE TABLE public.bonus_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  template_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bonus_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies för bonus_requests
CREATE POLICY "Users can create their own bonus requests"
ON public.bonus_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bonus requests"
ON public.bonus_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Owner can view all bonus requests"
ON public.bonus_requests FOR SELECT
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can view all bonus requests"
ON public.bonus_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Owner can update bonus requests"
ON public.bonus_requests FOR UPDATE
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can update bonus requests"
ON public.bonus_requests FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Trigger för updated_at
CREATE TRIGGER update_bonus_requests_updated_at
BEFORE UPDATE ON public.bonus_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Owner RLS policies för alla befintliga tabeller
CREATE POLICY "Owner can view all ad_generations"
ON public.ad_generations FOR SELECT
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can view all ad_edits"
ON public.ad_edits FOR SELECT
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can view all email_conversations"
ON public.email_conversations FOR SELECT
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can view all research_conversations"
ON public.research_conversations FOR SELECT
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can view all template_requests"
ON public.template_requests FOR SELECT
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can view all help_requests"
ON public.help_requests FOR SELECT
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can view all feedback"
ON public.feedback FOR SELECT
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can view all daily_credits"
ON public.daily_credits FOR SELECT
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can view all email_connection_requests"
ON public.email_connection_requests FOR SELECT
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can view all tool_access_requests"
ON public.tool_access_requests FOR SELECT
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can view all user_roles"
ON public.user_roles FOR SELECT
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can update user_roles"
ON public.user_roles FOR UPDATE
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can view all user_templates"
ON public.user_templates FOR SELECT
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can view all user_sessions"
ON public.user_sessions FOR SELECT
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can view all demo_tests"
ON public.demo_tests FOR SELECT
USING (has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can view all email_credentials"
ON public.email_credentials FOR SELECT
USING (has_role(auth.uid(), 'owner'));

-- Uppdatera has_role_level funktionen för att inkludera owner
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
          WHEN 'owner' THEN 5
          WHEN 'admin' THEN 4
          WHEN 'gen_3' THEN 3
          WHEN 'gen_2' THEN 2
          WHEN 'gen_1' THEN 2
          WHEN 'intro' THEN 1
          ELSE 0
        END
      ) >= (
        CASE _min_role
          WHEN 'owner' THEN 5
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