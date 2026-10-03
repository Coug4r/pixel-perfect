import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useTurnos } from "@/hooks/useTurnos";
import { EstadoBadge } from "@/components/turnos/EstadoBadge";
import { 
  Wrench, 
  Clock, 
  ShieldCheck, 
  Search, 
  PlusCircle, 
  LogIn, 
  CheckCircle2, 
  Users, 
  Sparkles, 
  MessageSquare, 
  Star, 
  Car, 
  ArrowRight,
  TrendingUp,
  Award,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatHora, formatNumero } from "@/utils/format";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { turnos, mecanicos, clientes, calificaciones } = useTurnos();

  // Calculate live stats for today
  const totalHoy = turnos.length;
  const enAtencionHoy = turnos.filter((t) => ["EN_ATENCION", "DIAGNOSTICO", "LISTO"].includes(t.estado)).length;
  const finalizadosHoy = turnos.filter((t) => t.estado === "FINALIZADO").length;
  const pendientesHoy = turnos.filter((t) => ["AGENDADO", "EN_ESPERA", "LLAMADO", "REAGENDADO"].includes(t.estado)).length;

  const promedioEstrellas = calificaciones.length
    ? (calificaciones.reduce((acc, c) => acc + c.estrellas, 0) / calificaciones.length).toFixed(1)
    : "5.0";

  // Last 5 active shifts for the live board
  const turnosRecientes = [...turnos]
    .filter((t) => t.estado !== "CANCELADO")
    .slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border bg-hero py-16 sm:py-24 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.15),transparent_60%)] pointer-events-none" />
          
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headline & CTAs */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/20 px-3.5 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-xs">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Atención Automotriz Inmediata — Solo para Hoy</span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-none">
                  Gestión Inteligente de <span className="text-primary">Turnos en Taller</span>
                </h1>

                <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                  Solicita tu turno en segundos, elige tu mecánico de confianza o ingresa a la cola general por estricto orden de llegada. Sigue el diagnóstico y estado de tu auto en tiempo real.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <Link to="/solicitar-turno" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full gap-2 bg-primary text-primary-foreground font-black text-base shadow-elevated hover:bg-primary/90 h-12 px-6">
                      <PlusCircle className="h-5 w-5 stroke-[2.5]" />
                      <span>Solicitar Turno Ahora</span>
                    </Button>
                  </Link>

                  <Link to="/consultar-turno" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full gap-2 border-zinc-600 bg-zinc-900/60 text-white hover:bg-zinc-800 hover:text-white h-12 px-6">
                      <Search className="h-5 w-5" />
                      <span>Consultar mi Turno</span>
                    </Button>
                  </Link>

                  <Link to="/mecanico/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="ghost" className="w-full gap-2 text-zinc-400 hover:text-white hover:bg-white/10 h-12 px-4 text-xs font-semibold">
                      <LogIn className="h-4 w-4" />
                      <span>Portal Mecánico</span>
                    </Button>
                  </Link>
                </div>

                {/* Quick features pill */}
                <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Sin registro previo
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-amber-400" /> Orden de llegada transparente
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-cyan-400" /> Avisos en tiempo real
                  </span>
                </div>
              </div>

              {/* Right Column: Live Workshop Shift Board Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-white/15 bg-zinc-950/80 p-5 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="font-display text-base font-bold text-white tracking-wide">
                        PANEL EN VIVO DEL TALLER
                      </h3>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-primary/50 text-primary">
                      Actualizado
                    </Badge>
                  </div>

                  {/* Metrics strip */}
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="rounded-lg bg-white/5 p-2.5 border border-white/5">
                      <p className="text-xl font-black text-primary font-display">{totalHoy}</p>
                      <p className="text-[10px] uppercase font-bold text-zinc-400">Total Hoy</p>
                    </div>
                    <div className="rounded-lg bg-white/5 p-2.5 border border-white/5">
                      <p className="text-xl font-black text-indigo-400 font-display">{enAtencionHoy}</p>
                      <p className="text-[10px] uppercase font-bold text-zinc-400">En Bahía</p>
                    </div>
                    <div className="rounded-lg bg-white/5 p-2.5 border border-white/5">
                      <p className="text-xl font-black text-emerald-400 font-display">{finalizadosHoy}</p>
                      <p className="text-[10px] uppercase font-bold text-zinc-400">Listos/Entregados</p>
                    </div>
                  </div>

                  {/* List of recent shifts */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Turnos activos en cola:
                    </p>
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {turnosRecientes.map((t) => {
                        const cliente = clientes.find((c) => c.id === t.clienteId);
                        const mec = mecanicos.find((m) => m.id === (t.mecanicoAsignadoId || t.mecanicoPreferidoId));
                        return (
                          <div
                            key={t.id}
                            className="flex items-center justify-between rounded-lg bg-white/5 p-2 text-xs border border-white/5 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-display font-black text-primary text-sm">
                                #{formatNumero(t.numero)}
                              </span>
                              <div>
                                <p className="font-semibold text-white leading-none">
                                  {cliente?.nombre.split(" ")[0]} {cliente?.nombre.split(" ")[1]?.[0]}.
                                </p>
                                <p className="text-[10px] text-zinc-400 mt-0.5">
                                  {mec ? `Técnico: ${mec.nombre.split(" ")[0]}` : "Cola General"} • {formatHora(t.horaProgramada)}
                                </p>
                              </div>
                            </div>
                            <EstadoBadge estado={t.estado} size="sm" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">¿Ya tienes un turno asignado?</span>
                    <Link to="/consultar-turno" className="text-primary font-bold hover:underline inline-flex items-center gap-1">
                      Consultar aquí <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-card/40 border-b border-border">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="outline" className="mb-2 text-primary border-primary/30">
                Flujo Simplificado
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
                ¿Cómo funciona el Sistema de Turnos?
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Un proceso ágil diseñado para ahorrarte tiempo sin esperas innecesarias en el taller.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1 */}
              <Card className="border-border bg-card hover:border-primary/40 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-display font-black text-xl">
                    01
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">1. Solicita tu Turno</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ingresa tus datos y describe la falla de tu auto. Elige un mecánico de confianza o déjalo sin preferencia para asignación automática.
                  </p>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="border-border bg-card hover:border-primary/40 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-display font-black text-xl">
                    02
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">2. Orden de Llegada</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tu turno ingresa a la cola respetando estrictamente la hora de registro. Podrás ver en vivo cuántos autos faltan antes de ti.
                  </p>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="border-border bg-card hover:border-primary/40 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-display font-black text-xl">
                    03
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">3. Diagnóstico Técnico</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    El mecánico inspecciona tu vehículo y registra el diagnóstico, trabajos requeridos y recomendaciones en el sistema al instante.
                  </p>
                </CardContent>
              </Card>

              {/* Step 4 */}
              <Card className="border-border bg-card hover:border-primary/40 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-display font-black text-xl">
                    04
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">4. Retiro y Calificación</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Recibes la confirmación de vehículo listo para retirar y puedes calificar la atención brindada por el mecánico de 1 a 5 estrellas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Mechanics Team Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <Badge variant="outline" className="mb-2 text-primary border-primary/30">
                  Equipo Especializado
                </Badge>
                <h2 className="font-display text-3xl font-black uppercase tracking-tight text-foreground">
                  Nuestros Mecánicos Disponibles
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Profesionales calificados para atender tu vehículo el día de hoy.
                </p>
              </div>

              <Link to="/solicitar-turno">
                <Button className="gap-2 bg-primary text-primary-foreground font-bold hover:bg-primary/90">
                  <PlusCircle className="h-4 w-4" />
                  Solicitar Turno con Mecánico
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mecanicos.map((mec) => {
                const turnosMec = turnos.filter((t) => t.mecanicoAsignadoId === mec.id);
                const califsMec = calificaciones.filter((c) => c.mecanicoId === mec.id);
                const rating = califsMec.length
                  ? (califsMec.reduce((acc, c) => acc + c.estrellas, 0) / califsMec.length).toFixed(1)
                  : "5.0";

                return (
                  <Card key={mec.id} className="border border-border hover:shadow-md transition-all">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary font-display font-black text-lg border border-primary/30">
                          {mec.iniciales}
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-bold text-foreground">
                            {mec.nombre}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span>{rating} / 5.0</span>
                            <span className="text-muted-foreground font-normal">({califsMec.length} reseñas)</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-border">
                        <div className="rounded bg-muted/50 p-2">
                          <p className="font-bold text-foreground">{turnosMec.length}</p>
                          <p className="text-[10px] text-muted-foreground">Turnos Hoy</p>
                        </div>
                        <div className="rounded bg-muted/50 p-2">
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">
                            {turnosMec.filter((t) => t.estado === "FINALIZADO").length}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Finalizados</p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Link to="/solicitar-turno" search={{ mecanico: mec.id }}>
                          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs border-border hover:bg-muted">
                            <Wrench className="h-3.5 w-3.5 text-primary" />
                            Elegir a {mec.nombre.split(" ")[0]}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
