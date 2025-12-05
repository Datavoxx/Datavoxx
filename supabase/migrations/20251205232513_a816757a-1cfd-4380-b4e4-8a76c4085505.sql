-- Add company_name column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN company_name text;

-- Update the handle_new_user trigger function to include company_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, company_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'company_name'
  );
  RETURN NEW;
END;
$$;