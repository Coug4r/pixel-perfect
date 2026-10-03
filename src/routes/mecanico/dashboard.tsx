import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { MecanicoLayout } from "@/components/layout/MecanicoLayout";
import { useAuth } from "@/auth/AuthContext";
import { useTurnos } from "@/hooks/useTurnos";
import { TurnoCard } from "@/components/turnos/TurnoCard";
import { DiagnosticoDialog } from "@/components/turnos/DiagnosticoDialog";
import { ReagendarDialog } from "@/components/turnos/ReagendarDialog";
import { EstadoBadge } from "@/components/turnos/EstadoBadge";
import type { Turno } from "@/types";
import { 
  Clock, 
  Wrench, 
  CheckCircle2, 
  Users, 
  Star, 
  UserX, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  ListOrdered,
  PlusCircle,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatHora, formatNumero } from "@/utils/format";

export const Route = createFileRoute("/mecanico/dashboard")({
  component: () => (
    <ProtectedRoute rol="mecanico">
      <MecanicoDashboardPage />
    </ProtectedRoute>
  ),
});

function MecanicoDashboardPage() {
  const { user } = useAuth();
  const { 
    turnos, 
    clientes, 
    mecanicos, 
    diagnosticos, 
    calificaciones, 
    primerGeneral,
    actions 
  } = useTurnos();

  const [diagnosticoModalTurno, setDiagnosticoModalTurno] = useState<Turno | null>(null);
  const [reagendarModalTurno, setReagendarModalTurno] = useState<Turno | null>(null);

  // Mechanic-specific calculations
  const misTurnos = turnos.filter((t) => t.mecanicoAsignadoId === user?.id);
  const misPendientes = misTurnos.filter((t) => ["AGENDADO", "EN_ESPERA", "LLAMADO", "REAGENDADO"].includes(t.estado));
  const misEnAtencion = misTurnos.filter((t) => ["EN_ATENCION", "DIAGNOSTICO", "LISTO"].includes(t.estado));
  const misFinalizados = misTurnos.filter((t) => t.estado === "FINALIZADO");
  const misNoAsistio = misTurnos.filter((t) => t.estado === "NO_ASISTIO");

  const misCalificaciones = calificaciones.filter((c) => c.mecanicoId === user?.id);
  const promedioRating = misCalificaciones.length
    ? (misCalificaciones.reduce((acc, c) => acc + c.estrellas, 0) / misCalificaciones.length).toFixed(1)
    : "5.0";

  // General Queue (unassigned shifts)
  const colaGeneral = turnos.filter((t) => !t.mecanicoAsignadoId && (t.estado === "AGENDADO" || t.estado === "REAGENDADO"));

  // Handler for taking next available turn in general queue
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

  const handleTomarTurno = (turnoId: string) => {
    if (!user) return;
    try {
      actions.tomarTurno(turnoId, user.id);
      toast.success("Turno asignado a tu jornada correctamente.");
    } catch (err: any) {
      toast.error(err.message || "Error al tomar el turno.");
    }
  };

  const handleCambiarEstado = (turnoId: string, nuevoEstado: any) => {
    if (!user) return;
    try {
      actions.cambiarEstado(turnoId, user.id, nuevoEstado);
      toast.success(`Estado actualizado a ${nuevoEstado}`);
    } catch (err: any) {
      toast.error(err.message || "Error al cambiar de estado.");
    }
  };

  return (
    <MecanicoLayout
      title={`Bienvenido, ${user?.nombre}`}
      subtitle={`Panel de control del taller • Jornada de hoy • Cédula: ${user?.cedula}`}
      actions={
        <div className="flex items-center gap-2">
          {primerGeneral && (
            <Button
              onClick={handleTomarSiguiente}
              className="gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 text-xs shadow-sm"
            >
              <Wrench className="h-4 w-4" />
              <span>Tomar Turno #{formatNumero(primerGeneral.numero)} (Siguiente)</span>
            </Button>
          )}
          <Link to="/mecanico/cola">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ListOrdered className="h-4 w-4" />
              Ver Toda la Cola
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* 1. Pendientes */}
          <Card className="border border-border bg-card">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Pendientes</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-3">
                <p className="font-display text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                  {misPendientes.length}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">En espera de ingreso</p>
              </div>
            </CardContent>
          </Card>

          {/* 2. En Atención */}
          <Card className="border border-border bg-card">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">En Bahía</span>
                <Wrench className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="mt-3">
                <p className="font-display text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {misEnAtencion.length}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Atendiendo ahora</p>
              </div>
            </CardContent>
          </Card>

          {/* 3. Finalizados */}
          <Card className="border border-border bg-card">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Finalizados</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-3">
                <p className="font-display text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {misFinalizados.length}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Completados hoy</p>
              </div>
            </CardContent>
          </Card>

          {/* 4. Clientes Atendidos */}
          <Card className="border border-border bg-card">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Atendidos</span>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-3">
                <p className="font-display text-2xl sm:text-3xl font-black text-foreground">
                  {misFinalizados.length + misEnAtencion.length}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Total en tu estación</p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Calificación */}
          <Card className="border border-border bg-card">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Promedio</span>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <p className="font-display text-2xl sm:text-3xl font-black text-foreground">
                    {promedioRating}
                  </p>
                  <span className="text-xs text-muted-foreground">/5</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{misCalificaciones.length} calificaciones</p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Cola General Disponible */}
          <Card className="border border-amber-500/30 bg-amber-500/[0.04]">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">Cola General</span>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-3">
                <p className="font-display text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                  {colaGeneral.length}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Sin mecánico asignado</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Center Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active Shifts Assigned to Me (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                  Mis Turnos Asignados ({misTurnos.filter((t) => t.estado !== "FINALIZADO" && t.estado !== "CANCELADO").length} activos)
                </h2>
              </div>
              <span className="text-xs text-muted-foreground">Ordenados por hora de llegada</span>
            </div>

            {misTurnos.filter((t) => t.estado !== "FINALIZADO" && t.estado !== "CANCELADO").length === 0 ? (
              <Card className="border-dashed p-8 text-center bg-card/50">
                <Wrench className="h-10 w-10 mx-auto text-muted-foreground mb-2 opacity-50" />
                <p className="font-semibold text-foreground text-sm">No tienes turnos activos en tu estación</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Puedes tomar un turno de la cola general para comenzar la atención de un vehículo.
                </p>
                {primerGeneral && (
                  <Button onClick={handleTomarSiguiente} size="sm" className="mt-4 gap-1.5 bg-primary text-primary-foreground text-xs font-bold">
                    Tomar Turno General #{formatNumero(primerGeneral.numero)}
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-3.5">
                {misTurnos
                  .filter((t) => t.estado !== "FINALIZADO" && t.estado !== "CANCELADO")
                  .map((turno) => {
                    const cliente = clientes.find((c) => c.id === turno.clienteId);
                    const mecPref = mecanicos.find((m) => m.id === turno.mecanicoPreferidoId);
                    const mecAsig = mecanicos.find((m) => m.id === turno.mecanicoAsignadoId);
                    const diag = diagnosticos.find((d) => d.turnoId === turno.id);

                    return (
                      <TurnoCard
                        key={turno.id}
                        turno={turno}
                        cliente={cliente}
                        mecanicoPreferido={mecPref}
                        mecanicoAsignado={mecAsig}
                        diagnostico={diag}
                        currentMecanicoId={user?.id}
                        onCambiarEstado={handleCambiarEstado}
                        onAbrirDiagnostico={(t) => setDiagnosticoModalTurno(t)}
                        onAbrirReagendar={(t) => setReagendarModalTurno(t)}
                      />
                    );
                  })}
              </div>
            )}
          </div>

          {/* Right: General Queue & Recent Ratings (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* General Queue Card */}
            <Card className="border border-amber-500/30 bg-card">
              <CardHeader className="py-3.5 px-4 bg-amber-500/10 border-b border-amber-500/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span>Cola General Disponible ({colaGeneral.length})</span>
                  </CardTitle>
                </div>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Clientes sin mecánico preferido. Asignación por orden de llegada.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-3 space-y-2.5">
                {colaGeneral.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4 italic">
                    No hay turnos pendientes en cola general.
                  </p>
                ) : (
                  colaGeneral.slice(0, 4).map((t, idx) => {
                    const cliente = clientes.find((c) => c.id === t.clienteId);
                    const isFirst = idx === 0;

                    return (
                      <div
                        key={t.id}
                        className={`rounded-lg p-2.5 border text-xs space-y-2 transition-all ${
                          isFirst
                            ? "border-primary/50 bg-primary/5 shadow-2xs"
                            : "border-border bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-black text-primary text-sm">
                              #{formatNumero(t.numero)}
                            </span>
                            <span className="font-bold text-foreground">
                              {cliente?.nombre}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {formatHora(t.horaProgramada)}
                          </span>
                        </div>

                        <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                          "{t.problema}"
                        </p>

                        <div className="flex justify-end pt-1">
                          <Button
                            size="sm"
                            onClick={() => handleTomarTurno(t.id)}
                            className="h-7 text-[11px] gap-1 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                          >
                            <Wrench className="h-3 w-3" />
                            <span>Tomar Turno</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Ratings & Feedback Card */}
            <Card className="border border-border bg-card">
              <CardHeader className="py-3.5 px-4 border-b border-border bg-muted/20">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span>Últimas Calificaciones Recibidas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2.5">
                {misCalificaciones.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4 italic">
                    Aún no has recibido calificaciones hoy.
                  </p>
                ) : (
                  misCalificaciones.slice(-3).reverse().map((cal) => (
                    <div key={cal.id} className="rounded-lg border border-border bg-muted/20 p-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < cal.estrellas ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{formatHora(cal.fecha)}</span>
                      </div>
                      {cal.comentario && (
                        <p className="text-[11px] italic text-foreground/90 leading-tight">
                          "{cal.comentario}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals for Diagnosis and Rescheduling */}
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
    </MecanicoLayout>
  );
}
