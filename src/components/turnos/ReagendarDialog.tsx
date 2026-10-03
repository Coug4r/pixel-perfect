import { useState } from "react";
import type { Turno } from "@/types";
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
import { RotateCcw, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatHora, formatNumero } from "@/utils/format";

interface ReagendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turno: Turno | null;
  onConfirm: (nuevaHora: string) => void;
}

export function ReagendarDialog({
  open,
  onOpenChange,
  turno,
  onConfirm,
}: ReagendarDialogProps) {
  // Default to a suggested time (next available slot or +30 mins)
  const now = new Date();
  const nextHour = new Date(now.getTime() + 30 * 60000);
  const defaultH = String(nextHour.getHours()).padStart(2, "0");
  const defaultM = String(Math.ceil(nextHour.getMinutes() / 15) * 15 % 60).padStart(2, "0");
  const [hora, setHora] = useState(`${defaultH}:${defaultM}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hora) {
      toast.error("Selecciona una nueva hora para hoy.");
      return;
    }
    try {
      onConfirm(hora);
      toast.success(`Turno reagendado correctamente para las ${hora}.`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Error al reagendar el turno.");
    }
  };

  const HORAS_DISPONIBLES = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "14:00", "14:30", "15:00",
    "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <RotateCcw className="h-5 w-5" />
              <DialogTitle className="font-display text-xl">
                Reagendar Turno #{turno ? formatNumero(turno.numero) : ""}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Asigna un nuevo horario de atención dentro de la jornada de hoy.
            </DialogDescription>
          </DialogHeader>

          {turno && (
            <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1 border border-border">
              <div className="flex justify-between text-muted-foreground">
                <span>Horario anterior:</span>
                <strong className="text-foreground">{formatHora(turno.horaProgramada)}</strong>
              </div>
              <div className="flex items-start gap-1.5 text-muted-foreground pt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-500 mt-0.5" />
                <span>Todos los turnos de MekaTurn se atienden exclusivamente el mismo día.</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="hora" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Seleccionar Nueva Hora para Hoy:
            </Label>
            
            <input
              type="time"
              id="hora"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div>
              <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">Horarios rápidos sugeridos:</p>
              <div className="grid grid-cols-4 gap-1.5">
                {HORAS_DISPONIBLES.slice(0, 8).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHora(h)}
                    className={`rounded border px-2 py-1 text-xs font-semibold transition-all ${
                      hora === h
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted text-foreground/80"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold">
              <RotateCcw className="h-4 w-4" />
              Confirmar Reagendamiento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
