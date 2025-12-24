import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CreditStatus {
  allowed: boolean;
  remaining: number;
  limit: number;
  tier: string;
  resetAt?: string;
}

interface UseCreditsReturn {
  remaining: number;
  limit: number;
  tier: string;
  canUse: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getSessionId: () => string;
}

// Generate or retrieve a persistent session ID for anonymous users
const getOrCreateSessionId = (): string => {
  const storageKey = "bilgen_session_id";
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
};

export const useCredits = (): UseCreditsReturn => {
  const { user, session } = useAuth();
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = getOrCreateSessionId();

  const fetchCredits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add authorization header if user is logged in
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-and-use-credit`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ consume: false, sessionId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch credits");
      }

      setCreditStatus(data);
    } catch (err) {
      console.error("Error fetching credits:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      // Set default values on error
      setCreditStatus({
        allowed: true,
        remaining: 5,
        limit: 5,
        tier: "anonymous",
      });
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, sessionId]);

  // Fetch credits on mount and when user changes
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits, user?.id]);

  // Refresh credits periodically (every 60 seconds)
  useEffect(() => {
    const interval = setInterval(fetchCredits, 60000);
    return () => clearInterval(interval);
  }, [fetchCredits]);

  return {
    remaining: creditStatus?.remaining ?? 0,
    limit: creditStatus?.limit ?? 5,
    tier: creditStatus?.tier ?? "anonymous",
    canUse: creditStatus?.allowed ?? false,
    isLoading,
    error,
    refresh: fetchCredits,
    getSessionId: () => sessionId,
  };
};
