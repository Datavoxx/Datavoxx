-- Lägg till user_id kolumn för att spåra inloggade vs anonyma användare
ALTER TABLE public.demo_tests 
ADD COLUMN user_id UUID;