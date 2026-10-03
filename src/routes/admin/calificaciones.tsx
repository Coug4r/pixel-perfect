import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { AdminSidebarLayout } from "@/components/layout/AdminSidebarLayout";
import { useTurnos } from "@/hooks/useTurnos";
import { 
  Star, 
  Search, 
  Filter, 
  Car, 
  User, 
  Wrench, 
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatNumero, formatHora, formatFecha } from "@/utils/format";

export const Route = createFileRoute("/admin/calificaciones")({
  component: () => (
    <ProtectedRoute rol="superadmin">
      <AdminCalificacionesPage />
    </ProtectedRoute>
  ),
});

function AdminCalificacionesPage() {
  const { calificaciones, turnos, clientes, mecanicos } = useTurnos();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMecanico, setSelectedMecanico] = useState<string>("all");
  const [selectedStars, setSelectedStars] = useState<string>("all");

  const totalReviews = calificaciones.length;
  const avgRating = totalReviews > 0
    ? (calificaciones.reduce((acc, c) => acc + c.estrellas, 0) / totalReviews).toFixed(1)
    : "5.0";

  // Enriched reviews with shift and client info
  const enrichedReviews = useMemo(() => {
    return calificaciones.map((cal) => {
      const turno = turnos.find((t) => t.id === cal.turnoId);
      const cliente = clientes.find((c) => c.id === turno?.clienteId);
      const mecanico = mecanicos.find((m) => m.id === cal.mecanicoId);

      return {
        ...cal,
        turno,
        cliente,
        mecanico,
        placa: turno?.placa || "N/A",
      };
    });
  }, [calificaciones, turnos, clientes, mecanicos]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return enrichedReviews.filter((r) => {
      const termClean = searchTerm.trim().toUpperCase().replace(/-/g, "");
      const plateClean = (r.placa || "").replace(/-/g, "").toUpperCase();

      const matchesSearch =
        searchTerm.trim() === "" ||
        plateClean.includes(termClean) ||
        (r.cliente?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.mecanico?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.comentario || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.turno ? String(r.turno.numero).includes(searchTerm.trim()) : false);

      const matchesMecanico =
        selectedMecanico === "all" || r.mecanicoId === selectedMecanico;

      const matchesStars =
        selectedStars === "all" || r.estrellas === parseInt(selectedStars, 10);

      return matchesSearch && matchesMecanico && matchesStars;
    });
  }, [enrichedReviews, searchTerm, selectedMecanico, selectedStars]);

  return (
    <AdminSidebarLayout
      title="Calificaciones y Reseñas de Clientes"
      subtitle="Evaluación de calidad y feedback directo de clientes post-atención (Acceso Exclusivo Superadmin)"
    >
      <div className="space-y-6">
        {/* Rating Overview Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-amber-500/30 bg-amber-500/[0.04]">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider block">
                  Promedio de Satisfacción
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display text-4xl font-black text-amber-500">{avgRating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Basado en {totalReviews} calificaciones
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Reseñas con Comentario
                </span>
                <span className="font-display text-4xl font-black text-foreground mt-1 block">
                  {calificaciones.filter((c) => c.comentario && c.comentario.trim().length > 0).length}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Opiniones escritas por clientes
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-foreground">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-emerald-500/30 bg-emerald-500/[0.04]">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                  5 Estrellas (Excelencia)
                </span>
                <span className="font-display text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {calificaciones.filter((c) => c.estrellas === 5).length}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Puntaje perfecto otorgado
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Buscar por Placa, Turno #, Cliente, Mecánico o Comentario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-xs sm:text-sm h-11"
                />
              </div>

              <div className="sm:col-span-3">
                <Select value={selectedMecanico} onValueChange={setSelectedMecanico}>
                  <SelectTrigger className="w-full text-xs h-11">
                    <SelectValue placeholder="Mecánico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">👨‍🔧 Todos los mecánicos</SelectItem>
                    {mecanicos.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-3">
                <Select value={selectedStars} onValueChange={setSelectedStars}>
                  <SelectTrigger className="w-full text-xs h-11">
                    <SelectValue placeholder="Estrellas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">⭐ Todas las calificaciones</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ (5 estrellas)</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ (4 estrellas)</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ (3 estrellas)</SelectItem>
                    <SelectItem value="2">⭐⭐ (2 estrellas)</SelectItem>
                    <SelectItem value="1">⭐ (1 estrella)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="space-y-3.5">
          {filteredReviews.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Star className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <h3 className="font-display text-lg font-bold text-foreground">
                No hay calificaciones que coincidan
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Ajusta los filtros de búsqueda o espera a que los clientes finalicen sus turnos.
              </p>
            </Card>
          ) : (
            filteredReviews.map((rev) => (
              <Card key={rev.id} className="border border-border bg-card shadow-xs hover:border-amber-500/40 transition-all">
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < rev.estrellas
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-display font-bold text-sm text-foreground">
                        {rev.estrellas}.0 / 5.0
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {rev.turno && (
                        <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          Turno #{formatNumero(rev.turno.numero)}
                        </span>
                      )}
                      <span className="font-mono font-bold bg-muted px-2 py-0.5 rounded border border-border">
                        {rev.placa}
                      </span>
                      <span>•</span>
                      <span>{formatFecha(rev.fecha)} {formatHora(rev.fecha)}</span>
                    </div>
                  </div>

                  {rev.comentario ? (
                    <p className="text-sm italic text-foreground/90 bg-muted/30 p-3 rounded-lg border border-border/50">
                      "{rev.comentario}"
                    </p>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">
                      (El cliente no dejó un comentario de texto)
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                    <div>
                      <span className="font-semibold text-foreground">Cliente: </span>
                      {rev.cliente?.nombre || "Cliente"}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Mecánico evaluado: </span>
                      {rev.mecanico ? `${rev.mecanico.nombre} (${rev.mecanico.iniciales})` : "Asignado"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
