import { Link, useLocation } from "@tanstack/react-router";
import { Wrench, Clock, ShieldCheck, UserCheck, Search, PlusCircle, LogIn, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { useTurnos } from "@/hooks/useTurnos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const { turnos } = useTurnos();
  const location = useLocation();

  const activeTurnosCount = turnos.filter(
    (t) => !["FINALIZADO", "CANCELADO", "NO_ASISTIO"].includes(t.estado)
  ).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Wrench className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-black tracking-tight text-foreground">
                MEKA<span className="text-primary">TURN</span>
              </span>
              <Badge variant="outline" className="hidden border-primary/40 bg-primary/10 text-[10px] font-semibold text-primary sm:inline-flex">
                HOY
              </Badge>
            </div>
            <p className="hidden text-[11px] font-medium text-muted-foreground sm:block">
              Gestión de Turnos para Taller Mecánico
            </p>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/"
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              location.pathname === "/"
                ? "bg-secondary text-secondary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Inicio
          </Link>
          <Link
            to="/solicitar-turno"
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              location.pathname === "/solicitar-turno"
                ? "bg-secondary text-secondary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            Solicitar Turno
          </Link>
          <Link
            to="/consultar-turno"
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              location.pathname === "/consultar-turno"
                ? "bg-secondary text-secondary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Search className="h-4 w-4" />
            Consultar Turno
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground lg:flex">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Turnos en curso hoy:</span>
            <strong className="text-foreground">{activeTurnosCount}</strong>
          </div>

          {isAuthenticated && user ? (
            <Link to="/mecanico/dashboard">
              <Button size="sm" className="gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <LayoutDashboard className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Portal:</span> {user.nombre.split(" ")[0]}
              </Button>
            </Link>
          ) : (
            <Link to="/mecanico/login">
              <Button size="sm" variant="outline" className="gap-1.5 border-border hover:bg-muted">
                <LogIn className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Ingreso de</span> Mecánico
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
