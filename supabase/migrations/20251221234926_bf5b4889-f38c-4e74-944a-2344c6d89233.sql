-- Create table for tracking ad edits (including anonymous users)
CREATE TABLE public.ad_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Link to original ad (nullable for anonymous)
  original_ad_id UUID REFERENCES public.ad_generations(id) ON DELETE SET NULL,
  
  -- Session-based tracking (for anonymous users)
  session_id TEXT NOT NULL,
  
  -- Content
  original_text TEXT NOT NULL,
  edited_text TEXT NOT NULL,
  
  -- Metadata
  car_info TEXT,
  ad_length TEXT
);

-- Enable RLS
ALTER TABLE public.ad_edits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (including anonymous)
CREATE POLICY "Anyone can insert ad_edits" 
  ON public.ad_edits 
  FOR INSERT 
  WITH CHECK (true);

-- Only authenticated users can read (for admin/analysis)
CREATE POLICY "Authenticated can read ad_edits" 
  ON public.ad_edits 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);