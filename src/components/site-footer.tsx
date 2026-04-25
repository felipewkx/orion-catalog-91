import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-card/40">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Orion Coldres — Equipamento tático profissional.
          </span>
        </div>
        <Link
          to="/admin"
          className="text-xs uppercase tracking-wider text-muted-foreground/60 transition-colors hover:text-primary"
        >
          Admin
        </Link>
      </div>
    </footer>
  );
}
