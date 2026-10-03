import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { useTurnos } from "@/hooks/useTurnos";
import { EstadoBadge } from "@/components/turnos/EstadoBadge";
import { 
  Wrench, 
  Clock, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  Sparkles, 
  Star, 
  Car, 
  ArrowRight,
  Radio,
  Timer,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatHora, formatNumero } from "@/utils/format";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { turnos, mecanicos, calificaciones } = useTurnos();

  // Public shift streams
  const turnoEnAtencion = turnos.find((t) => t.estado === "EN_ATENCION");
  const proximoTurno = turnos.find((t) => ["AGENDADO", "EN_ESPERA", "LLAMADO"].includes(t.estado));
  const turnosEnCola = turnos.filter(
    (t) => ["AGENDADO", "EN_ESPERA", "LLAMADO", "REAGENDADO"].includes(t.estado) && t.id !== proximoTurno?.id
  );

  const totalAtendidos = turnos.filter((t) => t.estado === "FINALIZADO").length;

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border bg-hero py-14 sm:py-20 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.15),transparent_60%)] pointer-events-none" />
          
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/20 px-4 py-1.5 text-xs font-semibold text-primary-foreground backdrop-blur-xs shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Atención Automotriz Inmediata • Sin Cuenta Previa</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-tight">
              Gestión Inteligente de <span className="text-primary">Turnos en Taller</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Solicita tu turno en segundos, elige tu mecánico de preferencia o ingresa a la cola general por estricto orden de llegada. Sigue el avance de tu auto en vivo.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <Link to="/solicitar-turno" className="w-full sm:w-auto">
                <Button size="lg" className="w-full min-h-[50px] gap-2.5 bg-primary text-primary-foreground font-black text-base shadow-lg hover:bg-primary/90 px-8">
                  <PlusCircle className="h-5 w-5 stroke-[2.5]" />
                  <span>Solicitar Turno Ahora</span>
                </Button>
              </Link>

              <Link to="/consultar-turno" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full min-h-[50px] gap-2.5 border-zinc-600 bg-zinc-900/80 text-white hover:bg-zinc-800 hover:text-white px-8">
                  <Search className="h-5 w-5" />
                  <span>Consultar mi Turno (Placa + Turno)</span>
                </Button>
              </Link>
            </div>

            {/* Quick highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Cero registros tediosos
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-400" /> Estricto orden de llegada
              </span>
              <span className="flex items-center gap-1.5">
                <Car className="h-4 w-4 text-cyan-400" /> Rastreo por Placa Vehicular
              </span>
            </div>
          </div>
        </section>

        {/* SECTION: Turnos en Vivo (Integrated Public Live Board) */}
        <section className="py-12 sm:py-16 bg-muted/30 border-b border-border">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                <span>Transmisión en Tiempo Real del Taller</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
                Turnos en Vivo
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Información pública de turnos para los clientes que esperan en sala o consultan desde su móvil.
              </p>
            </div>

            {/* Live Highlight Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Turno Actualmente en Atención */}
              <Card className="border-2 border-primary bg-card shadow-md overflow-hidden relative">
                <div className="bg-primary px-4 py-2 text-primary-foreground font-black text-xs uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="h-4 w-4" />
                    <span>Actualmente en Atención</span>
                  </span>
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                </div>
                <CardContent className="p-6">
                  {turnoEnAtencion ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">
                            Turno en Bahía
                          </span>
                          <span className="font-display text-4xl sm:text-5xl font-black text-primary">
                            #{formatNumero(turnoEnAtencion.numero)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">
                            Placa Vehicular
                          </span>
                          <span className="font-mono text-xl sm:text-2xl font-black bg-muted px-3 py-1 rounded-lg border border-border inline-block mt-1">
                            {turnoEnAtencion.placa}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
                        <div className="bg-muted/40 p-2.5 rounded-lg">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Mecánico:</span>
                          <span className="font-bold text-foreground">
                            {mecanicos.find((m) => m.id === turnoEnAtencion.mecanicoAsignadoId)?.nombre || "Asignado"}
                          </span>
                        </div>
                        <div className="bg-muted/40 p-2.5 rounded-lg">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Inicio:</span>
                          <span className="font-bold text-foreground font-mono">
                            {formatHora(turnoEnAtencion.horaProgramada)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-sm">No hay vehículo en atención activa ahora</p>
                      <p className="text-xs mt-0.5">El próximo vehículo será llamado en breve.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 2. Próximo Turno */}
              <Card className="border-2 border-amber-500/40 bg-card shadow-md overflow-hidden">
                <div className="bg-amber-500 px-4 py-2 text-white font-black text-xs uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Timer className="h-4 w-4" />
                    <span>Próximo Turno a Ingresar</span>
                  </span>
                  <Badge variant="outline" className="text-[10px] border-white text-white font-bold">
                    Siguiente
                  </Badge>
                </div>
                <CardContent className="p-6">
                  {proximoTurno ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">
                            Número de Turno
                          </span>
                          <span className="font-display text-4xl sm:text-5xl font-black text-amber-600 dark:text-amber-400">
                            #{formatNumero(proximoTurno.numero)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">
                            Placa Vehicular
                          </span>
                          <span className="font-mono text-xl sm:text-2xl font-black bg-muted px-3 py-1 rounded-lg border border-border inline-block mt-1">
                            {proximoTurno.placa}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
                        <div className="bg-muted/40 p-2.5 rounded-lg">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Estado:</span>
                          <EstadoBadge estado={proximoTurno.estado} size="sm" />
                        </div>
                        <div className="bg-muted/40 p-2.5 rounded-lg">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Hora Solicitud:</span>
                          <span className="font-bold text-foreground font-mono">
                            {formatHora(proximoTurno.horaProgramada)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                      <p className="font-semibold text-sm">Cola al día</p>
                      <p className="text-xs mt-0.5">No hay turnos pendientes en espera.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 3. Turnos en Cola (Public Listing) */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="py-4 px-6 border-b border-border/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Turnos Siguientes en Cola ({turnosEnCola.length})</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Listado público por orden de llegada (datos privados ocultos por seguridad)
                  </CardDescription>
                </div>
                <Link to="/consultar-turno">
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    <span>Consultar Mi Turno</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                {turnosEnCola.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4 italic">
                    No hay más turnos en espera en este momento.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {turnosEnCola.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display font-black text-primary text-base">
                            #{formatNumero(t.numero)}
                          </span>
                          <span className="font-mono font-bold text-xs bg-card px-2 py-0.5 rounded border border-border">
                            {t.placa}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                          <span>Hora: <strong className="text-foreground">{formatHora(t.horaProgramada)}</strong></span>
                          <EstadoBadge estado={t.estado} size="sm" showIcon={false} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-14 bg-card/40 border-b border-border">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <Badge variant="outline" className="mb-2 text-primary border-primary/30">
                Flujo Simplificado
              </Badge>
              <h2 className="font-display text-3xl font-black uppercase tracking-tight text-foreground">
                ¿Cómo funciona el Sistema?
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Un proceso ágil diseñado para ahorrarte tiempo sin esperas innecesarias en el taller.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-border bg-card">
                <CardContent className="p-5 space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-display font-black text-lg">
                    01
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground">1. Solicita tu Turno</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ingresa tus datos y la placa del auto. Elige un mecánico o cola general.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-5 space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-display font-black text-lg">
                    02
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground">2. Orden de Llegada</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tu turno se organiza respetando la hora de registro en la cola pública.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-5 space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-display font-black text-lg">
                    03
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground">3. Diagnóstico</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    El técnico revisa y emite los informes técnicos en el sistema.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-5 space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-display font-black text-lg">
                    04
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground">4. Retiro</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Verificas el estado "LISTO" con tu Placa y calificas el servicio.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Mechanics Team Section */}
        <section className="py-14 bg-background">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <Badge variant="outline" className="mb-2 text-primary border-primary/30">
                  Equipo Especializado
                </Badge>
                <h2 className="font-display text-3xl font-black uppercase tracking-tight text-foreground">
                  Nuestros Mecánicos
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Profesionales calificados para atender tu vehículo el día de hoy.
                </p>
              </div>

              <Link to="/solicitar-turno">
                <Button className="gap-2 bg-primary text-primary-foreground font-bold hover:bg-primary/90 text-xs min-h-[40px]">
                  <PlusCircle className="h-4 w-4" />
                  Solicitar Turno con Mecánico
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {mecanicos.map((mec) => {
                const turnosMec = turnos.filter((t) => t.mecanicoAsignadoId === mec.id);

                return (
                  <Card key={mec.id} className="border border-border hover:shadow-md transition-all">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary font-display font-black text-lg border border-primary/30">
                          {mec.iniciales}
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-bold text-foreground">
                            {mec.nombre}
                          </h3>
                          <p className="text-xs text-muted-foreground font-mono">
                            Técnico Automotriz
                          </p>
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

                      <div className="pt-1">
                        <Link to="/solicitar-turno" search={{ mecanico: mec.id }}>
                          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs border-border hover:bg-muted min-h-[36px]">
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

      {/* Floating WhatsApp Help Button for public view */}
      <WhatsAppButton />

      <Footer />
    </div>
  );
}

