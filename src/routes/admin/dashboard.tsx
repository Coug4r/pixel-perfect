import { createFileRoute, Link } from "@tanstack/react-router";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { AdminSidebarLayout } from "@/components/layout/AdminSidebarLayout";
import { useTurnos } from "@/hooks/useTurnos";
import { 
  Users, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Star, 
  FileText, 
  History, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  Car
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EstadoBadge } from "@/components/turnos/EstadoBadge";
import { formatNumero, formatHora, formatFecha } from "@/utils/format";

export const Route = createFileRoute("/admin/dashboard")({
  component: () => (
    <ProtectedRoute rol="superadmin">
      <AdminDashboardPage />
    </ProtectedRoute>
  ),
});

function AdminDashboardPage() {
  const { turnos, clientes, mecanicos, diagnosticos, calificaciones } = useTurnos();

  const finalizados = turnos.filter((t) => t.estado === "FINALIZADO");
  const enAtencion = turnos.filter((t) => ["EN_ATENCION", "DIAGNOSTICO", "LISTO"].includes(t.estado));
  const enEspera = turnos.filter((t) => ["AGENDADO", "EN_ESPERA", "REAGENDADO"].includes(t.estado));

  const totalReviews = calificaciones.length;
  const avgRating = totalReviews > 0
    ? (calificaciones.reduce((acc, c) => acc + c.estrellas, 0) / totalReviews).toFixed(1)
    : "5.0";

  return (
    <AdminSidebarLayout
      title="Dashboard de Superadministración"
      subtitle="Visión global del taller mecánico, estadísticas consolidadas y control operativo integral"
    >
      <div className="space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* 1. Total Turnos */}
          <Card className="border border-border bg-card shadow-xs">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Total Turnos Hoy</span>
                <Car className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-3">
                <p className="font-display text-3xl font-black text-foreground">{turnos.length}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Registrados en la jornada</p>
              </div>
            </CardContent>
          </Card>

          {/* 2. En Cola / Pendientes */}
          <Card className="border border-amber-500/30 bg-amber-500/[0.03] shadow-xs">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">En Cola</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-3">
                <p className="font-display text-3xl font-black text-amber-600 dark:text-amber-400">{enEspera.length}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Pendientes de atención</p>
              </div>
            </CardContent>
          </Card>

          {/* 3. En Bahía Técnica */}
          <Card className="border border-indigo-500/30 bg-indigo-500/[0.03] shadow-xs">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase">En Bahía</span>
                <Wrench className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="mt-3">
                <p className="font-display text-3xl font-black text-indigo-600 dark:text-indigo-400">{enAtencion.length}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">En proceso de reparación</p>
              </div>
            </CardContent>
          </Card>

          {/* 4. Finalizados */}
          <Card className="border border-emerald-500/30 bg-emerald-500/[0.03] shadow-xs">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">Finalizados</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-3">
                <p className="font-display text-3xl font-black text-emerald-600 dark:text-emerald-400">{finalizados.length}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Entregados con éxito</p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Calificación Global */}
          <Card className="border border-border bg-card shadow-xs">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Satisfacción</span>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <p className="font-display text-3xl font-black text-foreground">{avgRating}</p>
                  <span className="text-xs text-muted-foreground">/5.0</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{totalReviews} reseñas registradas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Portals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link to="/admin/historial" className="block group">
            <Card className="h-full border border-border bg-card hover:border-primary/60 transition-all hover:shadow-md">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <History className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="text-base font-bold text-foreground mt-3">
                  Historial de Atenciones
                </CardTitle>
                <CardDescription className="text-xs">
                  Consulta de auditoría y registros completos de todos los turnos atendidos y cancelados.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/calificaciones" className="block group">
            <Card className="h-full border border-border bg-card hover:border-primary/60 transition-all hover:shadow-md">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Star className="h-5 w-5 fill-amber-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="text-base font-bold text-foreground mt-3">
                  Calificaciones y Reseñas
                </CardTitle>
                <CardDescription className="text-xs">
                  Comentarios, estrellas de satisfacción y métricas de desempeño por técnico mecánico.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/diagnosticos" className="block group">
            <Card className="h-full border border-border bg-card hover:border-primary/60 transition-all hover:shadow-md">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="text-base font-bold text-foreground mt-3">
                  Registro de Diagnósticos
                </CardTitle>
                <CardDescription className="text-xs">
                  Histórico detallado de múltiples diagnósticos emitidos por placa y número de turno.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Live Workshop Overview Table */}
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="py-4 px-6 border-b border-border/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Turnos en Tiempo Real (Jornada Actual)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Organizados por última modificación (updatedAt descendente)
              </CardDescription>
            </div>
            <Link to="/admin/historial">
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <span>Ver Historial Completo</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 font-bold uppercase text-[10px] text-muted-foreground tracking-wider">
                  <th className="py-3 px-4">Turno</th>
                  <th className="py-3 px-4">Placa</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Mecánico</th>
                  <th className="py-3 px-4">Problema</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Última Modif.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {turnos.slice(0, 7).map((t) => {
                  const cliente = clientes.find((c) => c.id === t.clienteId);
                  const mecanico = mecanicos.find((m) => m.id === t.mecanicoAsignadoId);

                  return (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-black text-primary text-sm">
                        #{formatNumero(t.numero)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className="bg-muted px-2 py-0.5 rounded border border-border">
                          {t.placa}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {cliente?.nombre || "Cliente"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-medium">
                        {mecanico ? mecanico.nombre : "Sin asignar (Cola)"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground line-clamp-1 max-w-[200px]">
                        {t.problema}
                      </td>
                      <td className="py-3 px-4">
                        <EstadoBadge estado={t.estado} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono">
                        {formatHora(t.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AdminSidebarLayout>
  );
}
