-- Create waitlist table for package interest signups
CREATE TABLE public.package_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.package_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public signup form)
CREATE POLICY "Anyone can sign up for waitlist"
ON public.package_waitlist
FOR INSERT
WITH CHECK (true);

-- Only admins can view (or you can make this more restrictive)
CREATE POLICY "Waitlist entries are not publicly readable"
ON public.package_waitlist
FOR SELECT
USING (false);