import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MailCheck } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
  returnTo?: string;
}

export function ForgotPasswordDialog({ open, onOpenChange, defaultEmail = "", returnTo = "/empresa/auth" }: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast({ title: "Correo inválido", description: "Ingresa un correo electrónico válido.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(value, {
      redirectTo: `${window.location.origin}/reset-password?return=${encodeURIComponent(returnTo)}`,
    });
    setLoading(false);
    if (error) {
      const msg = error.message.toLowerCase().includes("rate")
        ? "Demasiados intentos. Espera unos minutos e inténtalo de nuevo."
        : "No se pudo enviar el correo. Inténtalo nuevamente.";
      toast({ title: "Error", description: msg, variant: "destructive" });
      return;
    }
    setSent(true);
  };

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) setTimeout(() => setSent(false), 200);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recuperar contraseña</DialogTitle>
          <DialogDescription>
            Te enviaremos un enlace a tu correo para crear una nueva contraseña.
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="space-y-4 text-center py-2">
            <MailCheck className="h-12 w-12 text-primary mx-auto" />
            <p className="text-sm">
              Si <strong>{email}</strong> está registrado, recibirás un correo en unos minutos.
              Revisa también tu carpeta de spam.
            </p>
            <Button className="w-full" onClick={() => close(false)}>Entendido</Button>
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
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
