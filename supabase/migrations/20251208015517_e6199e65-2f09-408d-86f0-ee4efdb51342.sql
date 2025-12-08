-- Drop existing public policies on user_sessions
DROP POLICY IF EXISTS "Allow public select on user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow public insert on user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow public update on user_sessions" ON public.user_sessions;

-- Create new restricted policies
-- Only authenticated users can read user_sessions
CREATE POLICY "Authenticated users can view user_sessions"
ON public.user_sessions
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Anyone can insert (needed for anonymous session creation)
CREATE POLICY "Anyone can insert user_sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (true);

-- Only authenticated users can update their own sessions (optional, for future use)
CREATE POLICY "Authenticated users can update user_sessions"
ON public.user_sessions
FOR UPDATE
USING (auth.uid() IS NOT NULL);