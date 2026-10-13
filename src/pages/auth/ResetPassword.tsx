import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, KeyRound } from "lucide-react";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const returnTo = params.get("return") || "/empresa/auth";
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("error")) {
      setInvalid(true);
      return;
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && hash.includes("type=recovery"))) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const t = setTimeout(() => {
      supabase.auth.getSession().then(({ data }) => { if (!data.session) setInvalid(true); });
    }, 3000);
    return () => { subscription.unsubscribe(); clearTimeout(t); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Contraseña muy corta", description: "Debe tener al menos 6 caracteres.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar la contraseña. Solicita un nuevo enlace.", variant: "destructive" });
      return;
    }
    await supabase.auth.signOut();
    localStorage.clear();
    toast({ title: "Contraseña actualizada", description: "Ya puedes iniciar sesión con tu nueva contraseña." });
    navigate(returnTo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <KeyRound className="h-12 w-12 text-primary mx-auto mb-2" />
          <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
          <CardDescription>Crea una nueva contraseña para tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          {invalid && !ready ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                El enlace no es válido o ha expirado. Solicita uno nuevo desde la pantalla de inicio de sesión.
              </p>
              <Button className="w-full" onClick={() => navigate(returnTo)}>Volver al inicio de sesión</Button>
            </div>
          ) : !ready ? (
            <p className="text-center text-sm text-muted-foreground">Verificando enlace...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <div className="relative">
                  <Input id="new-password" type={show ? "text" : "password"} autoComplete="new-password"
                    value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <Input id="confirm-password" type={show ? "text" : "password"} autoComplete="new-password"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Guardando..." : "Guardar nueva contraseña"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
