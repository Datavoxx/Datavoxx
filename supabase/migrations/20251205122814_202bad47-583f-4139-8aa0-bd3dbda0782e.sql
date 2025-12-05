
-- Create table for storing user sessions/names
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for ad generations
CREATE TABLE public.ad_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year TEXT,
  mileage TEXT,
  price TEXT,
  equipment TEXT,
  condition TEXT,
  tone TEXT,
  generated_ad TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for research conversations
CREATE TABLE public.research_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for email conversations
CREATE TABLE public.email_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  request TEXT NOT NULL,
  response TEXT,
  template_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Allow public insert on user_sessions" ON public.user_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on user_sessions" ON public.user_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public update on user_sessions" ON public.user_sessions FOR UPDATE USING (true);

CREATE POLICY "Allow public insert on ad_generations" ON public.ad_generations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on ad_generations" ON public.ad_generations FOR SELECT USING (true);

CREATE POLICY "Allow public insert on research_conversations" ON public.research_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on research_conversations" ON public.research_conversations FOR SELECT USING (true);

CREATE POLICY "Allow public insert on email_conversations" ON public.email_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on email_conversations" ON public.email_conversations FOR SELECT USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for user_sessions
CREATE TRIGGER update_user_sessions_updated_at
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
