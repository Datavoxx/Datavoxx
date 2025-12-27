-- Ta bort den gamla check constraint
ALTER TABLE email_connection_requests 
DROP CONSTRAINT IF EXISTS email_connection_requests_request_type_check;

-- Lägg till ny check constraint med 'callback' som tillåtet värde
ALTER TABLE email_connection_requests 
ADD CONSTRAINT email_connection_requests_request_type_check 
CHECK (request_type = ANY (ARRAY['google'::text, 'other'::text, 'callback'::text]));