import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

export function ForceChangePassword() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [hidden, setHidden] = useState(false);

  const mustChange = !!user?.user_metadata?.must_change_password && !hidden;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 6) return toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
    if (pwd === "123456") return toast({ title: "Error", description: "Usa una contraseña distinta a la temporal.", variant: "destructive" });
    if (pwd !== confirm) return toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: pwd,
      data: { must_change_password: false },
    });
    setLoading(false);
    if (error) return toast({ title: "Error", description: "No se pudo actualizar la contraseña.", variant: "destructive" });
    setHidden(true);
    setPwd(""); setConfirm("");
    toast({ title: "Contraseña actualizada", description: "Tu nueva contraseña ya está activa." });
  };

  return (
    <Dialog open={mustChange}>
      <DialogContent className="sm:max-w-md [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Crea tu nueva contraseña</DialogTitle>
          <DialogDescription>Estás usando una contraseña temporal. Debes cambiarla para continuar.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fc-new">Nueva contraseña</Label>
            <Input id="fc-new" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fc-confirm">Confirmar contraseña</Label>
            <Input id="fc-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Guardando..." : "Guardar contraseña"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
