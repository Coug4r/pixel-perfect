import { useState } from "react";
import type { Calificacion, Mecanico } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./StarRating";
import { Star, Send, CheckCircle2, ThumbsUp, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { formatHora } from "@/utils/format";

interface CalificacionFormProps {
  turnoId: string;
  mecanico?: Mecanico | undefined;
  calificacionExistente?: Calificacion | undefined;
  onSubmit: (estrellas: number, comentario: string) => Promise<void> | void;
  className?: string | undefined;
}

const RATING_LABELS: Record<number, string> = {
  1: "Mala atención / No solucionado",
  2: "Regular / Podría mejorar",
  3: "Buena atención / Aceptable",
  4: "Muy buena atención / Recomendado",
  5: "¡Excelente servicio! / Impecable",
};

export function CalificacionForm({
  turnoId,
  mecanico,
  calificacionExistente,
  onSubmit,
  className = "",
}: CalificacionFormProps) {
  const [estrellas, setEstrellas] = useState<number>(5);
  const [comentario, setComentario] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (estrellas < 1 || estrellas > 5) {
      toast.error("Por favor selecciona una calificación de 1 a 5 estrellas.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(estrellas, comentario);
      toast.success("¡Gracias por calificar la atención!");
    } catch (err: any) {
      toast.error(err.message || "Error al registrar la calificación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already rated
  if (calificacionExistente) {
    return (
      <Card className={`border-emerald-500/30 bg-emerald-500/5 shadow-sm ${className}`}>
        <CardHeader className="py-4 px-6 border-b border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
            <CardTitle className="font-display text-base sm:text-lg">
              Calificación Registrada
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <StarRating value={calificacionExistente.estrellas} readonly size="md" />
              <span className="text-sm font-bold text-foreground">
                {calificacionExistente.estrellas} de 5 estrellas
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatHora(calificacionExistente.fecha)}
            </span>
          </div>

          {calificacionExistente.comentario && (
            <div className="rounded-lg bg-background/80 p-3 border border-border/80 text-xs sm:text-sm italic text-foreground/90">
              "{calificacionExistente.comentario}"
            </div>
          )}

          <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center sm:justify-start pt-1">
            <HeartHandshake className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Tu opinión ayuda a {mecanico?.nombre || "nuestros técnicos"} a mantener un servicio de excelencia.</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-primary/40 shadow-md bg-card overflow-hidden ${className}`}>
      <CardHeader className="bg-primary/5 border-b border-border/60 py-3.5 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Star className="h-4 w-4 fill-primary-foreground" />
          </div>
          <div>
            <CardTitle className="font-display text-base sm:text-lg font-bold">
              Calificar Atención del Mecánico
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              {mecanico ? `Mecánico responsable: ${mecanico.nombre}` : "Tu opinión es muy importante para nosotros"}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center sm:text-left space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              ¿Cómo calificarías el servicio recibido?
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <StarRating value={estrellas} onChange={setEstrellas} size="lg" />
              <span className="text-xs font-semibold text-primary">
                {RATING_LABELS[estrellas]}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="comentario" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Comentario u observaciones (opcional)
            </label>
            <Textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Cuéntanos qué tal te pareció el trabajo realizado..."
              rows={3}
              maxLength={300}
              className="resize-none text-xs sm:text-sm"
            />
            <div className="flex justify-end text-[10px] text-muted-foreground">
              <span>{comentario.length}/300</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
            <span>Enviar Calificación</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
