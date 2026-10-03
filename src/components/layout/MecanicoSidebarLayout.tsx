import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { 
  Wrench, 
  LayoutDashboard, 
  ListOrdered, 
  LogOut, 
  Menu,
  X,
  Clock,
  User,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { useTurnos } from "@/hooks/useTurnos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface MecanicoSidebarLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function MecanicoSidebarLayout({
  children,
  title,
  subtitle,
  actions,
}: MecanicoSidebarLayoutProps) {
  const { user, logout } = useAuth();
  const { turnos } = useTurnos();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      toast.success("Sesión cerrada correctamente", {
        description: "Has salido del sistema con éxito.",
      });
      await navigate({ to: "/", replace: true });
      await logout();
    } catch {
      await logout();
      window.location.href = "/";
    }
  };

  const turnosPendientesCount = turnos.filter(
    (t) => (t.mecanicoAsignadoId === user?.id || !t.mecanicoAsignadoId) &&
      ["AGENDADO", "EN_ESPERA", "LLAMADO", "REAGENDADO"].includes(t.estado)
  ).length;

  const navItems = [
    {
      to: "/mecanico/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: "/mecanico/turnos",
      label: "Turnos",
      icon: ListOrdered,
      badge: turnosPendientesCount > 0 ? turnosPendientesCount : null,
    },
  ];

  const initials = user?.nombre
    ? user.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "MC";

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Top Navbar (only on small screens for toggle) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <Link to="/mecanico/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            <Wrench className="h-4 w-4" />
          </div>
          <span className="font-display font-black text-lg text-foreground">
            MEKA<span className="text-primary">TURN</span>
          </span>
        </Link>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="h-9 w-9"
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 flex-col justify-between border-r border-border bg-card p-5 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0 flex" : "-translate-x-full md:flex hidden"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <Link
            to="/mecanico/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Wrench className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-black tracking-tight text-foreground">
                  MEKA<span className="text-primary">TURN</span>
                </span>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold uppercase">
                  Taller
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                Portal de Mecánicos
              </p>
            </div>
          </Link>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
            <Avatar className="h-9 w-9 border border-primary/40 bg-primary/20 text-primary font-bold text-xs">
              <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">{user?.nombre || "Mecánico"}</p>
              <p className="text-[10px] text-muted-foreground font-mono">CI: {user?.cedula}</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5 pt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2">
              Menú Principal
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-secondary text-secondary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className="rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-black text-primary-foreground leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Logout */}
        <div className="pt-4 border-t border-border/80">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive font-bold h-10 rounded-xl"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {title && (
          <header className="border-b border-border bg-card/40 px-5 py-4 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground sm:text-sm mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </header>
        )}

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
