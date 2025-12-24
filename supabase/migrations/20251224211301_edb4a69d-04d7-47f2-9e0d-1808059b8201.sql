-- Skapa daily_credits tabell för kreditsystemet
CREATE TABLE public.daily_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints för unikhet
  CONSTRAINT daily_credits_user_date_unique UNIQUE (user_id, date),
  CONSTRAINT daily_credits_session_date_unique UNIQUE (session_id, date),
  
  -- Minst en av user_id eller session_id måste finnas
  CONSTRAINT daily_credits_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Index för snabba lookups
CREATE INDEX idx_daily_credits_user_date ON public.daily_credits(user_id, date);
CREATE INDEX idx_daily_credits_session_date ON public.daily_credits(session_id, date);

-- Enable RLS
ALTER TABLE public.daily_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Inloggade användare kan se sina egna credits
CREATE POLICY "Users can view own credits"
ON public.daily_credits
FOR SELECT
USING (auth.uid() = user_id);

-- Anonyma och inloggade kan insertera (edge function hanterar logiken)
CREATE POLICY "Allow insert credits"
ON public.daily_credits
FOR INSERT
WITH CHECK (true);

-- Tillåt uppdatering via service role (edge function)
CREATE POLICY "Allow update credits"
ON public.daily_credits
FOR UPDATE
USING (true);

-- Trigger för updated_at
CREATE TRIGGER update_daily_credits_updated_at
BEFORE UPDATE ON public.daily_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();