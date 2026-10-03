import type { EstadoTurno } from "@/types";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarClock, 
  Hourglass, 
  Megaphone, 
  Wrench, 
  Stethoscope, 
  CheckCircle2, 
  CheckCheck, 
  UserX, 
  RotateCcw, 
  XCircle,
  LucideIcon
} from "lucide-react";

interface EstadoBadgeProps {
  estado: EstadoTurno;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "default" | "lg";
}

const ESTADO_CONFIG: Record<
  EstadoTurno,
  { label: string; bg: string; text: string; border: string; icon: LucideIcon }
> = {
  AGENDADO: {
    label: "Agendado",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/30",
    icon: CalendarClock,
  },
  EN_ESPERA: {
    label: "En Espera",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30",
    icon: Hourglass,
  },
  LLAMADO: {
    label: "Llamado",
    bg: "bg-orange-500/15 dark:bg-orange-500/25",
    text: "text-orange-700 dark:text-orange-300 animate-pulse",
    border: "border-orange-500/40",
    icon: Megaphone,
  },
  EN_ATENCION: {
    label: "En Atención",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-500/30",
    icon: Wrench,
  },
  DIAGNOSTICO: {
    label: "Diagnóstico",
    bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-500/30",
    icon: Stethoscope,
  },
  LISTO: {
    label: "Listo",
    bg: "bg-emerald-500/15 dark:bg-emerald-500/25",
    text: "text-emerald-700 dark:text-emerald-300 font-bold",
    border: "border-emerald-500/40",
    icon: CheckCircle2,
  },
  FINALIZADO: {
    label: "Finalizado",
    bg: "bg-zinc-500/10 dark:bg-zinc-500/20",
    text: "text-zinc-700 dark:text-zinc-300",
    border: "border-zinc-500/30",
    icon: CheckCheck,
  },
  NO_ASISTIO: {
    label: "No Asistió",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/30",
    icon: UserX,
  },
  REAGENDADO: {
    label: "Reagendado",
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-500/30",
    icon: RotateCcw,
  },
  CANCELADO: {
    label: "Cancelado",
    bg: "bg-red-500/10 dark:bg-red-500/20",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-500/30",
    icon: XCircle,
  },
};

export function EstadoBadge({ estado, className = "", showIcon = true, size = "default" }: EstadoBadgeProps) {
  const config = ESTADO_CONFIG[estado] || ESTADO_CONFIG.AGENDADO;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    default: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2 font-bold",
  }[size];

  const iconSizes = {
    sm: "h-3 w-3",
    default: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  }[size];

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center font-semibold rounded-full border transition-all ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      {showIcon && <Icon className={`${iconSizes} shrink-0`} />}
      <span>{config.label}</span>
    </Badge>
  );
}
