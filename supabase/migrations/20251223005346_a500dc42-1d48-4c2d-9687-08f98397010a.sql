-- Create table for storing email credentials per user
CREATE TABLE public.email_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  imap_host TEXT NOT NULL,
  imap_port INTEGER NOT NULL DEFAULT 993,
  imap_username TEXT NOT NULL,
  imap_password TEXT NOT NULL,
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_credentials ENABLE ROW LEVEL SECURITY;

-- Users can only view their own credentials
CREATE POLICY "Users can view own email credentials"
ON public.email_credentials
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own credentials
CREATE POLICY "Users can insert own email credentials"
ON public.email_credentials
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own credentials
CREATE POLICY "Users can update own email credentials"
ON public.email_credentials
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own credentials
CREATE POLICY "Users can delete own email credentials"
ON public.email_credentials
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_email_credentials_updated_at
BEFORE UPDATE ON public.email_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();