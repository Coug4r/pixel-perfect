import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useTurnos } from "@/hooks/useTurnos";
import { validarIdentificacion, validarCelular } from "@/utils/validators";
import type { TipoIdentificacion, Turno } from "@/types";
import { 
  PlusCircle, 
  Wrench, 
  User, 
  Phone, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Car,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { EstadoBadge } from "@/components/turnos/EstadoBadge";
import { toast } from "sonner";
import { formatHora, formatNumero } from "@/utils/format";

export const Route = createFileRoute("/solicitar-turno")({
  validateSearch: (search: Record<string, unknown>): { mecanico?: string | undefined } => {
    const m = search["mecanico"];
    return {
      mecanico: typeof m === "string" ? m : undefined,
    };
  },
  component: SolicitarTurnoPage,
});

function SolicitarTurnoPage() {
  const { mecanico: initialMecanico } = Route.useSearch();
  const { mecanicos, actions } = useTurnos();
  const navigate = useNavigate();

  const [tipoIdentificacion, setTipoIdentificacion] = useState<TipoIdentificacion>("cedula");
  const [identificacion, setIdentificacion] = useState("");
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [problema, setProblema] = useState("");
  const [mecanicoPreferidoId, setMecanicoPreferidoId] = useState<string>(initialMecanico || "none");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnoCreado, setTurnoCreado] = useState<Turno | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Real-time visual validations
  const isIdentificacionValid = identificacion.trim().length > 0
    ? validarIdentificacion(tipoIdentificacion, identificacion.trim())
    : null;

  const isCelularValid = celular.trim().length > 0
    ? validarCelular(celular.trim())
    : null;

  const isFormValid =
    isIdentificacionValid === true &&
    nombre.trim().length >= 3 &&
    isCelularValid === true &&
    problema.trim().length >= 8;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIdentificacionValid) {
      toast.error(
        tipoIdentificacion === "cedula"
          ? "Por favor ingresa una cédula ecuatoriana válida (10 dígitos)."
          : "Por favor ingresa un pasaporte válido (6-9 caracteres alfanuméricos)."
      );
      return;
    }
    if (!isCelularValid) {
      toast.error("Por favor ingresa un número celular ecuatoriano válido (ej. 0991234567).");
      return;
    }
    if (problema.trim().length < 8) {
      toast.error("Por favor describe el problema del vehículo con mayor detalle.");
      return;
    }

    setIsSubmitting(true);
    try {
      const nuevoTurno = actions.crearTurno({
        tipoIdentificacion,
        identificacion: identificacion.trim(),
        nombre: nombre.trim(),
        celular: celular.trim(),
        problema: problema.trim(),
        mecanicoPreferidoId: mecanicoPreferidoId === "none" ? null : mecanicoPreferidoId,
      });

      setTurnoCreado(nuevoTurno);
      setShowConfirmModal(true);
      toast.success(`Turno #${formatNumero(nuevoTurno.numero)} creado exitosamente.`);
    } catch (err: any) {
      toast.error(err.message || "Error al registrar el turno.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mecSeleccionado = mecanicos.find((m) => m.id === mecanicoPreferidoId);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
              <Clock className="h-3.5 w-3.5" />
              <span>Atención para el Día de Hoy</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
              Solicitud de Turno en Taller
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Completa el formulario para ingresar a la cola de atención inmediata. No necesitas registrarte ni crear una cuenta.
            </p>
          </div>

          <Card className="border border-border/80 shadow-md bg-card">
            <CardHeader className="border-b border-border/60 py-4 px-6 bg-muted/20">
              <CardTitle className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                <span>Datos del Cliente y Vehículo</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Todos los campos marcados con (*) son obligatorios.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Tipo de Identificación & Identificación */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    1. Tipo de Identificación *
                  </Label>
                  <RadioGroup
                    value={tipoIdentificacion}
                    onValueChange={(val) => {
                      setTipoIdentificacion(val as TipoIdentificacion);
                      setIdentificacion("");
                    }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className="flex items-center space-x-2 rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors">
                      <RadioGroupItem value="cedula" id="cedula" />
                      <Label htmlFor="cedula" className="text-xs font-semibold cursor-pointer">
                        Cédula Ecuatoriana (10 dígitos)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors">
                      <RadioGroupItem value="pasaporte" id="pasaporte" />
                      <Label htmlFor="pasaporte" className="text-xs font-semibold cursor-pointer">
                        Pasaporte Extranjero
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="space-y-1.5 pt-1">
                    <Label htmlFor="identificacion" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Número de {tipoIdentificacion === "cedula" ? "Cédula" : "Pasaporte"} *
                    </Label>
                    <div className="relative">
                      <Input
                        id="identificacion"
                        required
                        value={identificacion}
                        onChange={(e) => setIdentificacion(e.target.value)}
                        placeholder={tipoIdentificacion === "cedula" ? "Ej. 1712345678" : "Ej. A1234567"}
                        maxLength={tipoIdentificacion === "cedula" ? 10 : 12}
                        className={`pr-9 font-mono text-sm ${
                          isIdentificacionValid === true
                            ? "border-emerald-500 focus-visible:ring-emerald-500"
                            : isIdentificacionValid === false
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                      />
                      <div className="absolute right-3 top-2.5 pointer-events-none">
                        {isIdentificacionValid === true && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        )}
                        {isIdentificacionValid === false && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </div>
                    {isIdentificacionValid === false && (
                      <p className="text-[11px] text-destructive font-medium">
                        {tipoIdentificacion === "cedula"
                          ? "Número de cédula ecuatoriana no válido."
                          : "Pasaporte no válido (debe tener entre 6 y 9 caracteres)."}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Nombre y Celular Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nombre" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span>Nombre Completo *</span>
                    </Label>
                    <Input
                      id="nombre"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Juan Carlos Pérez"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="celular" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      <span>Número de Celular *</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="celular"
                        required
                        value={celular}
                        onChange={(e) => setCelular(e.target.value)}
                        placeholder="Ej. 0991234567"
                        maxLength={13}
                        className={`pr-9 font-mono text-sm ${
                          isCelularValid === true
                            ? "border-emerald-500 focus-visible:ring-emerald-500"
                            : isCelularValid === false
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                      />
                      <div className="absolute right-3 top-2.5 pointer-events-none">
                        {isCelularValid === true && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        )}
                        {isCelularValid === false && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </div>
                    {isCelularValid === false && (
                      <p className="text-[11px] text-destructive font-medium">
                        Ingresa un formato celular válido (ej. 0991234567 o +593991234567).
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Problema del vehículo */}
                <div className="space-y-1.5">
                  <Label htmlFor="problema" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
                    <Car className="h-3.5 w-3.5 text-primary" />
                    <span>Detalle del Problema / Falla del Vehículo *</span>
                  </Label>
                  <Textarea
                    id="problema"
                    required
                    value={problema}
                    onChange={(e) => setProblema(e.target.value)}
                    placeholder="Describe qué le sucede al vehículo: ruidos al frenar, luz de check engine, fuga de fluidos, mantenimiento periódico, etc."
                    rows={3}
                    className="text-sm resize-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Sé lo más específico posible para que el técnico prepare la herramienta adecuada.
                  </p>
                </div>

                {/* 4. Mecánico de Preferencia */}
                <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/[0.03] p-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mecanico" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Wrench className="h-4 w-4 text-primary" />
                      <span>Mecánico de Preferencia (Opcional)</span>
                    </Label>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Mismo orden de llegada
                    </span>
                  </div>

                  <Select value={mecanicoPreferidoId} onValueChange={setMecanicoPreferidoId}>
                    <SelectTrigger id="mecanico" className="w-full bg-background">
                      <SelectValue placeholder="Seleccionar mecánico..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="font-semibold text-primary">
                        ⚡ Sin preferencia — Asignar al primer mecánico disponible
                      </SelectItem>
                      {mecanicos.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          Mecánico {m.nombre} ({m.iniciales})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {mecanicoPreferidoId === "none"
                      ? "Tu turno entrará en la cola general y será atendido por el primer técnico libre según tu hora de llegada."
                      : `Tu turno quedará asignado al técnico ${mecSeleccionado?.nombre || ""}, conservando su posición en la cola.`}
                  </p>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full h-12 text-base font-black uppercase tracking-wide gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>{isSubmitting ? "Registrando Turno..." : "Confirmar y Solicitar Turno"}</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Confirmation Modal */}
      {turnoCreado && (
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-center sm:text-left">
              <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-2">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <DialogTitle className="font-display text-2xl font-black text-foreground">
                ¡Turno #{formatNumero(turnoCreado.numero)} Creado Correctamente!
              </DialogTitle>
              <DialogDescription className="text-xs">
                Tu solicitud ha sido ingresada al sistema del taller para el día de hoy.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 border-y border-border">
              <div className="flex justify-between items-center bg-muted/40 p-3 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground font-medium">Número de Turno:</span>
                <span className="font-display text-2xl font-black text-primary">
                  #{formatNumero(turnoCreado.numero)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted/20 p-2.5 rounded-md border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Hora Solicitud:</span>
                  <span className="font-semibold text-foreground">{formatHora(turnoCreado.creadoEn)}</span>
                </div>
                <div className="bg-muted/20 p-2.5 rounded-md border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Estado:</span>
                  <EstadoBadge estado={turnoCreado.estado} size="sm" showIcon={false} />
                </div>
              </div>

              <div className="bg-muted/20 p-2.5 rounded-md border border-border text-xs space-y-1">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Asignación:</span>
                <span className="font-semibold text-foreground">
                  {turnoCreado.mecanicoAsignadoId
                    ? `Mecánico: ${mecanicos.find((m) => m.id === turnoCreado.mecanicoAsignadoId)?.nombre || "Asignado"}`
                    : "Asignación automática (Cola general)"}
                </span>
              </div>

              <div className="bg-muted/20 p-2.5 rounded-md border border-border text-xs space-y-1">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Cliente:</span>
                <span className="font-semibold text-foreground">{nombre} ({identificacion})</span>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowConfirmModal(false);
                  navigate({ to: "/" });
                }}
                className="w-full sm:w-auto text-xs"
              >
                Volver al Inicio
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  navigate({
                    to: "/consultar-turno",
                    search: {
                      numero: String(turnoCreado.numero),
                      id: identificacion.trim(),
                    },
                  });
                }}
                className="w-full sm:w-auto gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 text-xs"
              >
                <Search className="h-4 w-4" />
                <span>Consultar mi Turno</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
}
