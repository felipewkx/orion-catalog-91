
CREATE TABLE public.site_settings (
  id text PRIMARY KEY DEFAULT 'singleton',
  freight_mode text NOT NULL DEFAULT 'a_combinar',
  freight_value numeric NOT NULL DEFAULT 0,
  cash_discount_percent numeric NOT NULL DEFAULT 10,
  stack_coupon_cash boolean NOT NULL DEFAULT false,
  stack_coupons boolean NOT NULL DEFAULT false,
  pix_name text NOT NULL DEFAULT 'Matheus Jacob Damas Garlipp',
  pix_key text NOT NULL DEFAULT '01238721117',
  instagram_url text NOT NULL DEFAULT 'https://www.instagram.com/orioncoldres/',
  whatsapp_number text NOT NULL DEFAULT '5567981928456',
  email text NOT NULL DEFAULT 'garlipp15@gmail.com',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 'singleton'),
  CONSTRAINT site_settings_freight_mode CHECK (freight_mode IN ('a_combinar','fixed')),
  CONSTRAINT site_settings_cash_pct CHECK (cash_discount_percent >= 0 AND cash_discount_percent <= 100),
  CONSTRAINT site_settings_freight_value CHECK (freight_value >= 0)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER site_settings_set_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (id) VALUES ('singleton')
  ON CONFLICT (id) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
