-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  services TEXT[] NOT NULL DEFAULT '{}',
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow public insert (no auth required for feedback)
CREATE POLICY "Allow public insert on feedback"
ON public.feedback
FOR INSERT
WITH CHECK (true);

-- Only allow admins/backend to read feedback (optional)
CREATE POLICY "Allow authenticated users to read feedback"
ON public.feedback
FOR SELECT
USING (auth.uid() IS NOT NULL);