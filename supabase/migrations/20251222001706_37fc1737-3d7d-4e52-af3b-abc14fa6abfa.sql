-- Create table for tracking demo interactions
CREATE TABLE public.demo_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT NOT NULL,
  action TEXT NOT NULL,  -- 'next', 'generate', 'copy', 'reset', 'create_real'
  step_from INTEGER      -- Vilket steg användaren var på när de klickade
);

-- Enable RLS
ALTER TABLE public.demo_tests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (including anonymous)
CREATE POLICY "Anyone can insert demo_tests" 
  ON public.demo_tests 
  FOR INSERT 
  WITH CHECK (true);

-- Only authenticated users can read (for admin/analysis)
CREATE POLICY "Authenticated can read demo_tests" 
  ON public.demo_tests 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);