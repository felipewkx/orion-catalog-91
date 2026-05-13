import { Plus, CheckCircle2, Info, Tag } from "lucide-react";
import { useState } from "react";
import {
  useCart,
  formatBRL,
  getProductOptions,
  classifyProduct,
  isPercentValue,
  parseNumericValue,
  parsePercent,
  type Product,
} from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const options = getProductOptions(product);
  const kind = classifyProduct(product);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const isAvailable = product.status === "available";
  const isInformational = kind === "informational";
  const isCoupon = kind === "coupon";
  const canAdd = isAvailable && !isInformational;

  const selected = options[selectedIdx] ?? options[0];
  const selectedIsPercent = selected ? isPercentValue(selected.value) : false;

  const renderValue = (v: string) => {
    if (isPercentValue(v)) return `${parsePercent(v)}% OFF`;
    const n = parseNumericValue(v);
    return n === 0 ? "Gratuito" : formatBRL(n);
  };

  const handleAdd = () => {
    if (!canAdd || !selected) return;
    const result = add({ product, option: selected });
    if (!result.ok) {
      toast.error(result.reason ?? "Não foi possível adicionar.");
      return;
    }
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
            !isAvailable
              ? "bg-destructive/90 text-destructive-foreground"
              : isInformational
                ? "bg-primary/90 text-primary-foreground"
                : isCoupon
                  ? "bg-accent/90 text-accent-foreground"
                  : "bg-military/90 text-military-foreground",
          )}
        >
          {isInformational ? (
            <Info className="h-3 w-3" />
          ) : isCoupon ? (
            <Tag className="h-3 w-3" />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
          )}
          {!isAvailable
            ? "Esgotado"
            : isInformational
              ? "Informativo"
              : isCoupon
                ? "Cupom"
                : "Disponível"}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1 space-y-1.5">
          <h3 className="text-stencil text-base font-bold text-foreground line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        </div>

        {options.length > 1 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {isCoupon ? "Cupom" : "Opção"}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {options.map((o, i) => (
                <button
                  key={`${o.label}-${i}`}
                  type="button"
                  onClick={() => setSelectedIdx(i)}
                  className={cn(
                    "rounded-sm border px-2 py-1 text-[11px] font-semibold transition-colors",
                    i === selectedIdx
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end justify-between gap-2 pt-2 border-t border-border">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {isInformational
                ? "Tipo"
                : selectedIsPercent
                  ? "Desconto"
                  : options.length > 1
                    ? selected?.label ?? "Preço"
                    : "Preço"}
            </div>
            <div className="text-xl font-bold text-primary">
              {selected ? renderValue(selected.value) : "—"}
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className={cn(
              "flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-bold uppercase tracking-wider transition-all",
              canAdd
                ? "bg-gradient-primary text-primary-foreground hover:shadow-glow active:scale-95"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            {isInformational ? (
              <>
                <Info className="h-4 w-4" />
                Informativo
              </>
            ) : added ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Adicionado
              </>
            ) : isCoupon ? (
              <>
                <Tag className="h-4 w-4" />
                Aplicar
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
