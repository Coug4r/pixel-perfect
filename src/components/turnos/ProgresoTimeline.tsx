import type { EstadoTurno, HistorialEstado } from "@/types";
import { Check, Clock, AlertTriangle, XCircle, Wrench, Calendar, Stethoscope, CheckCircle2, UserCheck } from "lucide-react";
import { formatHora } from "@/utils/format";

interface ProgresoTimelineProps {
  estado: EstadoTurno;
  historial?: HistorialEstado[];
  className?: string;
}

const PASOS = [
  { id: "AGENDADO", label: "Agendado", icon: Calendar, desc: "Turno registrado" },
  { id: "EN_ESPERA", label: "En Espera", icon: Clock, desc: "Próximo a ingresar" },
  { id: "EN_ATENCION", label: "En Atención", icon: Wrench, desc: "Vehículo en bahía" },
  { id: "DIAGNOSTICO", label: "Diagnóstico", icon: Stethoscope, desc: "Inspección técnica" },
  { id: "LISTO", label: "Listo", icon: CheckCircle2, desc: "Para retirar" },
];

export function ProgresoTimeline({ estado, historial = [], className = "" }: ProgresoTimelineProps) {
  // Determine active step index:
  // AGENDADO, REAGENDADO -> 0
  // EN_ESPERA, LLAMADO -> 1
  // EN_ATENCION -> 2
  // DIAGNOSTICO -> 3
  // LISTO -> 4
  // FINALIZADO -> 5 (all complete)
  // NO_ASISTIO, CANCELADO -> special status

  const isCancelled = estado === "CANCELADO";
  const isNoShow = estado === "NO_ASISTIO";
  const isFinalized = estado === "FINALIZADO";

  const getStepIndex = (st: EstadoTurno) => {
    switch (st) {
      case "AGENDADO":
      case "REAGENDADO":
        return 0;
      case "EN_ESPERA":
      case "LLAMADO":
        return 1;
      case "EN_ATENCION":
        return 2;
      case "DIAGNOSTICO":
        return 3;
      case "LISTO":
        return 4;
      case "FINALIZADO":
        return 5;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(estado);

  // Map each step with matching timestamp from history if available
  const getStepTime = (stepId: string) => {
    const item = historial.find((h) => {
      if (stepId === "AGENDADO") return h.estado === "AGENDADO" || h.estado === "REAGENDADO";
      if (stepId === "EN_ESPERA") return h.estado === "EN_ESPERA" || h.estado === "LLAMADO";
      return h.estado === stepId;
    });
    return item ? formatHora(item.fecha) : null;
  };

  if (isCancelled || isNoShow) {
    return (
      <div className={`rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:p-6 text-center ${className}`}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
          {isCancelled ? <XCircle className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
        </div>
        <h4 className="font-display text-lg font-bold text-destructive">
          {isCancelled ? "Turno Cancelado" : "No Asistió a la Cita"}
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          {isCancelled
            ? "Este turno ha sido cancelado. Puedes solicitar un nuevo turno para el mismo día desde la página principal."
            : "No se registró tu asistencia en el horario agendado. Comunícate con el taller para reactivar o reagendar tu turno."}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Desktop & Tablet horizontal timeline */}
      <div className="relative hidden sm:block">
        {/* Progress connecting line */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-border -z-0">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(100, Math.max(0, (currentIndex / (PASOS.length - 1)) * 100))}%`,
            }}
          />
        </div>

        <div className="relative z-10 grid grid-cols-5 gap-2">
          {PASOS.map((step, idx) => {
            const isCompleted = currentIndex > idx || isFinalized;
            const isCurrent = currentIndex === idx && !isFinalized;
            const time = getStepTime(step.id);
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center text-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : isCurrent
                      ? "border-primary bg-background text-primary ring-4 ring-primary/20 animate-pulse"
                      : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 stroke-[2.5]" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>

                <div className="mt-2.5 space-y-0.5">
                  <p
                    className={`text-xs font-bold leading-tight ${
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground hidden md:block">
                    {step.desc}
                  </p>
                  {time && (
                    <span className="inline-block rounded bg-muted/80 px-1.5 py-0.2 text-[10px] font-medium text-foreground/80">
                      {time}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile vertical timeline */}
      <div className="space-y-3 sm:hidden">
        {PASOS.map((step, idx) => {
          const isCompleted = currentIndex > idx || isFinalized;
          const isCurrent = currentIndex === idx && !isFinalized;
          const time = getStepTime(step.id);
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                    ? "border-primary bg-background text-primary ring-2 ring-primary/20"
                    : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4 stroke-[2.5]" /> : <StepIcon className="h-3.5 w-3.5" />}
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className={`text-xs font-bold ${isCurrent ? "text-primary font-extrabold" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                </div>
                {time && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {time}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
