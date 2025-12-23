import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const ROLE_LEVELS: Record<AppRole, number> = {
  admin: 4,
  pro: 3,
  beginner: 2,
  intro: 1,
  user: 0,
  ai_email: 2, // Legacy, same as beginner
};

interface UserRoleState {
  role: AppRole | null;
  isAdmin: boolean;
  isPro: boolean;
  isBeginner: boolean;
  isIntro: boolean;
  isLoading: boolean;
  hasMinRole: (minRole: AppRole) => boolean;
  // Legacy support
  hasAIEmail: boolean;
}

export const useUserRole = (): UserRoleState => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        } else {
          setRole(data?.role || null);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id]);

  const hasMinRole = useCallback(
    (minRole: AppRole): boolean => {
      if (!role) return false;
      return ROLE_LEVELS[role] >= ROLE_LEVELS[minRole];
    },
    [role]
  );

  return {
    role,
    isAdmin: role === "admin",
    isPro: hasMinRole("pro"),
    isBeginner: hasMinRole("beginner"),
    isIntro: hasMinRole("intro"),
    isLoading,
    hasMinRole,
    // Legacy support
    hasAIEmail: hasMinRole("beginner"),
  };
};
