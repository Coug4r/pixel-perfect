import { Link } from "@tanstack/react-router";
import { Wrench, Clock, ShieldCheck, MapPin, Phone, Car } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-card/60 text-muted-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Wrench className="h-4 w-4 stroke-[2.5]" />
              </div>
              <span className="font-display text-xl font-black tracking-tight text-foreground">
                MEKA<span className="text-primary">TURN</span>
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Sistema de gestión de turnos para taller mecánico automotriz en tiempo real. 
              Asignación por orden de llegada, seguimiento en vivo, diagnósticos claros y notificaciones directas.
            </p>
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-background/50 px-2.5 py-1 text-xs text-foreground/80">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Prototipo funcional frontend — React + Vite + TypeScript + Tailwind</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Atención al Cliente</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/solicitar-turno" className="hover:text-primary transition-colors">
                  Solicitar Turno Hoy
                </Link>
              </li>
              <li>
                <Link to="/consultar-turno" className="hover:text-primary transition-colors">
                  Consultar Estado de Turno
                </Link>
              </li>
              <li>
                <Link to="/mecanico/login" className="hover:text-primary transition-colors">
                  Acceso Mecánicos y Técnicos
                </Link>
              </li>
            </ul>
          </div>

          {/* Workshop Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Horarios & Taller</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Lunes a Sábado: 08:00 — 18:00 (Mismo día)</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Av. Principal y Los Mecánicos, Taller Central</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Línea Directa: +593 99 123 4567</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} MekaTurn — Prototipo de Sistema de Turnos de Taller Mecánico.</p>
          <p className="text-[11px]">Todos los turnos aplican exclusivamente para atención el mismo día de solicitud.</p>
        </div>
      </div>
    </footer>
  );
}
