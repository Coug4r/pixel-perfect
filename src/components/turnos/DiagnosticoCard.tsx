import type { Diagnostico, Mecanico } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Stethoscope, FileText, Wrench, AlertCircle, Sparkles, CheckCircle, Clock } from "lucide-react";
import { formatHora } from "@/utils/format";

interface DiagnosticoCardProps {
  diagnostico: Diagnostico;
  mecanico?: Mecanico | undefined;
  className?: string | undefined;
}

export function DiagnosticoCard({ diagnostico, mecanico, className = "" }: DiagnosticoCardProps) {
  return (
    <Card className={`border-primary/30 shadow-md bg-card overflow-hidden ${className}`}>
      <CardHeader className="bg-primary/5 border-b border-border/60 py-3.5 px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="font-display text-base sm:text-lg font-bold">
                Diagnóstico Técnico del Vehículo
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">
                Emitido por {mecanico?.nombre || "Técnico Especialista"} • {formatHora(diagnostico.fecha)}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* 1. Diagnostico */}
        <div className="space-y-1.5 rounded-lg border border-border/80 bg-muted/30 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <FileText className="h-3.5 w-3.5" />
            <span>Diagnóstico</span>
          </div>
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {diagnostico.diagnostico}
          </p>
        </div>

        {/* 2. Observaciones & Trabajo Realizado Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1.5 rounded-lg border border-border/80 bg-muted/20 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Observaciones</span>
            </div>
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
              {diagnostico.observaciones || "Sin observaciones adicionales."}
            </p>
          </div>

          <div className="space-y-1.5 rounded-lg border border-border/80 bg-muted/20 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Wrench className="h-3.5 w-3.5" />
              <span>Trabajo Realizado</span>
            </div>
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
              {diagnostico.trabajoRealizado || "En proceso de ejecución."}
            </p>
          </div>
        </div>

        {/* 3. Recomendaciones */}
        <div className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Recomendaciones del Mecánico</span>
          </div>
          <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
            {diagnostico.recomendaciones || "Seguir mantenimiento preventivo sugerido."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
