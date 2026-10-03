import { useState } from "react";
import { MessageCircle, X, Send, Sparkles, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleSimularEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
    setTimeout(() => {
      setEnviado(false);
      setMensaje("");
      setOpen(false);
    }, 2500);
  };

  return (
    <>
      {/* Floating Button in bottom-right corner */}
      <aside aria-label="Contacto de WhatsApp" className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:px-4 sm:py-3 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 cursor-pointer"
          aria-label="Ayuda por WhatsApp"
        >
          <div className="relative">
            <MessageCircle className="h-6 w-6 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-100" />
            </span>
          </div>
          <span className="hidden sm:inline font-bold text-xs tracking-wide">
            ¿Necesitas Ayuda?
          </span>
        </button>
      </aside>

      {/* WhatsApp Modal Help Simulation */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border bg-card">
          {/* Header */}
          <div className="bg-[#075E54] dark:bg-[#128C7E] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white font-bold">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base leading-none">MekaTurn Asistencia</h3>
                  <Badge className="bg-[#25D366] text-black text-[9px] font-black h-4 px-1.5">
                    EN LÍNEA
                  </Badge>
                </div>
                <p className="text-xs text-emerald-100 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Atención Inmediata de Taller
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4 bg-[#ECE5DD] dark:bg-zinc-900/90">
            {enviado ? (
              <div className="rounded-xl bg-white dark:bg-zinc-800 p-6 text-center space-y-2 shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h4 className="font-display text-lg font-bold text-foreground">
                  ¡Mensaje Recibido!
                </h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Un asesor del taller te responderá al instante. Si ya tienes un turno, recuerda tener tu número y placa a mano.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-lg bg-white dark:bg-zinc-800 p-3.5 shadow-xs text-xs space-y-1.5 border border-border/60">
                  <p className="font-semibold text-foreground">
                    ¡Hola! ¿En qué podemos ayudarte hoy con tu vehículo?
                  </p>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Puedes consultarnos sobre tiempos de espera, disponibilidad de mecánicos, repuestos o dudas sobre tu turno.
                  </p>
                </div>

                <form onSubmit={handleSimularEnvio} className="space-y-3">
                  <textarea
                    rows={3}
                    required
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Escribe tu consulta aquí..."
                    className="w-full rounded-lg border border-border bg-white dark:bg-zinc-800 p-3 text-xs text-foreground placeholder:text-muted-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                  />

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Línea taller: +593 99 123 4567</span>
                    <span>Horario: 08:00 - 18:00</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs gap-2 shadow-md"
                  >
                    <Send className="h-4 w-4" />
                    <span>Iniciar Chat de Ayuda</span>
                  </Button>
                </form>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
