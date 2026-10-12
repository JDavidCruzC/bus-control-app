import { useEffect, useState } from "react";
import { Smartphone, Globe, Play, Apple, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

declare global {
  interface Window { __appInstallPrompt?: any; Capacitor?: any }
}

const isInstalled = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true ||
    !!window.Capacitor?.isNativePlatform?.());

export default function InstallAppButton() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState<any>(window.__appInstallPrompt ?? null);
  const [hidden, setHidden] = useState(isInstalled());

  useEffect(() => {
    const onReady = () => setPrompt(window.__appInstallPrompt);
    const onInstalled = () => { setHidden(true); setOpen(false); };
    window.addEventListener("app-install-ready", onReady);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("app-install-ready", onReady);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden) return null;

  const install = async () => {
    const p = prompt || window.__appInstallPrompt;
    if (p) {
      p.prompt();
      const choice = await p.userChoice;
      window.__appInstallPrompt = null;
      setPrompt(null);
      if (choice?.outcome === "accepted") toast.success("¡Aplicación instalada!");
      setOpen(false);
      return;
    }
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) {
      toast.info('En Safari toca Compartir (□↑) → "Añadir a pantalla de inicio"', { duration: 8000 });
    } else if (/android/i.test(ua)) {
      toast.info('En Chrome toca el menú ⋮ → "Instalar aplicación" o "Añadir a pantalla de inicio"', { duration: 8000 });
    } else {
      toast.info('En Chrome o Edge usa el icono de instalar en la barra de direcciones o el menú ⋮ → "Instalar aplicación"', { duration: 8000 });
    }
  };

  const soon = [
    { icon: Play, label: "Google Play", sub: "Próximamente · Android" },
    { icon: Apple, label: "App Store", sub: "Próximamente · iPhone" },
    { icon: Download, label: "Descargar APK", sub: "Próximamente · Android" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="secondary">
          <Smartphone className="mr-2 h-4 w-4" />
          Instalar en mi teléfono
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Instalar aplicación</DialogTitle>
          <DialogDescription>Elige cómo quieres instalar SMET en tu dispositivo.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {soon.map(({ icon: Icon, label, sub }) => (
            <button key={label} disabled className="flex items-center gap-3 rounded-lg border p-3 text-left opacity-50 cursor-not-allowed">
              <Icon className="h-5 w-5" />
              <div>
                <div className="font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </div>
            </button>
          ))}
          <button onClick={install} className="flex items-center gap-3 rounded-lg border border-primary bg-primary/5 p-3 text-left hover:bg-primary/10 transition-colors">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">Instalar desde el navegador</div>
              <div className="text-xs text-muted-foreground">Android, iPhone y PC</div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
