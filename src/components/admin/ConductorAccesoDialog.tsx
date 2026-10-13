import { useEffect, useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Wand2 } from "lucide-react";

const generar = () => Math.random().toString(36).slice(-4) + Math.floor(1000 + Math.random() * 9000);

async function invocar(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("gestionar-conductor", { body });
  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try { msg = (await error.context.json()).error ?? msg; } catch { /* noop */ }
    }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

function PasswordField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(true);
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Mínimo 6 caracteres" maxLength={72} />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-2.5 text-muted-foreground" aria-label={show ? "Ocultar" : "Mostrar"}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <Button type="button" variant="outline" size="icon" onClick={() => onChange(generar())} title="Generar contraseña">
        <Wand2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function NuevoConductorDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; onDone: () => void }) {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rutas, setRutas] = useState<{ id: string; codigo: string; nombre: string }[]>([]);
  const [f, setF] = useState({ placa: "", nombre: "", apellido: "", telefono: "", password: "", ruta_id: "", tipo: "conductor" });

  useEffect(() => {
    if (!open) return;
    setF({ placa: "", nombre: "", apellido: "", telefono: "", password: generar(), ruta_id: "", tipo: "conductor" });
    supabase.from("rutas").select("id, codigo, nombre").eq("activo", true)
      .eq("empresa_id", userData?.empresa_id ?? "00000000-0000-0000-0000-000000000000").order("codigo")
      .then(({ data }) => setRutas(data || []));
  }, [open, userData?.empresa_id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.placa.trim() || !f.nombre.trim()) return toast.error("Placa y nombre son obligatorios");
    if (f.password.length < 6) return toast.error("La contraseña debe tener al menos 6 caracteres");
    setLoading(true);
    try {
      await invocar({ action: "crear", ...f, ruta_id: f.ruta_id || null });
      toast.success(`Conductor creado. Accede con placa ${f.placa.toUpperCase()} y contraseña ${f.password}`, { duration: 10000 });
      onOpenChange(false);
      onDone();
    } catch (err: any) {
      toast.error(err.message || "No se pudo crear el conductor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo conductor</DialogTitle>
          <DialogDescription>El conductor iniciará sesión con su placa y la contraseña que definas.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Placa *</Label>
              <Input value={f.placa} onChange={(e) => setF({ ...f, placa: e.target.value.toUpperCase() })} placeholder="ABC-123" maxLength={12} />
            </div>
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={f.tipo} onValueChange={(v) => setF({ ...f, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="conductor">Conductor</SelectItem>
                  <SelectItem value="cobrador">Cobrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Nombre *</Label>
              <Input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} maxLength={100} />
            </div>
            <div className="space-y-1">
              <Label>Apellido</Label>
              <Input value={f.apellido} onChange={(e) => setF({ ...f, apellido: e.target.value })} maxLength={100} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Teléfono</Label>
            <Input value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} maxLength={20} />
          </div>
          <div className="space-y-1">
            <Label>Línea de bus</Label>
            <Select value={f.ruta_id || "none"} onValueChange={(v) => setF({ ...f, ruta_id: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin asignar</SelectItem>
                {rutas.map((r) => <SelectItem key={r.id} value={r.id}>{r.codigo} - {r.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Contraseña *</Label>
            <PasswordField value={f.password} onChange={(v) => setF({ ...f, password: v })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Crear</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CambiarPasswordConductorDialog({ conductor, onOpenChange }: { conductor: { id: string; placa: string; nombre: string } | null; onOpenChange: (o: boolean) => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (conductor) setPassword(generar()); }, [conductor]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conductor) return;
    if (password.length < 6) return toast.error("La contraseña debe tener al menos 6 caracteres");
    setLoading(true);
    try {
      await invocar({ action: "cambiar_password", conductor_id: conductor.id, password });
      toast.success(`Nueva contraseña para ${conductor.placa}: ${password}`, { duration: 10000 });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "No se pudo cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!conductor} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>{conductor?.nombre} · Placa {conductor?.placa}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <PasswordField value={password} onChange={setPassword} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
