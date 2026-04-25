import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCart, formatBRL } from "@/lib/cart-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  Trash2,
  Minus,
  Plus,
  Copy,
  Check,
  MessageCircle,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const PIX_KEY = "01238721117";
const PIX_NAME = "Matheus Jacob Damas Garlipp";
const WHATSAPP_NUMBER = "556781928456";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Carrinho — Orion Coldres" },
      { name: "description", content: "Finalize seu pedido via Pix e WhatsApp." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, updateQty, remove, total, clear } = useCart();
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      toast.success("Chave Pix copiada!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Não foi possível copiar. Copie manualmente.");
    }
  };

  const buildWhatsAppMessage = () => {
    const lines = [
      `*NOVO PEDIDO — ORION COLDRES*`,
      ``,
      `*Cliente:* ${name || "(não informado)"}`,
      ``,
      `*Itens:*`,
      ...items.map(
        (i) => `• ${i.quantity}x ${i.name} — ${formatBRL(i.price * i.quantity)}`,
      ),
      ``,
      `*Total: ${formatBRL(total)}*`,
      ``,
      `Olá, acabei de fazer este pedido no site e vou enviar o comprovativo do Pix abaixo.`,
    ];
    return lines.join("\n");
  };

  const handleWhatsApp = () => {
    if (items.length === 0) {
      toast.error("Seu carrinho está vazio.");
      return;
    }
    if (!name.trim()) {
      toast.error("Informe seu nome antes de finalizar.");
      return;
    }
    const msg = encodeURIComponent(buildWhatsAppMessage());
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank", "noopener");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="container mx-auto flex-1 px-4 py-10 md:py-14">
        <div className="mb-8">
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
            Checkout
          </div>
          <h1 className="text-stencil mt-2 text-3xl font-bold text-foreground md:text-4xl">
            Carrinho de compras
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 px-6 py-20 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-bold text-foreground">Seu carrinho está vazio</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Adicione coldres ao carrinho para finalizar a compra.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center rounded-md bg-gradient-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Items */}
            <section className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-lg border border-border bg-card p-3 sm:p-4"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-24">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-stencil font-bold text-foreground">{item.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(item.id)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-md border border-border bg-secondary">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label="Diminuir"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label="Aumentar"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="font-bold text-primary">
                        {formatBRL(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={clear}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Esvaziar carrinho
              </button>
            </section>

            {/* Summary + Pix + WhatsApp */}
            <aside className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-stencil text-lg font-bold text-foreground">Resumo</h2>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} itens)</span>
                    <span>{formatBRL(total)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 text-base">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">{formatBRL(total)}</span>
                  </div>
                </div>
              </div>

              {/* Customer name */}
              <div className="rounded-lg border border-border bg-card p-5">
                <label
                  htmlFor="customer-name"
                  className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Seu nome
                </label>
                <input
                  id="customer-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  placeholder="Como podemos te chamar?"
                  className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
              </div>

              {/* Pix */}
              <div className="rounded-lg border border-primary/30 bg-card p-5 shadow-tactical">
                <div className="flex items-center gap-2">
                  <span className="rounded-sm bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Pagamento Pix
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Beneficiário
                  </div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{PIX_NAME}</div>
                </div>
                <div className="mt-4">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Chave Pix
                  </div>
                  <div className="mt-2 flex items-stretch gap-2">
                    <code className="flex-1 truncate rounded-md border border-border bg-background px-3 py-2.5 font-mono text-sm text-foreground">
                      {PIX_KEY}
                    </code>
                    <button
                      onClick={copyPix}
                      className="flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-transform active:scale-95"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="flex gap-3 rounded-lg border border-primary/40 bg-primary/10 p-4">
                <AlertTriangle className="h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-foreground">
                  <strong className="text-primary">Importante:</strong> Clique no botão abaixo
                  para enviar o seu pedido completo para a Orion Coldres e anexe o comprovativo
                  do Pix na conversa para oficializar a sua compra.
                </p>
              </div>

              {/* WhatsApp button */}
              <button
                onClick={handleWhatsApp}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-md bg-[#25D366] text-base font-bold uppercase tracking-wider text-white shadow-tactical transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <MessageCircle className="h-6 w-6" />
                Finalizar via WhatsApp
              </button>
            </aside>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
