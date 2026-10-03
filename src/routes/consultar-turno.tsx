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
import { formatearPlaca, validarPlaca } from "@/utils/validators";
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
  History,
  FileText,
  BadgeCheck,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { formatHora, formatNumero, formatFecha } from "@/utils/format";

export const Route = createFileRoute("/consultar-turno")({
  validateSearch: (search: Record<string, unknown>): { numero?: string | undefined; placa?: string | undefined; id?: string | undefined } => {
    const num = search["numero"];
    const placa = search["placa"];
    const id = search["id"];
    return {
      numero: typeof num === "string" ? num : undefined,
      placa: typeof placa === "string" ? placa : undefined,
      id: typeof id === "string" ? id : undefined,
    };
  },
  component: ConsultarTurnoPage,
});

function ConsultarTurnoPage() {
  const { numero: searchNumero, placa: searchPlaca, id: searchId } = Route.useSearch();
  const { 
    turnos, 
    clientes, 
    mecanicos, 
    notificaciones, 
    calificaciones, 
    actions,
    getDiagnosticos
  } = useTurnos();
  const navigate = useNavigate();

  const [numeroInput, setNumeroInput] = useState(searchNumero || "");
  const [placaInput, setPlacaInput] = useState(searchPlaca || searchId || "");
  const [turnoEncontrado, setTurnoEncontrado] = useState<Turno | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search if params are present in URL
  useEffect(() => {
    const term = searchPlaca || searchId;
    if (searchNumero && term) {
      setNumeroInput(searchNumero);
      setPlacaInput(term);
      ejecutarBusqueda(searchNumero, term);
    }
  }, [searchNumero, searchPlaca, searchId, turnos]);

  const ejecutarBusqueda = (numStr: string, placaOrId: string) => {
    const num = parseInt(numStr, 10);
    if (isNaN(num) || !placaOrId.trim()) {
      setTurnoEncontrado(null);
      setHasSearched(true);
      return;
    }

    const t = actions.buscarTurno(num, placaOrId.trim());
    setTurnoEncontrado(t || null);
    setHasSearched(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroInput.trim() || !placaInput.trim()) {
      toast.error("Por favor ingresa el número de turno y la placa de tu vehículo.");
      return;
    }

    navigate({
      to: "/consultar-turno",
      search: {
        numero: numeroInput.trim(),
        placa: placaInput.trim().toUpperCase(),
      },
    });

    ejecutarBusqueda(numeroInput.trim(), placaInput.trim());
  };

  const handlePlacaChange = (val: string) => {
    setPlacaInput(formatearPlaca(val));
  };

  // Matched objects for the found shift
  const cliente = turnoEncontrado ? clientes.find((c) => c.id === turnoEncontrado.clienteId) : undefined;
  const mecanico = turnoEncontrado ? mecanicos.find((m) => m.id === (turnoEncontrado.mecanicoAsignadoId || turnoEncontrado.mecanicoPreferidoId)) : undefined;
  const listaDiagnosticos = turnoEncontrado ? getDiagnosticos(turnoEncontrado.id) : [];
  const notifs = turnoEncontrado ? notificaciones.filter((n) => n.turnoId === turnoEncontrado.id) : [];
  const calificacion = turnoEncontrado ? calificaciones.find((c) => c.turnoId === turnoEncontrado.id) : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 py-8 sm:py-14">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              <Search className="h-3.5 w-3.5" />
              <span>Consulta de Estado en Tiempo Real</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
              Consultar Estado de mi Turno
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Ingresa tu número de turno y la placa del vehículo para verificar el avance técnico y saber cuándo retirar tu auto.
            </p>
          </div>

          {/* Search Card */}
          <Card className="border border-border/80 shadow-lg bg-card">
            <CardContent className="p-5 sm:p-6">
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="num" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>Número de Turno *</span>
                    </Label>
                    <Input
                      id="num"
                      type="number"
                      min="1"
                      required
                      placeholder="Ej. 1, 2, 24..."
                      value={numeroInput}
                      onChange={(e) => setNumeroInput(e.target.value)}
                      className="font-mono text-sm h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="placa" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
                      <Car className="h-3.5 w-3.5 text-primary" />
                      <span>Placa del Vehículo *</span>
                    </Label>
                    <Input
                      id="placa"
                      required
                      placeholder="Ej. PBX-1024 o ABC1234"
                      value={placaInput}
                      onChange={(e) => handlePlacaChange(e.target.value)}
                      maxLength={8}
                      className="font-mono text-sm uppercase font-bold tracking-wider h-11"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  {/* Quick test buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground/80">Probar con datos mock:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNumeroInput("1");
                        setPlacaInput("PBX-1024");
                        ejecutarBusqueda("1", "PBX-1024");
                      }}
                      className="rounded-md bg-muted px-2.5 py-1 font-mono text-foreground font-medium hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer border border-border"
                    >
                      #001 (PBX-1024)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNumeroInput("3");
                        setPlacaInput("PCD-3382");
                        ejecutarBusqueda("3", "PCD-3382");
                      }}
                      className="rounded-md bg-muted px-2.5 py-1 font-mono text-foreground font-medium hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer border border-border"
                    >
                      #003 (PCD-3382)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNumeroInput("5");
                        setPlacaInput("ABC-1234");
                        ejecutarBusqueda("5", "ABC-1234");
                      }}
                      className="rounded-md bg-muted px-2.5 py-1 font-mono text-foreground font-medium hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer border border-border"
                    >
                      #005 (ABC-1234)
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full sm:w-auto min-h-[44px] px-6 gap-2 bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-md"
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
                  {/* Vehicle Ready Alert Banner if status is LISTO or FINALIZADO */}
                  {(turnoEncontrado.estado === "LISTO" || turnoEncontrado.estado === "FINALIZADO") && (
                    <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-200 flex items-start gap-3 shadow-md">
                      <BadgeCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm sm:text-base">
                          {turnoEncontrado.estado === "LISTO" 
                            ? "¡Tu vehículo está LISTO para ser retirado!"
                            : "¡Servicio Finalizado y Entregado!"}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {turnoEncontrado.estado === "LISTO"
                            ? "El mantenimiento técnico ha concluido. Puedes acercarte a la caja/recepción del taller para retirar las llaves."
                            : "Agradecemos tu preferencia. Por favor tómate un momento para calificar la atención de nuestro equipo."}
                        </p>
                      </div>
                    </div>
                  )}

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
                        <p className="text-xs text-zinc-300 flex items-center gap-2">
                          <span>Hora de solicitud: <strong className="text-white">{formatHora(turnoEncontrado.creadoEn)}</strong></span>
                          <span>•</span>
                          <span>Última modif: <strong className="text-white">{formatHora(turnoEncontrado.updatedAt)}</strong></span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Vehículo & Placa</p>
                        <p className="font-mono text-xl font-black text-primary">{turnoEncontrado.placa}</p>
                        <p className="text-xs font-semibold text-white">{cliente.nombre}</p>
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
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

                        <div className="rounded-lg bg-muted/40 p-3.5 border border-border space-y-1">
                          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <History className="h-3.5 w-3.5 text-primary" />
                            <span>Última Actualización</span>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-foreground">
                            {formatHora(turnoEncontrado.updatedAt)} ({formatFecha(turnoEncontrado.updatedAt)})
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Multiple Diagnostics Section */}
                  {listaDiagnosticos.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <span>Diagnósticos Técnicos Registrados ({listaDiagnosticos.length})</span>
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {listaDiagnosticos.map((diag, index) => (
                          <div key={diag.id} className="relative">
                            <div className="text-[11px] font-bold uppercase text-primary mb-1 flex items-center gap-1">
                              <span>Informe #{index + 1}</span>
                              <span className="text-muted-foreground">• {formatHora(diag.fecha)}</span>
                            </div>
                            <DiagnosticoCard diagnostico={diag} mecanico={mecanico} />
                          </div>
                        ))}
                      </div>
                    </div>
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
                      <span className="text-xs text-muted-foreground font-medium">
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
                    Verifica que el número de turno y la placa de tu vehículo coincidan con los datos de registro.
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    <Link to="/solicitar-turno">
                      <Button className="gap-1.5 bg-primary text-primary-foreground text-xs font-bold min-h-[42px]">
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
