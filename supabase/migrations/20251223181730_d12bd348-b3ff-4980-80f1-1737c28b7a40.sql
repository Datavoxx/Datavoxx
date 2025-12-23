-- Step 1: Only add new roles to enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'pro';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'beginner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'intro';