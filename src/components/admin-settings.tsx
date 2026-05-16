import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/use-site-settings";

export function AdminSettings() {
  const [s, setS] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "singleton")
        .maybeSingle();
      if (data) {
        setS({
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
      }
      setLoading(false);
    })();
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    // Validation
    if (s.cash_discount_percent < 1 || s.cash_discount_percent > 100) {
      toast.error("Desconto à vista deve estar entre 1% e 100%.");
      return;
    }
    if (s.freight_mode === "fixed" && s.freight_value < 0) {
      toast.error("Valor do frete inválido.");
      return;
    }
    if (!/^https?:\/\/.+/i.test(s.instagram_url)) {
      toast.error("URL do Instagram inválida.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.email)) {
      toast.error("E-mail inválido.");
      return;
    }
    const cleanedWa = s.whatsapp_number.replace(/\D/g, "");
    if (cleanedWa.length < 10 || cleanedWa.length > 13) {
      toast.error("Número de WhatsApp inválido.");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        freight_mode: s.freight_mode,
        freight_value: s.freight_value,
        cash_discount_percent: s.cash_discount_percent,
        stack_coupon_cash: s.stack_coupon_cash,
        stack_coupons: s.stack_coupons,
        pix_name: s.pix_name.trim(),
        pix_key: s.pix_key.trim(),
        instagram_url: s.instagram_url.trim(),
        whatsapp_number: s.whatsapp_number.trim(),
        email: s.email.trim(),
      })
      .eq("id", "singleton");
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar configurações.");
      return;
    }
    toast.success("Configurações salvas.");
  };

  if (loading) return <div className="text-sm text-muted-foreground">Carregando configurações...</div>;

  const inputCls =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none";
  const labelCls = "text-[11px] font-bold uppercase tracking-widest text-muted-foreground";

  return (
    <section className="mt-14">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
            Configurações da loja
          </div>
          <h2 className="text-stencil mt-2 text-2xl font-bold text-foreground md:text-3xl">
            <SettingsIcon className="mr-2 inline h-6 w-6" />
            Ajustes gerais
          </h2>
        </div>
      </div>

      <form onSubmit={save} className="space-y-8 rounded-lg border border-border bg-card p-6">
        {/* FREIGHT */}
        <div>
          <h3 className="text-stencil text-lg font-bold text-foreground">Frete</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className={labelCls}>Modo do frete</span>
              <select
                value={s.freight_mode}
                onChange={(e) =>
                  setS({ ...s, freight_mode: e.target.value as SiteSettings["freight_mode"] })
                }
                className={inputCls}
              >
                <option value="a_combinar">a Combinar (padrão)</option>
                <option value="fixed">Valor fixo (R$)</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className={labelCls}>Valor do frete (R$)</span>
              <input
                type="number"
                step="0.01"
                min={0}
                value={s.freight_value}
                onChange={(e) => setS({ ...s, freight_value: parseFloat(e.target.value || "0") })}
                disabled={s.freight_mode !== "fixed"}
                className={inputCls + " disabled:opacity-50"}
              />
            </label>
          </div>
        </div>

        {/* CASH DISCOUNT */}
        <div>
          <h3 className="text-stencil text-lg font-bold text-foreground">Desconto "Pagarei à vista"</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className={labelCls}>Percentual (%)</span>
              <input
                type="number"
                min={1}
                max={100}
                step={1}
                value={s.cash_discount_percent}
                onChange={(e) =>
                  setS({ ...s, cash_discount_percent: parseFloat(e.target.value || "0") })
                }
                className={inputCls}
              />
            </label>
          </div>
        </div>

        {/* STACKING */}
        <div className="space-y-4">
          <h3 className="text-stencil text-lg font-bold text-foreground">Regras de acumulação</h3>

          <label className="flex items-start gap-3 rounded-md border border-border bg-secondary/40 p-3">
            <input
              type="checkbox"
              checked={s.stack_coupon_cash}
              onChange={(e) => setS({ ...s, stack_coupon_cash: e.target.checked })}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <div>
              <div className="text-sm font-bold text-foreground">
                À Vista + Cupom = Cumulativos: {s.stack_coupon_cash ? "Ativado" : "Desativado"}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Quando desativado, o cliente escolhe entre Cupom OU Desconto à vista, e vê a seguinte mensagem:
              </p>
              {!s.stack_coupon_cash && (
                <p className="mt-2 text-xs text-primary">
                  Atenção: escolha entre Usar Cupom ou usar Desconto à vista.
                </p>
              )}
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-md border border-border bg-secondary/40 p-3">
            <input
              type="checkbox"
              checked={s.stack_coupons}
              onChange={(e) => setS({ ...s, stack_coupons: e.target.checked })}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <div>
              <div className="text-sm font-bold text-foreground">
                Cupons Cumulativos: {s.stack_coupons ? "Ativado" : "Desativado"}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Quando desativado, apenas 1 cupom por pedido.
              </p>
            </div>
          </label>
        </div>

        {/* PIX */}
        <div>
          <h3 className="text-stencil text-lg font-bold text-foreground">Pix</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className={labelCls}>Beneficiário</span>
              <input
                type="text"
                value={s.pix_name}
                onChange={(e) => setS({ ...s, pix_name: e.target.value })}
                maxLength={120}
                className={inputCls}
              />
            </label>
            <label className="space-y-2">
              <span className={labelCls}>Chave Pix</span>
              <input
                type="text"
                value={s.pix_key}
                onChange={(e) => setS({ ...s, pix_key: e.target.value })}
                maxLength={120}
                className={inputCls}
              />
            </label>
          </div>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-stencil text-lg font-bold text-foreground">Fale com a gente</h3>
          <div className="mt-3 grid gap-4">
            <label className="space-y-2">
              <span className={labelCls}>Instagram (URL)</span>
              <input
                type="url"
                value={s.instagram_url}
                onChange={(e) => setS({ ...s, instagram_url: e.target.value })}
                placeholder="https://www.instagram.com/usuario/"
                className={inputCls}
              />
            </label>
            <label className="space-y-2">
              <span className={labelCls}>WhatsApp (com DDI, ex: 5567981928456)</span>
              <input
                type="tel"
                value={s.whatsapp_number}
                onChange={(e) => setS({ ...s, whatsapp_number: e.target.value })}
                placeholder="55XXXXXXXXXXX"
                className={inputCls}
              />
            </label>
            <label className="space-y-2">
              <span className={labelCls}>E-mail</span>
              <input
                type="email"
                value={s.email}
                onChange={(e) => setS({ ...s, email: e.target.value })}
                className={inputCls}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-gradient-primary px-5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar configurações"}
          </button>
        </div>
      </form>
    </section>
  );
}
