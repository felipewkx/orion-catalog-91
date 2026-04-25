import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { CartProvider } from "@/lib/cart-context";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-stencil text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-gradient-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow transition-transform hover:scale-105"
          >
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Orion Coldres" },
      {
        name: "description",
        content:
          "Coldres táticos profissionais. Catálogo Orion Coldres com pagamento via Pix e atendimento direto pelo WhatsApp.",
      },
      { name: "author", content: "Orion Coldres" },
      { property: "og:title", content: "Orion Coldres" },
      {
        property: "og:description",
        content: "Coldres táticos profissionais com pagamento Pix e WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Orion Coldres" },
      { name: "description", content: "Coldres em Kydex" },
      { property: "og:description", content: "Coldres em Kydex" },
      { name: "twitter:description", content: "Coldres em Kydex" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/EUMRf5dFHjdZ1TUX3aEQwMuwkMR2/social-images/social-1777145239701-659001027_18160285210442682_7558401868116327951_n.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/EUMRf5dFHjdZ1TUX3aEQwMuwkMR2/social-images/social-1777145239701-659001027_18160285210442682_7558401868116327951_n.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <CartProvider>
      <Outlet />
      <Toaster />
    </CartProvider>
  );
}
