import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { 
  Wrench, 
  LayoutDashboard, 
  ListOrdered, 
  History, 
  Bell, 
  LogOut, 
  User, 
  ExternalLink,
  Clock,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { useTurnos } from "@/hooks/useTurnos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export function MecanicoLayout({ 
  children, 
  title, 
  subtitle,
  actions 
}: { 
  children: ReactNode; 
  title?: string; 
  subtitle?: string;
  actions?: ReactNode;
}) {
  const { user, logout } = useAuth();
  const { turnos } = useTurnos();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Sesión cerrada correctamente");
    navigate({ to: "/mecanico/login" });
  };

  // Metrics for badges
  const misTurnosPendientes = turnos.filter(
    (t) => t.mecanicoAsignadoId === user?.id && ["AGENDADO", "EN_ESPERA", "LLAMADO", "EN_ATENCION", "DIAGNOSTICO", "LISTO", "REAGENDADO"].includes(t.estado)
  ).length;

  const colaGeneralPendiente = turnos.filter(
    (t) => !t.mecanicoAsignadoId && ["AGENDADO", "REAGENDADO"].includes(t.estado)
  ).length;

  const navItems = [
    {
      to: "/mecanico/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: "/mecanico/cola",
      label: "Cola de Turnos",
      icon: ListOrdered,
      badge: misTurnosPendientes + colaGeneralPendiente > 0 ? misTurnosPendientes + colaGeneralPendiente : null,
    },
    {
      to: "/mecanico/historial",
      label: "Historial",
      icon: History,
      badge: null,
    },
    {
      to: "/mecanico/notificaciones",
      label: "Centro de Avisos",
      icon: Bell,
      badge: null,
    },
  ];

  const initials = user?.nombre
    ? user.nombre
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "MC";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar Industrial Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Brand + Environment badge */}
            <div className="flex items-center gap-4">
              <Link to="/mecanico/dashboard" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Wrench className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl font-black tracking-tight text-foreground">
                      MEKA<span className="text-primary">TURN</span>
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                      Taller Pro
                    </Badge>
                  </div>
                </div>
              </Link>

              {/* Breadcrumb indicator */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground border-l border-border pl-4">
                <span>Panel de Mecánicos</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-semibold text-foreground">
                  {navItems.find((item) => item.to === location.pathname)?.label || "Módulo"}
                </span>
              </div>
            </div>

            {/* Right: User Profile & Actions */}
            <div className="flex items-center gap-3">
              <Link to="/" target="_blank" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ver Vista Cliente
                </Button>
              </Link>

              <div className="h-6 w-px bg-border hidden sm:block" />

              <div className="flex items-center gap-2.5 bg-muted/40 rounded-full py-1 pl-1.5 pr-3 border border-border/80">
                <Avatar className="h-7 w-7 border border-primary/40 bg-primary/20 text-primary font-bold text-xs">
                  <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold leading-none text-foreground">{user?.nombre || "Mecánico"}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">CI: {user?.cedula}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-xs border-border text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Salir</span>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-border/60 py-1.5 -mb-px">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-secondary text-secondary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-black text-primary-foreground leading-none min-w-[18px] h-[18px]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Page Header (if title passed) */}
      {title && (
        <div className="border-b border-border/50 bg-card/30">
          <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground sm:text-sm mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
