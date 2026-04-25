import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/cart-context";
import heroImage from "@/assets/hero-tactical.jpg";
import { Crosshair, Truck, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (!error && data) setProducts(data as unknown as Product[]);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Coldre tático Orion"
            className="h-full w-full object-cover opacity-50"
            width={1920}
            height={1024}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-sm border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              LINHA TÁTICA
            </div>
            <h1 className="text-stencil mt-5 text-5xl font-bold text-foreground md:text-7xl">
              Coldres feitos para
              <span className="block bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                quem opera sério.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Equipamento profissional em Kydex. Conforto, retenção e velocidade de saque para uso
              diário, esportivo e operacional.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#catalogo"
                className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow transition-transform hover:scale-105"
              >
                <Crosshair className="h-4 w-4" />
                Ver catálogo
              </a>
            </div>
          </div>

          {/* Trust bar */}
          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, label: "Qualidade Garantida", desc: "Em todos os modelos" },
              { icon: Truck, label: "Envio para todo Brasil", desc: "via Correios" },
              { icon: Crosshair, label: "Ajuste profissional", desc: "Retenção customizada" },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-md border border-border bg-card/60 p-4 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section id="catalogo" className="container mx-auto flex-1 px-4 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              Catálogo
            </div>
            <h2 className="text-stencil mt-2 text-3xl font-bold text-foreground md:text-4xl">
              Modelos disponíveis
            </h2>
          </div>
          <div className="hidden text-sm text-muted-foreground sm:block">
            {products.length} {products.length === 1 ? "produto" : "produtos"}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-lg border border-border bg-card"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 px-6 py-20 text-center">
            <Crosshair className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-bold text-foreground">Catálogo em preparação</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Em breve novos coldres disponíveis. Acompanhe pelo WhatsApp ou retorne mais tarde.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
