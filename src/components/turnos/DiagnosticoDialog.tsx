import { useState, useEffect } from "react";
import type { Diagnostico, Turno } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Stethoscope, FileText, Wrench, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatNumero } from "@/utils/format";

interface DiagnosticoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turno: Turno | null;
  diagnosticoExistente?: Diagnostico | undefined;
  onSave: (data: {
    diagnostico: string;
    observaciones: string;
    trabajoRealizado: string;
    recomendaciones: string;
  }) => void;
}

export function DiagnosticoDialog({
  open,
  onOpenChange,
  turno,
  diagnosticoExistente,
  onSave,
}: DiagnosticoDialogProps) {
  const [diagnostico, setDiagnostico] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [trabajoRealizado, setTrabajoRealizado] = useState("");
  const [recomendaciones, setRecomendaciones] = useState("");

  useEffect(() => {
    if (diagnosticoExistente) {
      setDiagnostico(diagnosticoExistente.diagnostico || "");
      setObservaciones(diagnosticoExistente.observaciones || "");
      setTrabajoRealizado(diagnosticoExistente.trabajoRealizado || "");
      setRecomendaciones(diagnosticoExistente.recomendaciones || "");
    } else {
      setDiagnostico("");
      setObservaciones("");
      setTrabajoRealizado("");
      setRecomendaciones("");
    }
  }, [diagnosticoExistente, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnostico.trim()) {
      toast.error("El campo diagnóstico técnico es obligatorio.");
      return;
    }
    try {
      onSave({
        diagnostico: diagnostico.trim(),
        observaciones: observaciones.trim(),
        trabajoRealizado: trabajoRealizado.trim(),
        recomendaciones: recomendaciones.trim(),
      });
      toast.success("Diagnóstico guardado correctamente.");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Error al guardar el diagnóstico.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <Stethoscope className="h-5 w-5" />
              <DialogTitle className="font-display text-xl">
                Registrar Diagnóstico — Turno #{turno ? formatNumero(turno.numero) : ""}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Detalla la inspección técnica realizada al vehículo del cliente. Esta información será visible en la consulta de su turno.
            </DialogDescription>
          </DialogHeader>

          {turno && (
            <div className="rounded-md bg-muted/50 p-2.5 text-xs border border-border flex items-start gap-2">
              <span className="font-bold text-foreground shrink-0">Motivo de ingreso:</span>
              <span className="text-muted-foreground italic">{turno.problema}</span>
            </div>
          )}

          <div className="space-y-3.5">
            {/* 1. Diagnóstico */}
            <div className="space-y-1.5">
              <Label htmlFor="diag" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-foreground">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Diagnóstico Técnico *</span>
              </Label>
              <Textarea
                id="diag"
                required
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Ej. Se detectó desgaste severo en pastillas de freno y fuga en retenedor."
                rows={2}
                className="text-xs sm:text-sm"
              />
            </div>

            {/* 2. Observaciones */}
            <div className="space-y-1.5">
              <Label htmlFor="obs" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Observaciones del Taller</span>
              </Label>
              <Textarea
                id="obs"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej. Se recomienda cambio preventivo antes de viaje en carretera."
                rows={2}
                className="text-xs sm:text-sm"
              />
            </div>

            {/* 3. Trabajo Realizado */}
            <div className="space-y-1.5">
              <Label htmlFor="trabajo" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Wrench className="h-3.5 w-3.5" />
                <span>Trabajo Realizado / Correcciones</span>
              </Label>
              <Textarea
                id="trabajo"
                value={trabajoRealizado}
                onChange={(e) => setTrabajoRealizado(e.target.value)}
                placeholder="Ej. Inspección del sistema de frenos, rectificación de discos y purga del circuito."
                rows={2}
                className="text-xs sm:text-sm"
              />
            </div>

            {/* 4. Recomendaciones */}
            <div className="space-y-1.5">
              <Label htmlFor="recom" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-primary">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Recomendaciones para el Cliente</span>
              </Label>
              <Textarea
                id="recom"
                value={recomendaciones}
                onChange={(e) => setRecomendaciones(e.target.value)}
                placeholder="Ej. Realizar alineación y balanceo en 5.000 km."
                rows={2}
                className="text-xs sm:text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90">
              <CheckCircle className="h-4 w-4" />
              Guardar Diagnóstico
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
