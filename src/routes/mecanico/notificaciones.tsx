import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { MecanicoLayout } from "@/components/layout/MecanicoLayout";
import { useTurnos } from "@/hooks/useTurnos";
import { EstadoBadge } from "@/components/turnos/EstadoBadge";
import { NotificacionesChat } from "@/components/turnos/NotificacionesChat";
import type { Turno } from "@/types";
import { 
  Bell, 
  MessageSquare, 
  CheckCheck, 
  Sparkles, 
  ShieldAlert, 
  User, 
  Clock, 
  Search,
  Send,
  Wrench,
  Smartphone
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatHora, formatNumero } from "@/utils/format";

export const Route = createFileRoute("/mecanico/notificaciones")({
  component: () => (
    <ProtectedRoute rol="mecanico">
      <MecanicoNotificacionesPage />
    </ProtectedRoute>
  ),
});

function MecanicoNotificacionesPage() {
  const { notificaciones, turnos, clientes, mecanicos } = useTurnos();
  const [selectedTurnoId, setSelectedTurnoId] = useState<string>(turnos[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");

  const selectedTurno = turnos.find((t) => t.id === selectedTurnoId);
  const selectedCliente = selectedTurno ? clientes.find((c) => c.id === selectedTurno.clienteId) : undefined;
  const turnosNotifs = selectedTurno ? notificaciones.filter((n) => n.turnoId === selectedTurno.id) : [];

  const filteredTurnos = turnos.filter((t) => {
    const c = clientes.find((cli) => cli.id === t.clienteId);
    return (
      searchTerm.trim() === "" ||
      String(t.numero).includes(searchTerm.trim()) ||
      c?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c?.identificacion.includes(searchTerm.trim())
    );
  });

  return (
    <MecanicoLayout
      title="Centro de Notificaciones & WhatsApp Simulado"
      subtitle="Monitoreo de avisos emitidos en tiempo real a los clientes conforme avanzan los estados"
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Canal Simulado de WhatsApp Business API</p>
              <p className="text-emerald-700 dark:text-emerald-300">
                Cada transición de estado (Agendado, En Espera, Diagnóstico, Listo) emite un mensaje automático instantáneo al cliente.
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white font-mono text-[10px] uppercase">
            Total Avisos Hoy: {notificaciones.length}
          </Badge>
        </div>

        {/* Split View: Left List of Shifts with Messages, Right Live WhatsApp Simulation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Shifts selector (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-card p-3 rounded-xl border border-border space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span>Conversaciones por Turno</span>
                </h3>
                <span className="text-xs text-muted-foreground">{turnos.length} clientes</span>
              </div>
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-muted-foreground" />
                <Input
                  placeholder="Filtrar por cliente o # turno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredTurnos.map((t) => {
                const c = clientes.find((cli) => cli.id === t.clienteId);
                const nList = notificaciones.filter((n) => n.turnoId === t.id);
                const lastMsg = nList[nList.length - 1];
                const isSelected = selectedTurnoId === t.id;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTurnoId(t.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-150 space-y-1.5 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-xs"
                        : "border-border bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-primary text-sm">
                          #{formatNumero(t.numero)}
                        </span>
                        <span className="font-bold text-xs text-foreground truncate max-w-[140px]">
                          {c?.nombre}
                        </span>
                      </div>
                      <EstadoBadge estado={t.estado} size="sm" showIcon={false} />
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                      {lastMsg ? lastMsg.mensaje : "Sin mensajes emitidos"}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                      <span>{c?.celular}</span>
                      <span>{lastMsg ? formatHora(lastMsg.fecha) : formatHora(t.horaProgramada)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: WhatsApp Interactive Preview (7 cols) */}
          <div className="lg:col-span-7">
            {selectedTurno && selectedCliente ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      Vista en Vivo: Turno #{formatNumero(selectedTurno.numero)} — {selectedCliente.nombre}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Celular: {selectedCliente.celular} • Cédula: {selectedCliente.identificacion}
                    </p>
                  </div>
                  <EstadoBadge estado={selectedTurno.estado} size="default" />
                </div>

                <NotificacionesChat
                  notificaciones={turnosNotifs}
                  clienteNombre={selectedCliente.nombre}
                  className="shadow-lg"
                />
              </div>
            ) : (
              <Card className="p-12 text-center text-muted-foreground">
                <p className="text-sm">Selecciona un turno a la izquierda para ver su chat simulado de WhatsApp.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MecanicoLayout>
  );
}
