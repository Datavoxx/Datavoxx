-- Add display_name and email columns to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN display_name text,
ADD COLUMN email text;

-- Update existing roles with profile data
UPDATE public.user_roles ur
SET 
  display_name = p.display_name,
  email = (SELECT email FROM auth.users WHERE id = ur.user_id)
FROM public.profiles p
WHERE ur.user_id = p.user_id;