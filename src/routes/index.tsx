import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { ReviewsSection } from "@/components/reviews-section";
import type { Product } from "@/lib/cart-context";
import heroImage from "@/assets/hero-tactical.jpg";
import { Crosshair, Truck, ShieldCheck, Search, Instagram, Mail, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const INSTAGRAM_URL = "https://www.instagram.com/orioncoldres/";
const WHATSAPP_URL = "https://wa.me/5567981928456";
const EMAIL_URL = "mailto:garlipp15@gmail.com";

function Index() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });
      if (!mounted) return;
      if (!error && data) setProducts(data as unknown as Product[]);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [products, query]);

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
            <h1 className="text-stencil mt-5 text-5xl font-bold text-primary md:text-7xl">
              FEITO À MÃO
              <span className="block bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                POR QUEM ENTENDE.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Equipamento profissional em Kydex. Conforto, retenção e velocidade de saque para uso
              diário, esportivo e operacional.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow transition-transform hover:scale-105"
              >
                <Crosshair className="h-4 w-4" />
                Ver catálogo
              </Link>
            </div>

            {/* Search */}
            <div className="mt-8 max-w-xl">
              <div className="flex items-center gap-2 rounded-md border border-border bg-card/80 px-3 py-2 backdrop-blur-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pesquisar produtos..."
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              {query.trim() && (
                <div className="mt-3 rounded-md border border-border bg-card/90 p-3 backdrop-blur-sm">
                  {results.length === 0 ? (
                    <div className="px-2 py-3 text-sm text-muted-foreground">
                      Nenhum produto encontrado.
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {results.map((p) => (
                        <li key={p.id}>
                          <Link
                            to="/catalog"
                            className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent/50"
                          >
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-muted" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-bold text-foreground">
                                {p.name}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {p.description}
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
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

      {/* CONTACT / SOCIAL */}
      <section id="contato" className="container mx-auto px-4 py-16">
        <div className="mb-8 text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
            Fale com a gente
          </div>
          <h2 className="text-stencil mt-2 text-3xl font-bold text-foreground md:text-4xl">
            CLIQUE PARA CONTATO DIRETO
          </h2>
        </div>
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-tactical"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/15 text-primary transition-transform group-hover:scale-110">
              <Instagram className="h-6 w-6" />
            </div>
            <div className="text-sm font-bold text-foreground">Instagram</div>
            <div className="text-xs text-muted-foreground">@orioncoldres</div>
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-tactical"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/15 text-primary transition-transform group-hover:scale-110">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div className="text-sm font-bold text-foreground">WhatsApp</div>
            <div className="text-xs text-muted-foreground">+55 67 98192-8456</div>
          </a>
          <a
            href={EMAIL_URL}
            className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-tactical"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/15 text-primary transition-transform group-hover:scale-110">
              <Mail className="h-6 w-6" />
            </div>
            <div className="text-sm font-bold text-foreground">E-mail</div>
            <div className="text-xs text-muted-foreground">garlipp15@gmail.com</div>
          </a>
        </div>
      </section>

      <ReviewsSection />

      <SiteFooter />
    </div>
  );
}
