ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS price_options jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.products.price_options IS 'Array de variações de preço: [{label: string, value: string}]. value pode ser numérico (ex: "120.00") ou percentual de cupom (ex: "15%").';