import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "bilgen_session_id";
const NAME_KEY = "bilgen_user_name";

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useUserSession = () => {
  const [userName, setUserName] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get or create session ID
    let storedSessionId = localStorage.getItem(SESSION_KEY);
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      localStorage.setItem(SESSION_KEY, storedSessionId);
    }
    setSessionId(storedSessionId);

    // Get stored name
    const storedName = localStorage.getItem(NAME_KEY);
    if (storedName) {
      setUserName(storedName);
    }
    setIsLoading(false);
  }, []);

  const updateUserName = async (name: string) => {
    setUserName(name);
    localStorage.setItem(NAME_KEY, name);

    if (name.trim()) {
      try {
        // Check if session exists
        const { data: existing } = await supabase
          .from("user_sessions")
          .select("id")
          .eq("session_id", sessionId)
          .single();

        if (existing) {
          // Update existing session
          await supabase
            .from("user_sessions")
            .update({ user_name: name })
            .eq("session_id", sessionId);
        } else {
          // Create new session
          await supabase
            .from("user_sessions")
            .insert({ session_id: sessionId, user_name: name });
        }
      } catch (error) {
        console.error("Error saving user session:", error);
      }
    }
  };

  return {
    userName,
    sessionId,
    isLoading,
    updateUserName,
  };
};
