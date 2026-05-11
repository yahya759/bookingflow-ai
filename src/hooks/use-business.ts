import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  welcome_message: string | null;
  confirmation_message: string | null;
  allow_staff_selection: boolean;
  instant_confirmation: boolean;
}

export function useBusiness() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) { setBusiness(null); setLoading(false); return; }
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    setBusiness(data as Business | null);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [user?.id]);

  return { business, loading, refresh, setBusiness };
}
