import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { MecanicoSidebarLayout } from "@/components/layout/MecanicoSidebarLayout";
import { useAuth } from "@/auth/AuthContext";
import { useTurnos } from "@/hooks/useTurnos";
import { TurnoCard } from "@/components/turnos/TurnoCard";
import { DiagnosticoDialog } from "@/components/turnos/DiagnosticoDialog";
import { ReagendarDialog } from "@/components/turnos/ReagendarDialog";
import { DetallesTurnoDialog } from "@/components/turnos/DetallesTurnoDialog";
import { EstadoBadge } from "@/components/turnos/EstadoBadge";
import type { Turno } from "@/types";
import { 
  Clock, 
  Wrench, 
  Sparkles, 
  ListOrdered,
  PlusCircle,
  AlertCircle,
  Car,
  Zap,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { formatNumero, formatHora } from "@/utils/format";

export const Route = createFileRoute("/mecanico/dashboard")({
  component: () => (
    <ProtectedRoute rol="mecanico">
      <MecanicoDashboardPage />
    </ProtectedRoute>
  ),
});

function MecanicoDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    turnos, 
    clientes, 
    mecanicos, 
    diagnosticos, 
    primerGeneral,
    actions 
  } = useTurnos();

  const [diagnosticoModalTurno, setDiagnosticoModalTurno] = useState<Turno | null>(null);
  const [reagendarModalTurno, setReagendarModalTurno] = useState<Turno | null>(null);
  const [detallesModalTurno, setDetallesModalTurno] = useState<Turno | null>(null);

  // Filter turnos specifically for PENDIENTES for this mechanic:
  // 1. Direct assigned to this mechanic and in active/pending states
  const misTurnosDirectos = turnos.filter(
    (t) => t.mecanicoAsignadoId === user?.id && ["AGENDADO", "EN_ESPERA", "LLAMADO", "REAGENDADO", "EN_ATENCION"].includes(t.estado)
  );

  // 2. Unassigned shifts in general queue (auto-assignable / pending)
  const turnosColaGeneral = turnos.filter(
    (t) => !t.mecanicoAsignadoId && ["AGENDADO", "EN_ESPERA", "REAGENDADO"].includes(t.estado)
  );

  // Total pending count
  const totalPendientes = misTurnosDirectos.length + turnosColaGeneral.length;

  const handleTomarSiguiente = () => {
    if (!primerGeneral || !user) {
      toast.info("No hay turnos pendientes en la cola general en este momento.");
      return;
    }
    try {
      actions.tomarTurno(primerGeneral.id, user.id);
      toast.success(`Has tomado el turno #${formatNumero(primerGeneral.numero)}.`);
    } catch (err: any) {
      toast.error(err.message || "Error al tomar el turno.");
    }
  };

  const handleLlamarCliente = (turnoId: string) => {
    if (!user) return;
    try {
      actions.cambiarEstado(turnoId, user.id, "LLAMADO");
      toast.success("¡Cliente llamado al taller para iniciar atención!");
    } catch (err: any) {
      toast.error(err.message || "Error al llamar al cliente.");
    }
  };

  return (
    <MecanicoSidebarLayout
      title={`Bienvenido, ${user?.nombre || "Mecánico"}`}
      subtitle={`Panel de Operaciones • Cédula: ${user?.cedula} • Jornada de Hoy`}
      actions={
        <div className="flex items-center gap-2">
          {primerGeneral && (
            <Button
              onClick={handleTomarSiguiente}
              className="gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 text-xs shadow-md min-h-[40px] px-4"
            >
              <Wrench className="h-4 w-4" />
              <span>Tomar Turno General #{formatNumero(primerGeneral.numero)}</span>
            </Button>
          )}
          <Link to="/mecanico/turnos">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs min-h-[40px] font-semibold">
              <ListOrdered className="h-4 w-4" />
              <span>Ver Todos los Turnos</span>
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Counter Card strictly for Turnos Pendientes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Pendientes */}
          <Card className="border-2 border-primary/30 bg-primary/[0.03]">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Total Turnos Pendientes
                </span>
                <p className="font-display text-3xl sm:text-4xl font-black text-primary mt-1">
                  {totalPendientes}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Esperando atención o en bahía técnica
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Mis Turnos Asignados */}
          <Card className="border border-border bg-card">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Asignados a tu Estación
                </span>
                <p className="font-display text-3xl sm:text-4xl font-black text-foreground mt-1">
                  {misTurnosDirectos.length}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Turnos directos o tomados por ti
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-foreground">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Cola General Pendiente */}
          <Card className="border border-amber-500/30 bg-amber-500/[0.04]">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                  Cola General (Sin Asignar)
                </span>
                <p className="font-display text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {turnosColaGeneral.length}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Asignación disponible solo con el botón superior
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Sparkles className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Center Grid: Mis Turnos Pendientes vs Cola General */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Mis Turnos Pendientes (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                  Turnos Pendientes Asignados ({misTurnosDirectos.length})
                </h2>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                Click en un turno para gestionarlo
              </span>
            </div>

            {misTurnosDirectos.length === 0 ? (
              <Card className="border-dashed p-8 text-center bg-card/50">
                <Wrench className="h-10 w-10 mx-auto text-muted-foreground mb-2 opacity-50" />
                <p className="font-semibold text-foreground text-sm">No tienes turnos pendientes asignados</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Utiliza el botón superior para tomar el siguiente turno general disponible.
                </p>
              </Card>
            ) : (
              <div className="space-y-3.5">
                {misTurnosDirectos.map((turno) => {
                  const cliente = clientes.find((c) => c.id === turno.clienteId);

                  return (
                    <Card
                      key={turno.id}
                      onClick={() => navigate({ to: "/mecanico/turnos" })}
                      className="border border-border/80 bg-card shadow-xs hover:border-primary/60 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <CardContent className="p-4 sm:p-5 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="font-display text-lg font-black text-primary">
                              TURNO #{formatNumero(turno.numero)}
                            </span>
                            <span className="font-mono font-bold text-xs bg-muted px-2 py-0.5 rounded border border-border">
                              {turno.placa}
                            </span>
                            <EstadoBadge estado={turno.estado} size="sm" />
                          </div>

                          <div className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Hora: {formatHora(turno.horaProgramada)}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Cliente:</span>
                            <span className="font-bold text-foreground text-sm">{cliente?.nombre || "Cliente"}</span>
                            {cliente?.celular && (
                              <p className="font-mono text-muted-foreground text-[11px] mt-0.5">Tel: {cliente.celular}</p>
                            )}
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Problema Reportado:</span>
                            <p className="text-foreground/90 font-medium line-clamp-2">{turno.problema}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs font-semibold text-primary">
                          <span className="flex items-center gap-1.5 group-hover:underline">
                            Ir a pantalla de Turnos
                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            Click para atender
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Turnos en Cola General Disponibles (4 cols) - NO extra assign buttons */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border border-amber-500/30 bg-card shadow-sm">
              <CardHeader className="py-3.5 px-4 bg-amber-500/10 border-b border-amber-500/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span>Cola General ({turnosColaGeneral.length})</span>
                  </CardTitle>
                </div>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Turnos sin asignar. Para asignar, utiliza el botón superior.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-3 space-y-2.5">
                {turnosColaGeneral.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6 italic">
                    No hay turnos pendientes en cola general.
                  </p>
                ) : (
                  turnosColaGeneral.map((t, idx) => {
                    const cliente = clientes.find((c) => c.id === t.clienteId);
                    const isFirst = idx === 0;

                    return (
                      <div
                        key={t.id}
                        onClick={() => navigate({ to: "/mecanico/turnos" })}
                        className={`rounded-lg p-3 border text-xs space-y-1.5 transition-all cursor-pointer hover:border-primary/60 hover:shadow-xs group ${
                          isFirst
                            ? "border-primary/50 bg-primary/5 shadow-xs"
                            : "border-border bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-black text-primary text-sm">
                              #{formatNumero(t.numero)}
                            </span>
                            <span className="font-mono font-bold text-[11px] bg-muted px-1.5 py-0.5 rounded border border-border">
                              {t.placa}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {formatHora(t.horaProgramada)}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-foreground">
                          {cliente?.nombre || "Cliente"}
                        </p>

                        <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                          "{t.problema}"
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-border/40">
                          <span className="text-[11px] text-primary font-medium flex items-center gap-1 group-hover:underline">
                            Ir a Turnos <ArrowRight className="h-3 w-3" />
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium inline-flex items-center gap-1">
                            {isFirst ? (
                              <>
                                <Zap className="h-3 w-3 text-amber-500" />
                                <span>Siguiente en cola</span>
                              </>
                            ) : (
                              `Posición #${idx + 1}`
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals for Diagnosis, Rescheduling, and Details */}
      <DiagnosticoDialog
        open={!!diagnosticoModalTurno}
        onOpenChange={(open) => !open && setDiagnosticoModalTurno(null)}
        turno={diagnosticoModalTurno}
        diagnosticoExistente={
          diagnosticoModalTurno
            ? diagnosticos.find((d) => d.turnoId === diagnosticoModalTurno.id)
            : undefined
        }
        onSave={(data) => {
          if (diagnosticoModalTurno && user) {
            actions.registrarDiagnostico(diagnosticoModalTurno.id, user.id, data);
          }
        }}
      />

      <ReagendarDialog
        open={!!reagendarModalTurno}
        onOpenChange={(open) => !open && setReagendarModalTurno(null)}
        turno={reagendarModalTurno}
        onConfirm={(nuevaHora) => {
          if (reagendarModalTurno && user) {
            actions.reagendar(reagendarModalTurno.id, user.id, nuevaHora);
          }
        }}
      />

      <DetallesTurnoDialog
        open={!!detallesModalTurno}
        onOpenChange={(open) => !open && setDetallesModalTurno(null)}
        turno={detallesModalTurno}
      />
    </MecanicoSidebarLayout>
  );
}
