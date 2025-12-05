-- Add user_id column to all three tables
ALTER TABLE public.research_conversations 
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.email_conversations 
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.ad_generations 
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old public policies for research_conversations
DROP POLICY IF EXISTS "Allow public insert on research_conversations" ON public.research_conversations;
DROP POLICY IF EXISTS "Allow public select on research_conversations" ON public.research_conversations;

-- Drop old public policies for email_conversations
DROP POLICY IF EXISTS "Allow public insert on email_conversations" ON public.email_conversations;
DROP POLICY IF EXISTS "Allow public select on email_conversations" ON public.email_conversations;

-- Drop old public policies for ad_generations
DROP POLICY IF EXISTS "Allow public insert on ad_generations" ON public.ad_generations;
DROP POLICY IF EXISTS "Allow public select on ad_generations" ON public.ad_generations;

-- Create new user-specific RLS policies for research_conversations
CREATE POLICY "Users can view own research" ON public.research_conversations 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own research" ON public.research_conversations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create new user-specific RLS policies for email_conversations
CREATE POLICY "Users can view own emails" ON public.email_conversations 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emails" ON public.email_conversations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create new user-specific RLS policies for ad_generations
CREATE POLICY "Users can view own ads" ON public.ad_generations 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ads" ON public.ad_generations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);