import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/cart-context";
import { formatBRL } from "@/lib/cart-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Mail, Lock, Plus, Pencil, Trash2, Upload, X, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Orion Coldres" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type AuthState =
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "not_admin"; email: string }
  | { status: "admin"; email: string };

function AdminPage() {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  const evaluateSession = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) {
      setAuth({ status: "signed_out" });
      return;
    }
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (roleRow) {
      setAuth({ status: "admin", email: session.user.email ?? "" });
    } else {
      setAuth({ status: "not_admin", email: session.user.email ?? "" });
    }
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      evaluateSession();
    });
    evaluateSession();
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuth({ status: "signed_out" });
  };

  if (auth.status === "loading") return null;
  if (auth.status === "admin")
    return <Dashboard email={auth.email} onLogout={handleLogout} />;
  if (auth.status === "not_admin")
    return <NotAdminGate email={auth.email} onLogout={handleLogout} />;
  return <LoginGate />;
}

function LoginGate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError("Credenciais inválidas.");
      setPassword("");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
        <form
          onSubmit={submit}
          className="w-full max-w-sm rounded-lg border border-border bg-card p-7 shadow-tactical"
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-primary shadow-glow">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-stencil mt-4 text-2xl font-bold text-foreground">
              Painel Restrito
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Acesse com suas credenciais de administrador.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="pwd"
                className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="pwd"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 h-11 w-full rounded-md bg-gradient-primary text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>

          <Link
            to="/"
            className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground"
          >
            ← Voltar ao site
          </Link>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}

function NotAdminGate({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-7 text-center shadow-tactical">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-destructive/20">
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-stencil mt-4 text-2xl font-bold text-foreground">
            Acesso negado
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A conta <span className="font-semibold text-foreground">{email}</span> não tem
            permissão de administrador.
          </p>
          <button
            onClick={onLogout}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-secondary text-sm font-medium text-secondary-foreground hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
          <Link
            to="/"
            className="mt-3 block text-xs text-muted-foreground hover:text-foreground"
          >
            ← Voltar ao site
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

type Editing = Partial<Product> & { id?: string };

function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Editing | null>(null);

  const reload = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data as unknown as Product[]);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  const handleLogout = () => {
    onLogout();
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Remover "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) {
      toast.error("Erro ao remover.");
      return;
    }
    toast.success("Produto removido.");
    reload();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="container mx-auto flex-1 px-4 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              Painel administrativo
            </div>
            <h1 className="text-stencil mt-2 text-3xl font-bold text-foreground md:text-4xl">
              Gerenciar produtos
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing({})}
              className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow"
            >
              <Plus className="h-4 w-4" />
              Novo produto
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Carregando...</div>
        ) : products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/40 px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum produto cadastrado. Clique em "Novo produto" para começar.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/50 text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Imagem</th>
                  <th className="px-4 py-3">Nome</th>
                  <th className="hidden px-4 py-3 md:table-cell">Preço</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {p.description}
                      </div>
                      <div className="mt-1 text-xs font-bold text-primary md:hidden">
                        {formatBRL(p.price)}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 font-bold text-primary md:table-cell">
                      {formatBRL(p.price)}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span
                        className={cn(
                          "rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                          p.status === "available"
                            ? "bg-military/20 text-military"
                            : "bg-destructive/20 text-destructive",
                        )}
                      >
                        {p.status === "available" ? "Disponível" : "Esgotado"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditing(p)}
                          className="rounded-md border border-border p-2 text-muted-foreground hover:border-primary hover:text-primary"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="rounded-md border border-border p-2 text-muted-foreground hover:border-destructive hover:text-destructive"
                          aria-label="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {editing && (
        <ProductEditor
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}

      <SiteFooter />
    </div>
  );
}

function ProductEditor({
  initial,
  onClose,
  onSaved,
}: {
  initial: Editing;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(initial.id);
  const [name, setName] = useState(initial.name ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [price, setPrice] = useState<string>(
    initial.price !== undefined ? String(initial.price) : "",
  );
  const [status, setStatus] = useState<"available" | "sold_out">(
    initial.status ?? "available",
  );
  const [imageUrl, setImageUrl] = useState<string | null>(initial.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const onFile = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem maior que 5MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      setImageUrl(pub.publicUrl);
      toast.success("Imagem enviada.");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o nome.");
      return;
    }
    const priceNum = parseFloat(price.replace(",", "."));
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Preço inválido.");
      return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      image_url: imageUrl,
      status,
    };

    let error;
    if (isEdit && initial.id) {
      ({ error } = await supabase.from("products").update(payload).eq("id", initial.id));
    } else {
      ({ error } = await supabase.from("products").insert(payload));
    }
    setSaving(false);

    if (error) {
      toast.error("Erro ao salvar.");
      return;
    }
    toast.success(isEdit ? "Produto atualizado." : "Produto criado.");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-border bg-card shadow-tactical sm:rounded-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="text-stencil text-lg font-bold text-foreground">
            {isEdit ? "Editar produto" : "Novo produto"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5">
          {/* Image */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Imagem
            </label>
            <div className="mt-2">
              {imageUrl ? (
                <div className="relative h-48 overflow-hidden rounded-md border border-border bg-muted">
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="absolute right-2 top-2 rounded-md bg-background/80 p-1.5 text-foreground backdrop-blur hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-secondary/30 transition-colors hover:border-primary/50 hover:bg-secondary/60">
                  {uploading ? (
                    <span className="text-sm text-muted-foreground">Enviando...</span>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="mt-2 text-sm font-medium text-foreground">
                        Enviar imagem
                      </span>
                      <span className="text-xs text-muted-foreground">PNG, JPG até 5MB</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onFile(f);
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <Field label="Nome">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              required
            />
          </Field>

          <Field label="Descrição">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Preço (R$)">
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="decimal"
                placeholder="0,00"
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                required
              />
            </Field>
            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "available" | "sold_out")}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="available">Disponível</option>
                <option value="sold_out">Esgotado</option>
              </select>
            </Field>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-md border border-border bg-secondary text-sm font-medium text-secondary-foreground hover:bg-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 h-11 rounded-md bg-gradient-primary text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow disabled:opacity-50"
            >
              {saving ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
