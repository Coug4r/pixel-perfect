import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { AdminSidebarLayout } from "@/components/layout/AdminSidebarLayout";
import { useTurnos } from "@/hooks/useTurnos";
import { DetallesTurnoDialog } from "@/components/turnos/DetallesTurnoDialog";
import { EstadoBadge } from "@/components/turnos/EstadoBadge";
import type { Turno } from "@/types";
import { 
  History, 
  Search, 
  Filter, 
  Car, 
  User, 
  Wrench, 
  Calendar, 
  FileText, 
  Info,
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatNumero, formatHora, formatFecha } from "@/utils/format";

export const Route = createFileRoute("/admin/historial")({
  component: () => (
    <ProtectedRoute rol="superadmin">
      <AdminHistorialPage />
    </ProtectedRoute>
  ),
});

function AdminHistorialPage() {
  const { turnos, clientes, mecanicos, getDiagnosticos } = useTurnos();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMecanico, setSelectedMecanico] = useState<string>("all");
  const [selectedEstado, setSelectedEstado] = useState<string>("all");
  const [detallesModalTurno, setDetallesModalTurno] = useState<Turno | null>(null);

  // Filter turnos
  const filteredTurnos = useMemo(() => {
    return turnos.filter((t) => {
      const cliente = clientes.find((c) => c.id === t.clienteId);
      const mecanico = mecanicos.find((m) => m.id === t.mecanicoAsignadoId);
      const plateClean = (t.placa || "").replace(/-/g, "").toUpperCase();
      const termClean = searchTerm.trim().toUpperCase().replace(/-/g, "");

      // Search matching (Placa, Turno #, Cliente, Motivo, Fecha)
      const matchesSearch =
        searchTerm.trim() === "" ||
        plateClean.includes(termClean) ||
        String(t.numero).includes(searchTerm.trim()) ||
        (cliente?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente?.identificacion || "").includes(searchTerm.trim()) ||
        t.problema.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatFecha(t.creadoEn).toLowerCase().includes(searchTerm.toLowerCase());

      // Mechanic filter
      const matchesMecanico =
        selectedMecanico === "all" || t.mecanicoAsignadoId === selectedMecanico;

      // Estado filter
      const matchesEstado =
        selectedEstado === "all" || t.estado === selectedEstado;

      return matchesSearch && matchesMecanico && matchesEstado;
    });
  }, [turnos, clientes, mecanicos, searchTerm, selectedMecanico, selectedEstado]);

  return (
    <AdminSidebarLayout
      title="Historial General de Atenciones"
      subtitle="Registro histórico de turnos, intervenciones técnicas y auditoría de servicios"
    >
      <div className="space-y-6">
        {/* Filter Controls Bar */}
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search by plate, number, client */}
              <div className="sm:col-span-6 relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Buscar por Placa (ej. PBX-1024), Turno #, Cliente o Fecha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-xs sm:text-sm h-11"
                />
              </div>

              {/* Filter by Mechanic */}
              <div className="sm:col-span-3">
                <Select value={selectedMecanico} onValueChange={setSelectedMecanico}>
                  <SelectTrigger className="w-full text-xs h-11">
                    <SelectValue placeholder="Todos los mecánicos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los mecánicos</SelectItem>
                    {mecanicos.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by Estado */}
              <div className="sm:col-span-3">
                <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                  <SelectTrigger className="w-full text-xs h-11">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="FINALIZADO">FINALIZADO</SelectItem>
                    <SelectItem value="LISTO">LISTO</SelectItem>
                    <SelectItem value="DIAGNOSTICO">DIAGNOSTICO</SelectItem>
                    <SelectItem value="EN_ATENCION">EN ATENCIÓN</SelectItem>
                    <SelectItem value="EN_ESPERA">EN ESPERA</SelectItem>
                    <SelectItem value="AGENDADO">AGENDADO</SelectItem>
                    <SelectItem value="NO_ASISTIO">NO ASISTIÓ</SelectItem>
                    <SelectItem value="CANCELADO">CANCELADO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
              <span>Mostrando <strong>{filteredTurnos.length}</strong> de <strong>{turnos.length}</strong> registros</span>
              <span className="font-mono">Organizado por última modificación (updatedAt)</span>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card className="border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            {filteredTurnos.length === 0 ? (
              <div className="p-12 text-center">
                <History className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <h3 className="font-display text-lg font-bold text-foreground">
                  No se encontraron atenciones
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Intenta cambiar los filtros o el término de búsqueda.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-bold uppercase text-[10px] text-muted-foreground tracking-wider">
                    <th className="py-3.5 px-4">Turno</th>
                    <th className="py-3.5 px-4">Placa</th>
                    <th className="py-3.5 px-4">Cliente</th>
                    <th className="py-3.5 px-4">Mecánico</th>
                    <th className="py-3.5 px-4">Motivo / Problema</th>
                    <th className="py-3.5 px-4">Diagnósticos</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4">Fecha & Hora</th>
                    <th className="py-3.5 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTurnos.map((t) => {
                    const cliente = clientes.find((c) => c.id === t.clienteId);
                    const mecanico = mecanicos.find((m) => m.id === t.mecanicoAsignadoId);
                    const diags = getDiagnosticos(t.id);

                    return (
                      <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-black text-primary text-sm">
                          #{formatNumero(t.numero)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-xs bg-muted px-2 py-0.5 rounded border border-border">
                            {t.placa}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-foreground">{cliente?.nombre || "Cliente"}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{cliente?.identificacion}</p>
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground/90">
                          {mecanico ? mecanico.nombre : "Sin asignar"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground line-clamp-2 max-w-[200px]">
                          {t.problema}
                        </td>
                        <td className="py-3 px-4">
                          {diags.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                              <FileText className="h-3 w-3" />
                              <span>{diags.length} reg.</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">Sin diagn.</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <EstadoBadge estado={t.estado} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          <p className="font-semibold text-foreground">{formatHora(t.updatedAt)}</p>
                          <p className="text-[10px]">{formatFecha(t.creadoEn)}</p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDetallesModalTurno(t)}
                            className="text-xs gap-1 h-8"
                          >
                            <Info className="h-3.5 w-3.5" />
                            <span>Detalles</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      <DetallesTurnoDialog
        open={!!detallesModalTurno}
        onOpenChange={(open) => !open && setDetallesModalTurno(null)}
        turno={detallesModalTurno}
      />
    </AdminSidebarLayout>
  );
}
