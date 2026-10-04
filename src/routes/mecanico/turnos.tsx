import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
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
  ListOrdered, 
  Search, 
  Car, 
  Clock, 
  Wrench, 
  FileText, 
  CheckCircle2, 
  PlusCircle, 
  Info,
  Calendar,
  History
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { formatNumero, formatHora, formatFecha } from "@/utils/format";

export const Route = createFileRoute("/mecanico/turnos")({
  component: () => (
    <ProtectedRoute rol="mecanico">
      <MecanicoTurnosPage />
    </ProtectedRoute>
  ),
});

function MecanicoTurnosPage() {
  const { user } = useAuth();
  const { 
    turnos, 
    clientes, 
    mecanicos, 
    diagnosticos, 
    primerGeneral,
    actions,
    getDiagnosticos
  } = useTurnos();

  const [activeTab, setActiveTab] = useState<"en_cola" | "diagnosticados" | "finalizados">("en_cola");
  const [searchPlaca, setSearchPlaca] = useState("");
  const [diagnosticoModalTurno, setDiagnosticoModalTurno] = useState<Turno | null>(null);
  const [reagendarModalTurno, setReagendarModalTurno] = useState<Turno | null>(null);
  const [detallesModalTurno, setDetallesModalTurno] = useState<Turno | null>(null);

  // Group turnos by the 3 specified tabs - strictly only shifts assigned to the current mechanic:
  // 1. EN COLA: Pending attention / in-progress shifts assigned to this mechanic
  const turnosEnCola = useMemo(() => {
    return turnos.filter(
      (t) => t.mecanicoAsignadoId === user?.id && ["AGENDADO", "EN_ESPERA", "LLAMADO", "REAGENDADO", "EN_ATENCION"].includes(t.estado)
    );
  }, [turnos, user?.id]);

  // 2. DIAGNOSTICADOS: Strictly shifts with estado === "DIAGNOSTICO" assigned to this mechanic
  const turnosDiagnosticados = useMemo(() => {
    return turnos.filter(
      (t) => t.mecanicoAsignadoId === user?.id && t.estado === "DIAGNOSTICO"
    );
  }, [turnos, user?.id]);

  // 3. FINALIZADOS: Completed shifts assigned to this mechanic
  const turnosFinalizados = useMemo(() => {
    return turnos.filter(
      (t) => t.mecanicoAsignadoId === user?.id && t.estado === "FINALIZADO"
    );
  }, [turnos, user?.id]);

  // Filter with real-time Placa (or query)
  const filterList = (list: Turno[]) => {
    if (!searchPlaca.trim()) return list;
    const term = searchPlaca.trim().toUpperCase().replace(/-/g, "");
    return list.filter((t) => {
      const plateClean = (t.placa || "").replace(/-/g, "").toUpperCase();
      const client = clientes.find((c) => c.id === t.clienteId);
      return (
        plateClean.includes(term) ||
        String(t.numero).includes(searchPlaca.trim()) ||
        (client?.nombre || "").toLowerCase().includes(searchPlaca.toLowerCase())
      );
    });
  };

  const listaEnCola = filterList(turnosEnCola);
  const listaDiagnosticados = filterList(turnosDiagnosticados);
  const listaFinalizados = filterList(turnosFinalizados);

  const handleTomarTurno = async (turnoId: string) => {
    if (!user) return;
    try {
      await actions.tomarTurno(turnoId, user.id);
      toast.success("Turno asignado a tu estación de trabajo.");
    } catch (err: any) {
      toast.error(err.message || "Error al tomar el turno.");
    }
  };

  const handleCambiarEstado = async (turnoId: string, nuevoEstado: any) => {
    if (!user) return;
    try {
      await actions.cambiarEstado(turnoId, user.id, nuevoEstado);
      toast.success(`Estado del turno actualizado a ${nuevoEstado}`);
    } catch (err: any) {
      toast.error(err.message || "Error al cambiar de estado.");
    }
  };

  const handleFinalizarTurno = async (turnoId: string, num: number) => {
    if (!user) return;
    try {
      await actions.cambiarEstado(turnoId, user.id, "FINALIZADO");
      toast.success(`Turno #${formatNumero(num)} finalizado y trasladado a Finalizados.`);
    } catch (err: any) {
      toast.error(err.message || "Error al finalizar el turno.");
    }
  };

  return (
    <MecanicoSidebarLayout
      title="TURNOS"
      subtitle="Gestión operativa del taller organizada por última modificación en tiempo real"
    >
      <div className="space-y-6">
        {/* Real-time Placa Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3.5 rounded-xl border border-border shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Car className="h-4 w-4 absolute left-3 top-3 text-primary" />
            <Input
              placeholder="Filtrar en tiempo real por PLACA (ej. PBX-1024 o ABC1234), turno o cliente..."
              value={searchPlaca}
              onChange={(e) => setSearchPlaca(e.target.value)}
              className="pl-9 text-xs sm:text-sm h-10 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground self-end sm:self-auto font-medium">
            <History className="h-3.5 w-3.5 text-primary" />
            <span>Ordenados por <strong>Última Modificación</strong></span>
          </div>
        </div>

        {/* Strictly 3 Tabs: EN COLA, DIAGNOSTICADOS, FINALIZADOS */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-3 h-auto p-1.5 bg-muted/70 rounded-xl border border-border">
            <TabsTrigger
              value="en_cola"
              className="text-xs sm:text-sm font-bold py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Clock className="h-4 w-4" />
              <span>1. EN COLA ({turnosEnCola.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="diagnosticados"
              className="text-xs sm:text-sm font-bold py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <FileText className="h-4 w-4" />
              <span>2. DIAGNOSTICADOS ({turnosDiagnosticados.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="finalizados"
              className="text-xs sm:text-sm font-bold py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>3. FINALIZADOS ({turnosFinalizados.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: EN COLA */}
          <TabsContent value="en_cola" className="space-y-3.5 pt-2">
            {listaEnCola.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card/40">
                <Clock className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="font-display text-lg font-bold text-foreground">
                  No hay turnos en cola
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {searchPlaca ? `No se encontraron turnos con la placa o búsqueda "${searchPlaca}".` : "Actualmente no existen vehículos pendientes en cola de atención."}
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {listaEnCola.map((turno) => {
                  const cliente = clientes.find((c) => c.id === turno.clienteId);
                  const mecPref = mecanicos.find((m) => m.id === turno.mecanicoPreferidoId);
                  const mecAsig = mecanicos.find((m) => m.id === turno.mecanicoAsignadoId);
                  const diag = diagnosticos.find((d) => d.turnoId === turno.id);
                  const isFirst = primerGeneral?.id === turno.id;

                  return (
                    <TurnoCard
                      key={turno.id}
                      turno={turno}
                      cliente={cliente}
                      mecanicoPreferido={mecPref}
                      mecanicoAsignado={mecAsig}
                      diagnostico={diag}
                      currentMecanicoId={user?.id}
                      isFirstInQueue={isFirst}
                      onTomarTurno={handleTomarTurno}
                      onCambiarEstado={handleCambiarEstado}
                      onAbrirDiagnostico={(t) => setDiagnosticoModalTurno(t)}
                      onAbrirReagendar={(t) => setReagendarModalTurno(t)}
                      onVerDetalles={(t) => setDetallesModalTurno(t)}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: DIAGNOSTICADOS */}
          <TabsContent value="diagnosticados" className="space-y-3.5 pt-2">
            {listaDiagnosticados.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card/40">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="font-display text-lg font-bold text-foreground">
                  No hay turnos diagnosticados
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Los turnos con diagnósticos técnicos emitidos aparecerán en esta sección.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {listaDiagnosticados.map((turno) => {
                  const cliente = clientes.find((c) => c.id === turno.clienteId);
                  const mecAsig = mecanicos.find((m) => m.id === turno.mecanicoAsignadoId);
                  const diags = getDiagnosticos(turno.id);

                  return (
                    <Card key={turno.id} className="border border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-display text-lg font-black text-primary">
                                TURNO #{formatNumero(turno.numero)}
                              </span>
                              <span className="font-mono font-bold text-xs bg-muted px-2 py-0.5 rounded border border-border">
                                {turno.placa}
                              </span>
                              <EstadoBadge estado={turno.estado} size="sm" />
                              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {diags.length} diagnóstico{diags.length === 1 ? "" : "s"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <div>
                                <span className="font-semibold text-foreground">Cliente: </span>
                                {cliente?.nombre || "Cliente"}
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">Mecánico: </span>
                                {mecAsig?.nombre || "Sin asignar"}
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">Última modif: </span>
                                {formatHora(turno.updatedAt)} ({formatFecha(turno.updatedAt)})
                              </div>
                            </div>

                            {diags.length > 0 && diags[0] && (
                              <p className="text-xs text-foreground/90 italic bg-muted/30 p-2 rounded-md border border-border/60">
                                <strong>Último reporte:</strong> {diags[0].diagnostico}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
                            <Button
                              size="sm"
                              onClick={() => handleFinalizarTurno(turno.id, turno.numero)}
                              className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold min-h-[36px] shadow-xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Finalizar Turno</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDiagnosticoModalTurno(turno)}
                              className="text-xs gap-1.5 min-h-[36px]"
                            >
                              <PlusCircle className="h-3.5 w-3.5 text-primary" />
                              <span>+ Agregar Diagnóstico</span>
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setDetallesModalTurno(turno)}
                              className="text-xs gap-1.5 min-h-[36px] font-semibold"
                            >
                              <Info className="h-3.5 w-3.5" />
                              <span>Detalles</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: FINALIZADOS */}
          <TabsContent value="finalizados" className="space-y-3.5 pt-2">
            {listaFinalizados.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card/40">
                <CheckCircle2 className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="font-display text-lg font-bold text-foreground">
                  No hay turnos finalizados
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Los vehículos entregados con servicio completado se listarán aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {listaFinalizados.map((turno) => {
                  const cliente = clientes.find((c) => c.id === turno.clienteId);
                  const mecAsig = mecanicos.find((m) => m.id === turno.mecanicoAsignadoId);

                  return (
                    <Card key={turno.id} className="border border-border/80 bg-card hover:border-emerald-500/40 transition-all shadow-xs">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-display text-lg font-black text-emerald-600 dark:text-emerald-400">
                                TURNO #{formatNumero(turno.numero)}
                              </span>
                              <span className="font-mono font-bold text-xs bg-muted px-2 py-0.5 rounded border border-border">
                                {turno.placa}
                              </span>
                              <EstadoBadge estado={turno.estado} size="sm" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <div>
                                <span className="font-semibold text-foreground">Cliente: </span>
                                {cliente?.nombre || "Cliente"}
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">Mecánico: </span>
                                {mecAsig?.nombre || "Atendido"}
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">Fecha: </span>
                                {formatFecha(turno.creadoEn)}
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">Última modif: </span>
                                {formatHora(turno.updatedAt)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <Button
                              size="sm"
                              onClick={() => setDetallesModalTurno(turno)}
                              className="text-xs gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 min-h-[36px]"
                            >
                              <Info className="h-3.5 w-3.5" />
                              <span>Detalles</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
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
        onSave={async (data) => {
          if (diagnosticoModalTurno && user) {
            try {
              await actions.registrarDiagnostico(diagnosticoModalTurno.id, user.id, data);
              toast.success("Diagnóstico guardado en la base de datos.");
            } catch (err: any) {
              toast.error(err.message || "Error al guardar diagnóstico.");
            }
          }
        }}
      />

      <ReagendarDialog
        open={!!reagendarModalTurno}
        onOpenChange={(open) => !open && setReagendarModalTurno(null)}
        turno={reagendarModalTurno}
        onConfirm={async (nuevaHora) => {
          if (reagendarModalTurno && user) {
            try {
              await actions.reagendar(reagendarModalTurno.id, user.id, nuevaHora);
              toast.success("Turno reagendado en la base de datos.");
            } catch (err: any) {
              toast.error(err.message || "Error al reagendar turno.");
            }
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
