import { useState } from "react";
import { Plus, CheckCircle2, Info, Tag, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

type Props = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProductModal({ product, open, onOpenChange }: Props) {
  const { add } = useCart();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [added, setAdded] = useState(false);

  if (!product) return null;
  const options = getProductOptions(product);
  const kind = classifyProduct(product);
  const isAvailable = product.status === "available";
  const isInformational = kind === "informational";
  const isCoupon = kind === "coupon";
  const canAdd = isAvailable && !isInformational;

  const selected = options[selectedIdx] ?? options[0];
  const selectedIsPercent = selected ? isPercentValue(selected.value) : false;

  const renderValue = (v: string) => {
    if (isPercentValue(v)) return `${parsePercent(v)}% OFF`;
    const n = parseNumericValue(v);
    return n === 0 ? "Recado" : formatBRL(n);
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
    toast.success("Adicionado ao carrinho.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[95vw] max-w-3xl overflow-y-auto p-0 sm:w-full">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">{product.description}</DialogDescription>
        <div className="grid gap-0 md:grid-cols-2">
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className={cn(
                  "h-full w-full object-cover",
                  !isAvailable && "grayscale opacity-60",
                )}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-muted-foreground">
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
                  ? "Info"
                  : isCoupon
                    ? "Cupom"
                    : "Disponível"}
            </div>
          </div>

          <div className="flex flex-col gap-4 p-6">
            <div>
              <h2 className="text-stencil text-2xl font-bold text-foreground">
                {product.name}
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                {product.description || "Sem descrição."}
              </p>
            </div>

            {options.length > 1 && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {isCoupon ? "Cupom" : "Opções"}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {options.map((o, i) => (
                    <button
                      key={`${o.label}-${i}`}
                      type="button"
                      onClick={() => setSelectedIdx(i)}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
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

            <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
              {isInformational ? (
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
                  Tipo: Recado
                </span>
              ) : (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {selectedIsPercent
                      ? "Desconto"
                      : options.length > 1
                        ? selected?.label ?? "Preço"
                        : "Preço"}
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {selected ? renderValue(selected.value) : "—"}
                  </div>
                </div>
              )}

              <button
                onClick={handleAdd}
                disabled={!canAdd}
                className={cn(
                  "flex h-12 items-center justify-center gap-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all",
                  canAdd
                    ? "bg-gradient-primary text-primary-foreground hover:shadow-glow active:scale-95"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
              >
                {isInformational ? (
                  <>
                    <Info className="h-4 w-4" />
                    Apenas informativo
                  </>
                ) : added ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Adicionado
                  </>
                ) : isCoupon ? (
                  <>
                    <Tag className="h-4 w-4" />
                    Aplicar cupom
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Adicionar ao carrinho
                  </>
                )}
              </button>

              <button
                onClick={() => onOpenChange(false)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-secondary text-xs font-medium uppercase tracking-wider text-secondary-foreground hover:bg-accent"
              >
                <X className="h-4 w-4" />
                Fechar
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
