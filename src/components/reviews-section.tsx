import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";

export type Review = {
  id: string;
  full_name: string;
  email: string;
  comment: string;
  rating: number;
  created_at: string;
};

const reviewSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Nome muito curto")
    .max(120, "Nome muito longo"),
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(255, "E-mail muito longo"),
  comment: z
    .string()
    .trim()
    .min(1, "Escreva um comentário")
    .max(1000, "Máximo 1000 caracteres"),
  rating: z.number().int().min(0).max(5),
});

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const visible = user.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(1, user.length - 2))}@${domain}`;
}

function StarRating({
  value,
  onChange,
  size = "md",
  interactive = false,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const sizeClasses = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";
  const display = hover ?? value;

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => interactive && setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= display;
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHover(n)}
            onClick={() => interactive && onChange?.(n)}
            className={cn(
              "transition-transform",
              interactive && "cursor-pointer hover:scale-110",
              !interactive && "cursor-default",
            )}
            aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                sizeClasses,
                filled ? "fill-primary text-primary" : "text-muted-foreground/40",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setReviews(data as unknown as Review[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = reviewSchema.safeParse({
      full_name: fullName,
      email,
      comment,
      rating,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    if (rating === 0) {
      toast.error("Escolha uma nota de 1 a 5 estrelas");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert(parsed.data);
    setSubmitting(false);

    if (error) {
      toast.error("Não foi possível enviar sua avaliação.");
      return;
    }
    toast.success("Avaliação enviada. Obrigado!");
    setFullName("");
    setEmail("");
    setComment("");
    setRating(0);
    load();
  };

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <section
      id="avaliacoes"
      className="border-t border-border bg-background"
    >
      <div className="container mx-auto px-4 py-16">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              Avaliações
            </div>
            <h2 className="text-stencil mt-2 text-3xl font-bold text-foreground md:text-4xl">
              O que nossos clientes dizem
            </h2>
          </div>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 rounded-md border border-border bg-card/60 px-4 py-2">
              <StarRating value={Math.round(avg)} />
              <div className="text-sm">
                <span className="font-bold text-foreground">{avg.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  {" "}
                  / 5 · {reviews.length}{" "}
                  {reviews.length === 1 ? "avaliação" : "avaliações"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* FORM */}
          <form
            onSubmit={submit}
            className="rounded-lg border border-border bg-card p-6 shadow-tactical"
          >
            <h3 className="text-stencil text-xl font-bold text-foreground">
              Deixe sua avaliação
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Conte-nos sua experiência com a Orion Coldres.
            </p>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="rev-name"
                  className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Nome completo
                </label>
                <input
                  id="rev-name"
                  type="text"
                  required
                  maxLength={120}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="rev-email"
                  className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  E-mail
                </label>
                <input
                  id="rev-email"
                  type="email"
                  required
                  maxLength={255}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <span className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Sua nota
                </span>
                <StarRating
                  value={rating}
                  onChange={setRating}
                  interactive
                  size="lg"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="rev-comment"
                  className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Comentário
                </label>
                <textarea
                  id="rev-comment"
                  required
                  rows={4}
                  maxLength={1000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <div className="text-right text-[10px] text-muted-foreground">
                  {comment.length}/1000
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-gradient-primary text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Enviando..." : "Enviar avaliação"}
            </button>
          </form>

          {/* LIST */}
          <div>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-lg border border-border bg-card"
                  />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 px-6 py-16 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
                <h3 className="mt-3 text-base font-bold text-foreground">
                  Nenhuma avaliação ainda
                </h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Seja o primeiro a compartilhar sua experiência.
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-lg border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-foreground">{r.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {maskEmail(r.email)} · {formatDate(r.created_at)}
                        </div>
                      </div>
                      <StarRating value={r.rating} size="sm" />
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/90">
                      {r.comment}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
