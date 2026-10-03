import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { AdminSidebarLayout } from "@/components/layout/AdminSidebarLayout";
import { useTurnos } from "@/hooks/useTurnos";
import { DetallesTurnoDialog } from "@/components/turnos/DetallesTurnoDialog";
import { DiagnosticoCard } from "@/components/turnos/DiagnosticoCard";
import { EstadoBadge } from "@/components/turnos/EstadoBadge";
import type { Turno } from "@/types";
import { 
  FileText, 
  Search, 
  Car, 
  User, 
  Wrench, 
  History, 
  Calendar, 
  Clock, 
  Info,
  CheckCircle2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatNumero, formatHora, formatFecha } from "@/utils/format";

export const Route = createFileRoute("/admin/diagnosticos")({
  component: () => (
    <ProtectedRoute rol="superadmin">
      <AdminDiagnosticosPage />
    </ProtectedRoute>
  ),
});

function AdminDiagnosticosPage() {
  const { turnos, clientes, mecanicos, getDiagnosticos } = useTurnos();

  const [searchTerm, setSearchTerm] = useState("");
  const [detallesModalTurno, setDetallesModalTurno] = useState<Turno | null>(null);

  // Shifts that contain 1 or more diagnostics
  const turnosConDiagnosticos = useMemo(() => {
    return turnos.filter((t) => {
      const diags = getDiagnosticos(t.id);
      return diags.length > 0;
    });
  }, [turnos, getDiagnosticos]);

  // Filter with real-time Placa, Turno, Cliente, Mecánico
  const filteredTurnos = useMemo(() => {
    if (!searchTerm.trim()) return turnosConDiagnosticos;

    const termClean = searchTerm.trim().toUpperCase().replace(/-/g, "");
    return turnosConDiagnosticos.filter((t) => {
      const cliente = clientes.find((c) => c.id === t.clienteId);
      const mecanico = mecanicos.find((m) => m.id === t.mecanicoAsignadoId);
      const plateClean = (t.placa || "").replace(/-/g, "").toUpperCase();
      const diags = getDiagnosticos(t.id);
      const diagsMatch = diags.some(
        (d) =>
          d.diagnostico.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (d.observaciones || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (d.trabajoRealizado || "").toLowerCase().includes(searchTerm.toLowerCase())
      );

      return (
        plateClean.includes(termClean) ||
        String(t.numero).includes(searchTerm.trim()) ||
        (cliente?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mecanico?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        diagsMatch
      );
    });
  }, [turnosConDiagnosticos, clientes, mecanicos, getDiagnosticos, searchTerm]);

  return (
    <AdminSidebarLayout
      title="Registro Histórico de Diagnósticos Técnicos"
      subtitle="Historial detallado de reportes e informes de fallas emitidos por los técnicos del taller"
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por Placa (ej. PBX-1024), Turno #, Cliente, Mecánico o Falla técnica..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs sm:text-sm h-11 font-medium"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60 mt-3">
              <span>Turnos con diagnóstico: <strong>{filteredTurnos.length}</strong></span>
              <span className="font-mono">Organizado por última modificación (updatedAt)</span>
            </div>
          </CardContent>
        </Card>

        {/* Turnos & Multiple Diagnostics List */}
        <div className="space-y-6">
          {filteredTurnos.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <h3 className="font-display text-lg font-bold text-foreground">
                No se encontraron diagnósticos
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {searchTerm
                  ? `No hay diagnósticos que coincidan con "${searchTerm}".`
                  : "Aún no se han emitido diagnósticos en el taller."}
              </p>
            </Card>
          ) : (
            filteredTurnos.map((turno) => {
              const cliente = clientes.find((c) => c.id === turno.clienteId);
              const mecanico = mecanicos.find((m) => m.id === turno.mecanicoAsignadoId);
              const listaDiags = getDiagnosticos(turno.id);

              return (
                <Card key={turno.id} className="border-2 border-border/80 bg-card shadow-md overflow-hidden">
                  {/* Shift Header Bar */}
                  <div className="p-4 bg-muted/40 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-display text-lg font-black text-primary">
                        TURNO #{formatNumero(turno.numero)}
                      </span>
                      <span className="font-mono font-bold text-xs bg-card px-2.5 py-1 rounded border border-border">
                        {turno.placa}
                      </span>
                      <EstadoBadge estado={turno.estado} size="sm" />
                      <span className="text-[11px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                        {listaDiags.length} informe{listaDiags.length === 1 ? "" : "s"} registrado{listaDiags.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDetallesModalTurno(turno)}
                        className="text-xs gap-1.5 h-8 font-semibold"
                      >
                        <Info className="h-3.5 w-3.5" />
                        <span>Ver Ficha Completa</span>
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    {/* Shift metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-muted/20 p-3 rounded-lg border border-border/60">
                      <div>
                        <span className="font-semibold text-foreground">Cliente: </span>
                        <span>{cliente?.nombre} ({cliente?.identificacion})</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Mecánico: </span>
                        <span>{mecanico ? mecanico.nombre : "Sin asignar"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Última modif: </span>
                        <span>{formatHora(turno.updatedAt)} ({formatFecha(turno.updatedAt)})</span>
                      </div>
                    </div>

                    {/* All Diagnostics associated with this turn */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        <span>Historial Completo de Diagnósticos Emitidos:</span>
                      </h4>

                      <div className="space-y-3">
                        {listaDiags.map((diag, idx) => (
                          <div key={diag.id} className="relative">
                            <div className="text-[11px] font-bold uppercase text-primary mb-1 flex items-center gap-1.5">
                              <span>Diagnóstico #{idx + 1}</span>
                              <span className="text-muted-foreground font-normal">
                                • Emitido: {formatFecha(diag.fecha)} a las {formatHora(diag.fecha)}
                              </span>
                            </div>
                            <DiagnosticoCard diagnostico={diag} mecanico={mecanico} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <DetallesTurnoDialog
        open={!!detallesModalTurno}
        onOpenChange={(open) => !open && setDetallesModalTurno(null)}
        turno={detallesModalTurno}
      />
    </AdminSidebarLayout>
  );
}
