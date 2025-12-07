-- Create help_requests table
CREATE TABLE public.help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email TEXT NOT NULL,
  help_topic TEXT NOT NULL,
  wants_pdf BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

-- Allow public insert
CREATE POLICY "Allow public insert on help_requests" 
ON public.help_requests 
FOR INSERT 
WITH CHECK (true);

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated users to read help_requests" 
ON public.help_requests 
FOR SELECT 
USING (auth.uid() IS NOT NULL);