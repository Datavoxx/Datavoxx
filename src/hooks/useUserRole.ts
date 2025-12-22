import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UserRoleState {
  hasAIEmail: boolean;
  isLoading: boolean;
}

export const useUserRole = (): UserRoleState => {
  const { user } = useAuth();
  const [hasAIEmail, setHasAIEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setHasAIEmail(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching user roles:", error);
          setHasAIEmail(false);
        } else {
          // Check if user has ai_email role
          const roles = data?.map((r) => r.role) || [];
          setHasAIEmail(roles.includes("ai_email"));
        }
      } catch (error) {
        console.error("Error fetching user roles:", error);
        setHasAIEmail(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, [user?.id]);

  return { hasAIEmail, isLoading };
};
