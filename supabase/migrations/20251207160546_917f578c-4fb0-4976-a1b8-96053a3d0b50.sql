-- Add description column to help_requests
ALTER TABLE public.help_requests 
ADD COLUMN description TEXT;