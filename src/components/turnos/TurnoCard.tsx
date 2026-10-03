import type { Turno, Cliente, Mecanico, Diagnostico } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EstadoBadge } from "./EstadoBadge";
import { 
  Clock, 
  User, 
  Phone, 
  Car, 
  Wrench, 
  Sparkles, 
  Megaphone, 
  Stethoscope, 
  CheckCircle2, 
  UserX, 
  RotateCcw, 
  XCircle,
  Play,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { formatHora, formatNumero } from "@/utils/format";

interface TurnoCardProps {
  turno: Turno;
  cliente?: Cliente | undefined;
  mecanicoPreferido?: Mecanico | undefined;
  mecanicoAsignado?: Mecanico | undefined;
  diagnostico?: Diagnostico | undefined;
  currentMecanicoId?: string | undefined;
  isFirstInQueue?: boolean | undefined;
  onTomarTurno?: ((turnoId: string) => void) | undefined;
  onCambiarEstado?: ((turnoId: string, nuevoEstado: any) => void) | undefined;
  onAbrirDiagnostico?: ((turno: Turno) => void) | undefined;
  onAbrirReagendar?: ((turno: Turno) => void) | undefined;
  onVerDetalles?: ((turno: Turno) => void) | undefined;
  compact?: boolean | undefined;
}

export function TurnoCard({
  turno,
  cliente,
  mecanicoPreferido,
  mecanicoAsignado,
  diagnostico,
  currentMecanicoId,
  isFirstInQueue = false,
  onTomarTurno,
  onCambiarEstado,
  onAbrirDiagnostico,
  onAbrirReagendar,
  onVerDetalles,
  compact = false,
}: TurnoCardProps) {
  const isMine = currentMecanicoId && turno.mecanicoAsignadoId === currentMecanicoId;
  const isGeneralUnassigned = !turno.mecanicoAsignadoId;

  return (
    <Card className={`border transition-all duration-200 overflow-hidden ${
      isMine
        ? "border-primary/50 shadow-sm bg-card"
        : isGeneralUnassigned
        ? "border-amber-500/30 bg-amber-500/[0.02]"
        : "border-border bg-card/80 opacity-90"
    }`}>
      {/* Top Banner indicating Assignment Type */}
      <div className={`px-4 py-2 text-xs font-semibold flex items-center justify-between border-b ${
        isGeneralUnassigned
          ? "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20"
          : isMine
          ? "bg-primary/10 text-primary border-primary/20"
          : "bg-muted text-muted-foreground border-border"
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-sm text-foreground">
            TURNO #{formatNumero(turno.numero)}
          </span>
          {isGeneralUnassigned ? (
            <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-900 dark:text-amber-200">
              ⚡ Cola General — Sin Preferencia
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-foreground/80">
              <Wrench className="h-3 w-3 text-primary" />
              <span>Prefirió: <strong>{mecanicoPreferido?.nombre || "Asignado"}</strong></span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3.5 w-3.5 opacity-70" />
          <span>{formatHora(turno.horaProgramada)}</span>
        </div>
      </div>

      <CardContent className="p-4 sm:p-5 space-y-3.5">
        {/* Row 1: Client Info & Current State Badge */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-1.5">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{cliente?.nombre || "Cliente"}</span>
            </h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-mono">{cliente?.identificacion}</span>
              {cliente?.celular && (
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="h-3 w-3" />
                  {cliente.celular}
                </span>
              )}
            </div>
          </div>

          <EstadoBadge estado={turno.estado} size="default" />
        </div>

        {/* Row 2: Problem description */}
        <div className="rounded-lg bg-muted/40 p-3 text-xs sm:text-sm border border-border/70 space-y-1">
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <Car className="h-3.5 w-3.5 text-primary" />
            <span>Motivo de Ingreso / Falla Reportada</span>
          </div>
          <p className="text-foreground/90 font-medium leading-snug">
            {turno.problema}
          </p>
        </div>

        {/* Row 3: Diagnostic preview if exists */}
        {diagnostico && (
          <div className="rounded-lg bg-cyan-500/5 p-2.5 text-xs border border-cyan-500/20 space-y-0.5">
            <span className="font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1 text-[11px]">
              <Stethoscope className="h-3.5 w-3.5" /> Diagnóstico Registrado:
            </span>
            <p className="text-foreground/80 line-clamp-1 italic">
              {diagnostico.diagnostico}
            </p>
          </div>
        )}

        {/* Row 4: Action Buttons according to current state */}
        <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
          {/* Status-specific actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* If General Unassigned & Pending -> Take shift */}
            {isGeneralUnassigned && (turno.estado === "AGENDADO" || turno.estado === "REAGENDADO") && (
              <Button
                size="sm"
                onClick={() => onTomarTurno?.(turno.id)}
                className="gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
              >
                <Wrench className="h-4 w-4" />
                <span>Tomar Turno</span>
                {isFirstInQueue && (
                  <span className="rounded bg-black/20 px-1 text-[10px]">1° en cola</span>
                )}
              </Button>
            )}

            {/* If assigned to current mechanic */}
            {isMine && (
              <>
                {/* AGENDADO / REAGENDADO -> Marcar En Espera */}
                {(turno.estado === "AGENDADO" || turno.estado === "REAGENDADO") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCambiarEstado?.(turno.id, "EN_ESPERA")}
                    className="gap-1.5 border-amber-500/50 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Pasar a En Espera
                  </Button>
                )}

                {/* EN_ESPERA -> Llamar o Iniciar Atención */}
                {turno.estado === "EN_ESPERA" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCambiarEstado?.(turno.id, "LLAMADO")}
                      className="gap-1.5 border-orange-500/50 text-orange-700 dark:text-orange-300 hover:bg-orange-500/10"
                    >
                      <Megaphone className="h-3.5 w-3.5" />
                      Llamar Cliente
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onCambiarEstado?.(turno.id, "EN_ATENCION")}
                      className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Iniciar Atención
                    </Button>
                  </>
                )}

                {/* LLAMADO -> Iniciar Atención */}
                {turno.estado === "LLAMADO" && (
                  <Button
                    size="sm"
                    onClick={() => onCambiarEstado?.(turno.id, "EN_ATENCION")}
                    className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Iniciar Atención
                  </Button>
                )}

                {/* EN_ATENCION -> Registrar Diagnóstico */}
                {turno.estado === "EN_ATENCION" && (
                  <Button
                    size="sm"
                    onClick={() => onAbrirDiagnostico?.(turno)}
                    className="gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                  >
                    <Stethoscope className="h-3.5 w-3.5" />
                    Registrar Diagnóstico
                  </Button>
                )}

                {/* DIAGNOSTICO -> Marcar Listo o Editar */}
                {turno.estado === "DIAGNOSTICO" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onCambiarEstado?.(turno.id, "LISTO")}
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Vehículo Listo
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAbrirDiagnostico?.(turno)}
                      className="text-xs"
                    >
                      Editar Diagnóstico
                    </Button>
                  </>
                )}

                {/* LISTO -> Finalizar Atención */}
                {turno.estado === "LISTO" && (
                  <Button
                    size="sm"
                    onClick={() => onCambiarEstado?.(turno.id, "FINALIZADO")}
                    className="gap-1.5 bg-zinc-800 hover:bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 font-bold"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Finalizar y Entregar
                  </Button>
                )}

                {/* NO ASISTIO / REAGENDAR options */}
                {["AGENDADO", "EN_ESPERA", "LLAMADO"].includes(turno.estado) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onCambiarEstado?.(turno.id, "NO_ASISTIO")}
                    className="gap-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    No Asistió
                  </Button>
                )}

                {turno.estado === "NO_ASISTIO" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onAbrirReagendar?.(turno)}
                      className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reagendar Turno
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCambiarEstado?.(turno.id, "CANCELADO")}
                      className="gap-1 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Cancelar
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Additional details link/button */}
          {onVerDetalles && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVerDetalles(turno)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <span>Ver Historial</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
