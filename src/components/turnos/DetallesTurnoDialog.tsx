import type { Turno, Cliente, Mecanico, Diagnostico, Calificacion } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EstadoBadge } from "./EstadoBadge";
import { 
  User, 
  Phone, 
  Car, 
  Wrench, 
  Clock, 
  Calendar, 
  Stethoscope, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Star,
  History,
  RotateCcw
} from "lucide-react";
import { formatHora, formatFecha, formatNumero } from "@/utils/format";

interface DetallesTurnoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turno: Turno | null;
  cliente?: Cliente | undefined;
  mecanico?: Mecanico | undefined;
  diagnosticos?: Diagnostico[] | undefined;
  calificacion?: Calificacion | undefined;
  isSuperadmin?: boolean | undefined;
  onAgregarDiagnostico?: ((turno: Turno) => void) | undefined;
}

export function DetallesTurnoDialog({
  open,
  onOpenChange,
  turno,
  cliente,
  mecanico,
  diagnosticos = [],
  calificacion,
  isSuperadmin = false,
  onAgregarDiagnostico,
}: DetallesTurnoDialogProps) {
  if (!turno) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="font-display text-2xl font-black text-primary">
                Turno #{formatNumero(turno.numero)}
              </span>
              <EstadoBadge estado={turno.estado} size="default" />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-border bg-muted/60 px-2.5 py-1 font-mono font-bold text-xs text-foreground inline-flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5 text-primary" />
                <span>Placa: {turno.placa}</span>
              </span>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-3">
            <span>Creado: {formatFecha(turno.creadoEn)} {formatHora(turno.creadoEn)}</span>
            <span>•</span>
            <span>Última modificación: <strong>{formatHora(turno.updatedAt)}</strong></span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Customer & Mechanic Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/30 p-3.5 rounded-xl border border-border text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>Datos del Cliente</span>
              </div>
              <p className="font-bold text-foreground text-sm">{cliente?.nombre || "Cliente"}</p>
              <div className="space-y-0.5 text-muted-foreground">
                <p>Identificación: <strong className="font-mono text-foreground">{cliente?.identificacion}</strong></p>
                {cliente?.celular && (
                  <p className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span className="font-mono">{cliente.celular}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border pt-2 sm:pt-0 sm:pl-3">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                <Wrench className="h-3.5 w-3.5 text-primary" />
                <span>Asignación de Técnico</span>
              </div>
              <p className="font-bold text-foreground text-sm">
                {mecanico ? mecanico.nombre : "Sin asignar (Cola general)"}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {turno.mecanicoPreferidoId
                  ? "Asignado por preferencia del cliente"
                  : "Asignación automática por orden de llegada"}
              </p>
            </div>
          </div>

          {/* Vehicle Problem */}
          <div className="rounded-xl bg-card p-3.5 border border-border text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
              <Car className="h-3.5 w-3.5 text-primary" />
              <span>Motivo de Ingreso / Falla Reportada</span>
            </div>
            <p className="text-foreground font-medium leading-relaxed bg-muted/30 p-2.5 rounded-lg">
              {turno.problema}
            </p>
          </div>

          {/* Multiple Diagnostics Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                <span>Diagnósticos Registrados ({diagnosticos.length})</span>
              </h4>

              {onAgregarDiagnostico && (turno.estado === "EN_ATENCION" || turno.estado === "DIAGNOSTICO") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    onAgregarDiagnostico(turno);
                  }}
                  className="h-7 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10"
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  <span>+ Agregar Diagnóstico</span>
                </Button>
              )}
            </div>

            {diagnosticos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground italic">
                Aún no se han registrado diagnósticos para este vehículo.
              </div>
            ) : (
              <div className="space-y-3">
                {diagnosticos.map((diag, index) => (
                  <div
                    key={diag.id}
                    className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-2 text-xs">
                      <span className="font-bold text-primary flex items-center gap-1.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]">
                          {index + 1}
                        </span>
                        Diagnóstico #{index + 1}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {diag.mecanicoNombre ? `Por: ${diag.mecanicoNombre} • ` : ""}
                        {formatHora(diag.fecha)}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider text-primary">
                          Descripción Técnica:
                        </span>
                        <p className="text-foreground/90 mt-0.5">{diag.diagnostico}</p>
                      </div>

                      {diag.observaciones && (
                        <div>
                          <span className="font-bold text-amber-700 dark:text-amber-300 block text-[10px] uppercase">
                            Observaciones:
                          </span>
                          <p className="text-foreground/80 mt-0.5">{diag.observaciones}</p>
                        </div>
                      )}

                      {diag.trabajoRealizado && (
                        <div>
                          <span className="font-bold text-emerald-700 dark:text-emerald-300 block text-[10px] uppercase">
                            Trabajo Realizado:
                          </span>
                          <p className="text-foreground/80 mt-0.5">{diag.trabajoRealizado}</p>
                        </div>
                      )}

                      {diag.recomendaciones && (
                        <div>
                          <span className="font-bold text-primary block text-[10px] uppercase">
                            Recomendaciones:
                          </span>
                          <p className="text-foreground/80 mt-0.5">{diag.recomendaciones}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Superadmin Only: Ratings & History log */}
          {isSuperadmin && calificacion && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-400/5 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  Calificación del Cliente ({calificacion.estrellas}/5 estrellas)
                </span>
                <span className="text-[10px] text-muted-foreground">{formatHora(calificacion.fecha)}</span>
              </div>
              {calificacion.comentario && (
                <p className="italic text-foreground/90 bg-background/60 p-2.5 rounded-lg border border-border/60">
                  "{calificacion.comentario}"
                </p>
              )}
            </div>
          )}

          {isSuperadmin && turno.historial.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Historial Completo de Transiciones:
              </span>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {turno.historial.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-none">
                    <div className="flex items-center gap-2">
                      <EstadoBadge estado={h.estado} size="sm" showIcon={false} />
                      {h.nota && <span className="text-muted-foreground italic text-[11px]">{h.nota}</span>}
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{formatHora(h.fecha)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-xs"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
