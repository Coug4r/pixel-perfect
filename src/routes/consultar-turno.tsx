import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useTurnos } from "@/hooks/useTurnos";
import { EstadoBadge } from "@/components/turnos/EstadoBadge";
import { ProgresoTimeline } from "@/components/turnos/ProgresoTimeline";
import { DiagnosticoCard } from "@/components/turnos/DiagnosticoCard";
import { NotificacionesChat } from "@/components/turnos/NotificacionesChat";
import { CalificacionForm } from "@/components/turnos/CalificacionForm";
import type { Turno } from "@/types";
import { 
  Search, 
  Clock, 
  User, 
  Wrench, 
  Car, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { formatHora, formatNumero } from "@/utils/format";

export const Route = createFileRoute("/consultar-turno")({
  validateSearch: (search: Record<string, unknown>): { numero?: string | undefined; id?: string | undefined } => {
    const num = search["numero"];
    const id = search["id"];
    return {
      numero: typeof num === "string" ? num : undefined,
      id: typeof id === "string" ? id : undefined,
    };
  },
  component: ConsultarTurnoPage,
});

function ConsultarTurnoPage() {
  const { numero: searchNumero, id: searchId } = Route.useSearch();
  const { 
    turnos, 
    clientes, 
    mecanicos, 
    diagnosticos, 
    notificaciones, 
    calificaciones, 
    actions 
  } = useTurnos();
  const navigate = useNavigate();

  const [numeroInput, setNumeroInput] = useState(searchNumero || "");
  const [identificacionInput, setIdentificacionInput] = useState(searchId || "");
  const [turnoEncontrado, setTurnoEncontrado] = useState<Turno | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search if params are present in URL
  useEffect(() => {
    if (searchNumero && searchId) {
      setNumeroInput(searchNumero);
      setIdentificacionInput(searchId);
      ejecutarBusqueda(searchNumero, searchId);
    }
  }, [searchNumero, searchId, turnos]);

  const ejecutarBusqueda = (numStr: string, idStr: string) => {
    const num = parseInt(numStr, 10);
    if (isNaN(num) || !idStr.trim()) {
      setTurnoEncontrado(null);
      setHasSearched(true);
      return;
    }

    const t = actions.buscarTurno(num, idStr.trim());
    setTurnoEncontrado(t || null);
    setHasSearched(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroInput.trim() || !identificacionInput.trim()) {
      toast.error("Por favor ingresa tanto el número de turno como tu cédula o pasaporte.");
      return;
    }

    navigate({
      to: "/consultar-turno",
      search: {
        numero: numeroInput.trim(),
        id: identificacionInput.trim().toUpperCase(),
      },
    });

    ejecutarBusqueda(numeroInput.trim(), identificacionInput.trim());
  };

  // Matched objects for the found shift
  const cliente = turnoEncontrado ? clientes.find((c) => c.id === turnoEncontrado.clienteId) : undefined;
  const mecanico = turnoEncontrado ? mecanicos.find((m) => m.id === (turnoEncontrado.mecanicoAsignadoId || turnoEncontrado.mecanicoPreferidoId)) : undefined;
  const diagnostico = turnoEncontrado ? diagnosticos.find((d) => d.turnoId === turnoEncontrado.id) : undefined;
  const notifs = turnoEncontrado ? notificaciones.filter((n) => n.turnoId === turnoEncontrado.id) : [];
  const calificacion = turnoEncontrado ? calificaciones.find((c) => c.turnoId === turnoEncontrado.id) : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Search className="h-3.5 w-3.5" />
              <span>Consulta Pública de Estado</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
              Consultar Estado de mi Turno
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Ingresa tu número de turno y cédula o pasaporte para ver en qué etapa se encuentra tu vehículo hoy.
            </p>
          </div>

          {/* Search Card */}
          <Card className="border border-border/80 shadow-md bg-card">
            <CardContent className="p-5 sm:p-6">
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="num" className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Número de Turno *
                    </Label>
                    <Input
                      id="num"
                      type="number"
                      min="1"
                      required
                      placeholder="Ej. 1, 2, 24..."
                      value={numeroInput}
                      onChange={(e) => setNumeroInput(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="id" className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Cédula o Pasaporte *
                    </Label>
                    <Input
                      id="id"
                      required
                      placeholder="Ej. 1712345678"
                      value={identificacionInput}
                      onChange={(e) => setIdentificacionInput(e.target.value)}
                      className="font-mono text-sm uppercase"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  {/* Quick test buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="font-medium">Probar con datos de muestra:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNumeroInput("1");
                        setIdentificacionInput("0848259792");
                        ejecutarBusqueda("1", "0848259792");
                      }}
                      className="rounded bg-muted px-2 py-0.5 font-mono text-foreground hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
                    >
                      #001 (Finalizado)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNumeroInput("3");
                        setIdentificacionInput("2338876234");
                        ejecutarBusqueda("3", "2338876234");
                      }}
                      className="rounded bg-muted px-2 py-0.5 font-mono text-foreground hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
                    >
                      #003 (Listo)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNumeroInput("5");
                        setIdentificacionInput("2118601299");
                        ejecutarBusqueda("5", "2118601299");
                      }}
                      className="rounded bg-muted px-2 py-0.5 font-mono text-foreground hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
                    >
                      #005 (En atención)
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                  >
                    <Search className="h-4 w-4" />
                    <span>Consultar Turno</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Search Result Section */}
          {hasSearched && (
            <div>
              {turnoEncontrado && cliente ? (
                <div className="space-y-6">
                  {/* Main Shift Status Card */}
                  <Card className="border-2 border-primary/40 shadow-lg bg-card overflow-hidden">
                    {/* Header Banner */}
                    <div className="bg-hero p-5 sm:p-6 text-white flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-display text-2xl sm:text-3xl font-black text-primary">
                            TURNO #{formatNumero(turnoEncontrado.numero)}
                          </span>
                          <EstadoBadge estado={turnoEncontrado.estado} size="default" />
                        </div>
                        <p className="text-xs text-zinc-300">
                          Hora programada: <strong className="text-white">{formatHora(turnoEncontrado.horaProgramada)}</strong> • Fecha: Hoy
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Cliente Registrado</p>
                        <p className="font-bold text-base text-white">{cliente.nombre}</p>
                        <p className="text-xs font-mono text-zinc-300">{cliente.identificacion}</p>
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-6">
                      {/* Step Progress Timeline */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Progreso del Servicio:
                        </h4>
                        <ProgresoTimeline
                          estado={turnoEncontrado.estado}
                          historial={turnoEncontrado.historial}
                          className="pt-2 pb-4"
                        />
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                        <div className="rounded-lg bg-muted/40 p-3.5 border border-border space-y-1">
                          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <Car className="h-3.5 w-3.5 text-primary" />
                            <span>Problema Reportado</span>
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-foreground">
                            {turnoEncontrado.problema}
                          </p>
                        </div>

                        <div className="rounded-lg bg-muted/40 p-3.5 border border-border space-y-1">
                          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <Wrench className="h-3.5 w-3.5 text-primary" />
                            <span>Técnico Responsable</span>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-foreground">
                            {mecanico
                              ? `${mecanico.nombre} (${mecanico.iniciales})`
                              : "Asignación automática según disponibilidad"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Diagnosis Component (if available) */}
                  {diagnostico && (
                    <DiagnosticoCard diagnostico={diagnostico} mecanico={mecanico} />
                  )}

                  {/* Rating Component (if FINALIZADO) */}
                  {turnoEncontrado.estado === "FINALIZADO" && (
                    <CalificacionForm
                      turnoId={turnoEncontrado.id}
                      mecanico={mecanico}
                      calificacionExistente={calificacion}
                      onSubmit={(estrellas, comentario) => {
                        actions.calificar(turnoEncontrado.id, estrellas, comentario);
                      }}
                    />
                  )}

                  {/* Simulated WhatsApp Notifications Center */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                        <span>Avisos del Taller para este Turno</span>
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {notifs.length} mensaje{notifs.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <NotificacionesChat
                      notificaciones={notifs}
                      clienteNombre={cliente.nombre}
                    />
                  </div>
                </div>
              ) : (
                /* Not Found Card */
                <Card className="border-destructive/30 bg-destructive/5 text-center p-8">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    No se encontró ningún turno
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                    Verifica que el número de turno y tu cédula o pasaporte coincidan exactamente con los datos ingresados al solicitar el turno.
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    <Link to="/solicitar-turno">
                      <Button className="gap-1.5 bg-primary text-primary-foreground text-xs font-bold">
                        Solicitar Nuevo Turno
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
