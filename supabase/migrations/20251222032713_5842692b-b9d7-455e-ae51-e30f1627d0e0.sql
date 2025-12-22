-- Add contact information columns to email_connection_requests
ALTER TABLE public.email_connection_requests
ADD COLUMN contact_name text,
ADD COLUMN phone_number text,
ADD COLUMN company_name text;