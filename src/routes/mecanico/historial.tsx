import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { MecanicoLayout } from "@/components/layout/MecanicoLayout";
import { useAuth } from "@/auth/AuthContext";
import { useTurnos } from "@/hooks/useTurnos";
import { EstadoBadge } from "@/components/turnos/EstadoBadge";
import { StarRating } from "@/components/turnos/StarRating";
import { DiagnosticoCard } from "@/components/turnos/DiagnosticoCard";
import type { Turno, EstadoTurno } from "@/types";
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Car, 
  Stethoscope, 
  Star, 
  FileText,
  Clock,
  Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatHora, formatNumero } from "@/utils/format";

export const Route = createFileRoute("/mecanico/historial")({
  component: () => (
    <ProtectedRoute rol="mecanico">
      <MecanicoHistorialPage />
    </ProtectedRoute>
  ),
});

function MecanicoHistorialPage() {
  const { user } = useAuth();
  const { turnos, clientes, mecanicos, diagnosticos, calificaciones } = useTurnos();

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("todos");
  const [selectedTurnoDetalle, setSelectedTurnoDetalle] = useState<Turno | null>(null);

  const filteredHistorial = turnos.filter((t) => {
    const c = clientes.find((cli) => cli.id === t.clienteId);
    const matchesSearch =
      searchTerm.trim() === "" ||
      String(t.numero).includes(searchTerm.trim()) ||
      c?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c?.identificacion.includes(searchTerm.trim()) ||
      t.problema.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (estadoFilter !== "todos" && t.estado !== estadoFilter) {
      return false;
    }

    return true;
  });

  const selectedCliente = selectedTurnoDetalle
    ? clientes.find((c) => c.id === selectedTurnoDetalle.clienteId)
    : undefined;
  const selectedMecanico = selectedTurnoDetalle
    ? mecanicos.find((m) => m.id === (selectedTurnoDetalle.mecanicoAsignadoId || selectedTurnoDetalle.mecanicoPreferidoId))
    : undefined;
  const selectedDiagnostico = selectedTurnoDetalle
    ? diagnosticos.find((d) => d.turnoId === selectedTurnoDetalle.id)
    : undefined;
  const selectedCalificacion = selectedTurnoDetalle
    ? calificaciones.find((c) => c.turnoId === selectedTurnoDetalle.id)
    : undefined;

  return (
    <MecanicoLayout
      title="Historial de Atención de Turnos"
      subtitle="Registro completo de servicios, diagnósticos y calificaciones de clientes de la jornada de hoy"
    >
      <div className="space-y-6">
        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, cédula, # turno o falla..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-48">
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="text-xs bg-background">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los Estados</SelectItem>
                  <SelectItem value="FINALIZADO">Finalizados</SelectItem>
                  <SelectItem value="LISTO">Listo para Entrega</SelectItem>
                  <SelectItem value="DIAGNOSTICO">Con Diagnóstico</SelectItem>
                  <SelectItem value="EN_ATENCION">En Atención</SelectItem>
                  <SelectItem value="NO_ASISTIO">No Asistió</SelectItem>
                  <SelectItem value="REAGENDADO">Reagendados</SelectItem>
                  <SelectItem value="CANCELADO">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Registros: <strong className="text-foreground">{filteredHistorial.length}</strong>
            </span>
          </div>
        </div>

        {/* Historial Table for Desktop / Cards for Mobile */}
        <Card className="border border-border bg-card overflow-hidden">
          <CardContent className="p-0">
            {filteredHistorial.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <History className="h-10 w-10 mx-auto opacity-40" />
                <p className="text-sm font-semibold text-foreground">No se encontraron turnos en el historial</p>
                <p className="text-xs">Prueba ajustando los filtros o el texto de búsqueda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-16 font-bold"># Turno</TableHead>
                      <TableHead className="font-bold">Hora</TableHead>
                      <TableHead className="font-bold">Cliente & Contacto</TableHead>
                      <TableHead className="font-bold">Motivo / Falla</TableHead>
                      <TableHead className="font-bold">Mecánico</TableHead>
                      <TableHead className="font-bold">Estado</TableHead>
                      <TableHead className="font-bold">Diagnóstico</TableHead>
                      <TableHead className="font-bold">Calificación</TableHead>
                      <TableHead className="text-right font-bold">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistorial.map((t) => {
                      const c = clientes.find((cli) => cli.id === t.clienteId);
                      const m = mecanicos.find((mec) => mec.id === (t.mecanicoAsignadoId || t.mecanicoPreferidoId));
                      const diag = diagnosticos.find((d) => d.turnoId === t.id);
                      const cal = calificaciones.find((cali) => cali.turnoId === t.id);

                      return (
                        <TableRow key={t.id} className="hover:bg-muted/30">
                          <TableCell className="font-display font-black text-primary text-sm">
                            #{formatNumero(t.numero)}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                            {formatHora(t.horaProgramada)}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              <p className="font-semibold text-xs text-foreground leading-none">{c?.nombre}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{c?.identificacion}</p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="text-xs text-foreground/90 truncate" title={t.problema}>
                              {t.problema}
                            </p>
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {m ? m.nombre.split(" ")[0] : <span className="text-muted-foreground italic">Auto</span>}
                          </TableCell>
                          <TableCell>
                            <EstadoBadge estado={t.estado} size="sm" />
                          </TableCell>
                          <TableCell>
                            {diag ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-cyan-700 dark:text-cyan-300 font-medium">
                                <Stethoscope className="h-3 w-3" /> Registrado
                              </span>
                            ) : (
                              <span className="text-[11px] text-muted-foreground italic">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {cal ? (
                              <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-bold text-foreground">{cal.estrellas}.0</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground italic">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTurnoDetalle(t)}
                              className="h-8 gap-1 text-xs text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Ver</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details View Modal */}
      {selectedTurnoDetalle && selectedCliente && (
        <Dialog open={!!selectedTurnoDetalle} onOpenChange={(open) => !open && setSelectedTurnoDetalle(null)}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DialogTitle className="font-display text-2xl font-black text-foreground">
                    Detalle del Turno #{formatNumero(selectedTurnoDetalle.numero)}
                  </DialogTitle>
                  <EstadoBadge estado={selectedTurnoDetalle.estado} size="sm" />
                </div>
              </div>
              <DialogDescription className="text-xs">
                Registrado a las {formatHora(selectedTurnoDetalle.creadoEn)} • Horario programado: {formatHora(selectedTurnoDetalle.horaProgramada)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Client and Mechanic Row */}
              <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-lg border border-border text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Cliente:</span>
                  <p className="font-bold text-foreground">{selectedCliente.nombre}</p>
                  <p className="text-muted-foreground font-mono">{selectedCliente.identificacion} • {selectedCliente.celular}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Técnico Responsable:</span>
                  <p className="font-bold text-foreground">{selectedMecanico?.nombre || "Asignación Automática"}</p>
                </div>
              </div>

              {/* Problem */}
              <div className="bg-muted/20 p-3 rounded-lg border border-border text-xs space-y-1">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Motivo de Ingreso:</span>
                <p className="text-foreground/90 font-medium">{selectedTurnoDetalle.problema}</p>
              </div>

              {/* Diagnosis if exists */}
              {selectedDiagnostico && (
                <DiagnosticoCard
                  diagnostico={selectedDiagnostico}
                  mecanico={selectedMecanico}
                />
              )}

              {/* Rating if exists */}
              {selectedCalificacion && (
                <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      Calificación del Cliente ({selectedCalificacion.estrellas}/5 estrellas)
                    </span>
                    <span className="text-muted-foreground text-[10px]">{formatHora(selectedCalificacion.fecha)}</span>
                  </div>
                  {selectedCalificacion.comentario && (
                    <p className="italic text-foreground/90 pt-1">"{selectedCalificacion.comentario}"</p>
                  )}
                </div>
              )}

              {/* Transition History */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Historial de Cambios de Estado:
                </span>
                <div className="space-y-1">
                  {selectedTurnoDetalle.historial.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-none">
                      <div className="flex items-center gap-2">
                        <EstadoBadge estado={h.estado} size="sm" showIcon={false} />
                        {h.nota && <span className="text-muted-foreground italic text-[11px]">{h.nota}</span>}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{formatHora(h.fecha)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </MecanicoLayout>
  );
}
