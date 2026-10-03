import { useEffect, useRef } from "react";
import type { Notificacion } from "@/types";
import { MessageSquare, CheckCheck, ShieldAlert, Sparkles, Wrench, Send } from "lucide-react";
import { formatHora } from "@/utils/format";
import { Badge } from "@/components/ui/badge";

interface NotificacionesChatProps {
  notificaciones: Notificacion[];
  clienteNombre?: string;
  className?: string;
  autoScroll?: boolean;
}

export function NotificacionesChat({
  notificaciones,
  clienteNombre = "Cliente",
  className = "",
  autoScroll = true,
}: NotificacionesChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [notificaciones, autoScroll]);

  return (
    <div className={`overflow-hidden rounded-xl border border-border shadow-md bg-card flex flex-col ${className}`}>
      {/* WhatsApp Header Simulation */}
      <div className="bg-[#075E54] dark:bg-[#128C7E] px-4 py-3 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white font-bold">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#075E54] bg-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm leading-none">MekaTurn Taller</h4>
              <Badge className="bg-[#25D366] hover:bg-[#25D366] text-black text-[9px] font-black uppercase px-1.5 py-0 h-4">
                SIMULADO
              </Badge>
            </div>
            <p className="text-[11px] text-emerald-100 mt-0.5 flex items-center gap-1">
              <span>Canal de Notificaciones de Turno</span> • <span>En línea</span>
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[10px] text-emerald-100/90 font-mono">
            {clienteNombre}
          </span>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1.5 flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300">
        <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          <strong>Simulación de WhatsApp:</strong> Los mensajes se actualizan automáticamente al cambiar el estado del turno.
        </span>
      </div>

      {/* Messages Container with WhatsApp chat pattern background */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[380px] min-h-[220px] bg-[#ECE5DD] dark:bg-zinc-900/90"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.02) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        {/* Date bubble */}
        <div className="flex justify-center my-1">
          <span className="bg-white/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
            Hoy • Mensajes del Taller
          </span>
        </div>

        {notificaciones.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-zinc-400 opacity-60" />
            <p>Aún no hay notificaciones emitidas para este turno.</p>
          </div>
        ) : (
          notificaciones.map((notif) => (
            <div key={notif.id} className="flex justify-start max-w-[90%] sm:max-w-[80%]">
              <div className="rounded-lg rounded-tl-none bg-[#DCF8C6] dark:bg-emerald-950/80 text-zinc-900 dark:text-zinc-100 p-3 shadow-xs border border-emerald-200/50 dark:border-emerald-800/50 space-y-1 relative">
                <p className="text-xs leading-relaxed font-sans">{notif.mensaje}</p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-zinc-600 dark:text-zinc-400 select-none">
                  <span>{formatHora(notif.fecha)}</span>
                  <CheckCheck className="h-3.5 w-3.5 text-[#34B7F1]" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Simulated Footer */}
      <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800/90 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex-1 bg-background rounded-full px-3 py-1.5 text-[11px] text-muted-foreground border border-input flex items-center justify-between">
          <span>Notificaciones automáticas del sistema MekaTurn...</span>
          <Sparkles className="h-3.5 w-3.5 text-primary opacity-70" />
        </div>
      </div>
    </div>
  );
}
