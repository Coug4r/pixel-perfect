import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { MecanicoLayout } from "@/components/layout/MecanicoLayout";
import { useAuth } from "@/auth/AuthContext";
import { useTurnos } from "@/hooks/useTurnos";
import { TurnoCard } from "@/components/turnos/TurnoCard";
import { DiagnosticoDialog } from "@/components/turnos/DiagnosticoDialog";
import { ReagendarDialog } from "@/components/turnos/ReagendarDialog";
import type { Turno } from "@/types";
import { 
  ListOrdered, 
  Search, 
  Filter, 
  Wrench, 
  Clock, 
  Sparkles, 
  User, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatNumero } from "@/utils/format";

export const Route = createFileRoute("/mecanico/cola")({
  component: () => (
    <ProtectedRoute rol="mecanico">
      <MecanicoColaPage />
    </ProtectedRoute>
  ),
});

function MecanicoColaPage() {
  const { user } = useAuth();
  const { 
    turnos, 
    clientes, 
    mecanicos, 
    diagnosticos, 
    primerGeneral, 
    actions 
  } = useTurnos();

  const [activeTab, setActiveTab] = useState("mis_turnos");
  const [searchTerm, setSearchTerm] = useState("");
  const [diagnosticoModalTurno, setDiagnosticoModalTurno] = useState<Turno | null>(null);
  const [reagendarModalTurno, setReagendarModalTurno] = useState<Turno | null>(null);

  // Filters
  const filteredTurnos = turnos.filter((t) => {
    const c = clientes.find((cli) => cli.id === t.clienteId);
    const matchesSearch =
      searchTerm.trim() === "" ||
      String(t.numero).includes(searchTerm.trim()) ||
      c?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c?.identificacion.includes(searchTerm.trim()) ||
      t.problema.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "mis_turnos") {
      return t.mecanicoAsignadoId === user?.id;
    }
    if (activeTab === "cola_general") {
      return !t.mecanicoAsignadoId && (t.estado === "AGENDADO" || t.estado === "REAGENDADO");
    }
    if (activeTab === "en_atencion") {
      return ["EN_ATENCION", "DIAGNOSTICO", "LISTO"].includes(t.estado);
    }
    if (activeTab === "finalizados") {
      return ["FINALIZADO", "CANCELADO", "NO_ASISTIO"].includes(t.estado);
    }
    return true; // "todos"
  });

  const handleTomarTurno = (turnoId: string) => {
    if (!user) return;
    try {
      actions.tomarTurno(turnoId, user.id);
      toast.success("Turno asignado a tu jornada con éxito.");
    } catch (err: any) {
      toast.error(err.message || "Error al tomar el turno.");
    }
  };

  const handleCambiarEstado = (turnoId: string, nuevoEstado: any) => {
    if (!user) return;
    try {
      actions.cambiarEstado(turnoId, user.id, nuevoEstado);
      toast.success(`Estado del turno actualizado a ${nuevoEstado}`);
    } catch (err: any) {
      toast.error(err.message || "Error al cambiar de estado.");
    }
  };

  return (
    <MecanicoLayout
      title="Cola de Turnos del Taller"
      subtitle="Visualización en tiempo real por estricto orden de llegada y preferencia del cliente"
    >
      <div className="space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por # de turno, cliente, cédula o falla..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground self-end sm:self-auto">
            <span>Total encontrados: <strong className="text-foreground">{filteredTurnos.length}</strong></span>
          </div>
        </div>

        {/* Tabs Filter */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto p-1 bg-muted/60">
            <TabsTrigger value="mis_turnos" className="text-xs font-bold py-2">
              Mis Turnos ({turnos.filter((t) => t.mecanicoAsignadoId === user?.id).length})
            </TabsTrigger>
            <TabsTrigger value="cola_general" className="text-xs font-bold py-2 text-amber-700 dark:text-amber-300">
              Cola General ({turnos.filter((t) => !t.mecanicoAsignadoId && (t.estado === "AGENDADO" || t.estado === "REAGENDADO")).length})
            </TabsTrigger>
            <TabsTrigger value="en_atencion" className="text-xs font-bold py-2">
              En Bahía ({turnos.filter((t) => ["EN_ATENCION", "DIAGNOSTICO", "LISTO"].includes(t.estado)).length})
            </TabsTrigger>
            <TabsTrigger value="todos" className="text-xs font-bold py-2">
              Todos ({turnos.length})
            </TabsTrigger>
            <TabsTrigger value="finalizados" className="text-xs font-bold py-2">
              Historial / Fin ({turnos.filter((t) => ["FINALIZADO", "CANCELADO", "NO_ASISTIO"].includes(t.estado)).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3.5 pt-2">
            {filteredTurnos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card/40">
                <ListOrdered className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="font-display text-lg font-bold text-foreground">
                  No hay turnos para mostrar en esta vista
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {searchTerm ? "Intenta modificar el término de búsqueda." : "No hay turnos registrados que coincidan con el filtro seleccionado."}
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredTurnos.map((turno) => {
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
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
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
