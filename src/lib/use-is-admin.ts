import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight client-side check to know if the current visitor is an
 * authenticated admin. Used to conditionally reveal admin-only items
 * (e.g. "Cupom" products) in public pages.
 */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    const evaluate = async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) {
        if (mounted) setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle();
      if (mounted) setIsAdmin(Boolean(data));
    };
    evaluate();
    const { data: sub } = supabase.auth.onAuthStateChange(() => evaluate());
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return isAdmin;
}
