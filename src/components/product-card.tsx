import { Plus, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useCart, formatBRL, type Product } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const isAvailable = product.status === "available";

  const handleAdd = () => {
    if (!isAvailable) return;
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all hover:border-primary/40 hover:shadow-tactical">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className={cn(
              "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
              !isAvailable && "grayscale opacity-60",
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">
            Sem imagem
          </div>
        )}

        <div
          className={cn(
            "absolute left-3 top-3 flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm",
            isAvailable
              ? "bg-military/90 text-military-foreground"
              : "bg-destructive/90 text-destructive-foreground",
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {isAvailable ? "Disponível" : "Esgotado"}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1 space-y-1.5">
          <h3 className="text-stencil text-base font-bold text-foreground line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-end justify-between gap-2 pt-2 border-t border-border">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Preço
            </div>
            <div className="text-xl font-bold text-primary">{formatBRL(product.price)}</div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!isAvailable}
            className={cn(
              "flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-bold uppercase tracking-wider transition-all",
              isAvailable
                ? "bg-gradient-primary text-primary-foreground hover:shadow-glow active:scale-95"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            {added ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Adicionado
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Adicionar
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
