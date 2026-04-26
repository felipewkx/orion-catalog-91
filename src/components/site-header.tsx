import { Link } from "@tanstack/react-router";
import { ShoppingCart, Shield } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function SiteHeader() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md bg-[#02084b]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-primary shadow-glow transition-transform group-hover:scale-105 bg-[#d2e01a] text-black">
            <Shield className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-stencil text-lg font-bold text-foreground">Orion</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Coldres
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: true }}
          >
            Catálogo
          </Link>
          <Link
            to="/checkout"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Carrinho
          </Link>
        </nav>

        <Link
          to="/checkout"
          className="relative flex h-10 items-center gap-2 rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-all hover:bg-accent hover:shadow-tactical"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Carrinho</span>
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground shadow-glow">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
