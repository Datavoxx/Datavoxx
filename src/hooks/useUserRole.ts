import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const ROLE_LEVELS: Record<AppRole, number> = {
  admin: 4,
  gen_3: 3,
  gen_2: 2,
  gen_1: 2,
  intro: 1,
  user: 0,
};

interface UserRoleState {
  role: AppRole | null;
  effectiveRole: AppRole;
  isAdmin: boolean;
  isPro: boolean;
  isBeginner: boolean;
  isIntro: boolean;
  isGuest: boolean;
  isLoading: boolean;
  hasMinRole: (minRole: AppRole) => boolean;
  // Legacy support
  hasAIEmail: boolean;
  // AI Email Summary - only Pro and Admin
  hasAIEmailSummary: boolean;
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

  // Guest mode: user is null (not logged in)
  const isGuest = !user;
  
  // Effective role: defaults to "user" for guests
  const effectiveRole: AppRole = role || "user";

  const hasMinRole = useCallback(
    (minRole: AppRole): boolean => {
      // Guests have "user" role (level 0)
      const currentLevel = role ? ROLE_LEVELS[role] : ROLE_LEVELS["user"];
      return currentLevel >= ROLE_LEVELS[minRole];
    },
    [role]
  );

  return {
    role,
    effectiveRole,
    isAdmin: role === "admin",
    isPro: hasMinRole("gen_3"),
    isBeginner: hasMinRole("gen_2"),
    isIntro: hasMinRole("intro"),
    isGuest,
    isLoading,
    hasMinRole,
    // Legacy support
    hasAIEmail: hasMinRole("gen_2"),
    // AI Email Summary - only Gen 3 and Admin
    hasAIEmailSummary: hasMinRole("gen_3"),
  };
};
