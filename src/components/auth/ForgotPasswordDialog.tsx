import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { KeyRound } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
  returnTo?: string;
}

export function ForgotPasswordDialog({ open, onOpenChange, defaultEmail = "" }: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast({ title: "Correo inválido", description: "Ingresa un correo electrónico válido.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("reset-password-temp", { body: { email: value } });
    setLoading(false);
    if (error || data?.error) {
      let msg = data?.error;
      if (!msg && error && (error as any).context?.json) {
        try { msg = (await (error as any).context.json()).error; } catch { /* noop */ }
      }
      toast({ title: "Error", description: msg || "No se pudo restablecer la contraseña.", variant: "destructive" });
      return;
    }
    setDone(true);
  };

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) setTimeout(() => setDone(false), 200);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recuperar contraseña</DialogTitle>
          <DialogDescription>
            Ingresa tu correo y tu contraseña se restablecerá a una clave temporal.
          </DialogDescription>
        </DialogHeader>
        {done ? (
          <div className="space-y-4 text-center py-2">
            <KeyRound className="h-12 w-12 text-primary mx-auto" />
            <p className="text-sm">
              Listo. Tu contraseña temporal es <strong className="text-lg">123456</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Inicia sesión con ella y el sistema te pedirá crear una nueva contraseña.
            </p>
            <Button className="w-full" onClick={() => close(false)}>Ir a iniciar sesión</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="tucorreo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Restableciendo..." : "Restablecer contraseña"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
