-- Create email connection requests table
CREATE TABLE public.email_connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('google', 'other')),
  email_address TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_connection_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own email requests"
  ON public.email_connection_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create own email requests"
  ON public.email_connection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add email connection columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_connected BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS connected_email TEXT;

-- Create trigger for updated_at
CREATE TRIGGER update_email_connection_requests_updated_at
  BEFORE UPDATE ON public.email_connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();