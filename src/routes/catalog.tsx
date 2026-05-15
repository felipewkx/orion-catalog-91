import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { classifyProduct, type Product } from "@/lib/cart-context";
import { useIsAdmin } from "@/lib/use-is-admin";
import { Crosshair, Search } from "lucide-react";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Catálogo — Orion Coldres" },
      { name: "description", content: "Catálogo completo de coldres táticos Orion." },
      { property: "og:title", content: "Catálogo — Orion Coldres" },
      { property: "og:description", content: "Catálogo completo de coldres táticos Orion." },
    ],
  }),
  component: CatalogPage,
});

const PAGE_SIZE = 8;

function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const isAdmin = useIsAdmin();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });
      if (!mounted) return;
      if (!error && data) setProducts(data as unknown as Product[]);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Hide coupon products from regular customers — only admins see them.
    const visibleSet = isAdmin
      ? products
      : products.filter((p) => classifyProduct(p) !== "coupon");
    const base = !q
      ? visibleSet
      : visibleSet.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.description ?? "").toLowerCase().includes(q),
        );
    // Pin informational (Recado) items to the top.
    const informational = base.filter((p) => classifyProduct(p) === "informational");
    const rest = base.filter((p) => classifyProduct(p) !== "informational");
    return [...informational, ...rest];
  }, [products, query, isAdmin]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <section className="container mx-auto flex-1 px-4 py-12">
        <div className="mb-8">
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
            Catálogo
          </div>
          <h1 className="text-stencil mt-2 text-3xl font-bold text-foreground md:text-4xl">
            Modelos disponíveis
          </h1>
        </div>

        <div className="mb-8 flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar por nome ou descrição..."
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <span className="text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-lg border border-border bg-card"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 px-6 py-20 text-center">
            <Crosshair className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-bold text-foreground">
              {query ? "Nenhum produto encontrado" : "Catálogo em preparação"}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {query
                ? "Tente outra palavra-chave."
                : "Em breve novos coldres disponíveis."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow transition-transform hover:scale-105"
                >
                  Carregar mais
                </button>
              </div>
            )}
          </>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
