import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  freight_mode: "a_combinar" | "fixed";
  freight_value: number;
  cash_discount_percent: number;
  stack_coupon_cash: boolean;
  stack_coupons: boolean;
  pix_name: string;
  pix_key: string;
  instagram_url: string;
  whatsapp_number: string;
  email: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  freight_mode: "a_combinar",
  freight_value: 0,
  cash_discount_percent: 10,
  stack_coupon_cash: false,
  stack_coupons: false,
  pix_name: "Matheus Jacob Damas Garlipp",
  pix_key: "01238721117",
  instagram_url: "https://www.instagram.com/orioncoldres/",
  whatsapp_number: "5567981928456",
  email: "garlipp15@gmail.com",
};

/**
 * Subscribe to the singleton site_settings row. Returns the latest settings,
 * falling back to safe defaults until the first fetch resolves.
 */
export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "singleton")
        .maybeSingle();
      if (!mounted || !data) return;
      setSettings({
        freight_mode: (data.freight_mode as SiteSettings["freight_mode"]) ?? "a_combinar",
        freight_value: Number(data.freight_value ?? 0),
        cash_discount_percent: Number(data.cash_discount_percent ?? 10),
        stack_coupon_cash: Boolean(data.stack_coupon_cash),
        stack_coupons: Boolean(data.stack_coupons),
        pix_name: data.pix_name ?? DEFAULT_SETTINGS.pix_name,
        pix_key: data.pix_key ?? DEFAULT_SETTINGS.pix_key,
        instagram_url: data.instagram_url ?? DEFAULT_SETTINGS.instagram_url,
        whatsapp_number: data.whatsapp_number ?? DEFAULT_SETTINGS.whatsapp_number,
        email: data.email ?? DEFAULT_SETTINGS.email,
      });
    };
    load();

    const channel = supabase
      .channel("site_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        () => load(),
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return settings;
}
