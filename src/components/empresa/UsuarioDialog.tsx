import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario?: any;
}

export function UsuarioDialog({ open, onOpenChange, usuario }: UsuarioDialogProps) {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [rutas, setRutas] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    cedula: "",
    rol_id: "",
    password: "",
    codigo_usuario: "",
    placa: "",
    ruta_id: "",
  });

  useEffect(() => {
    fetchRoles();
    fetchRutas();
  }, []);

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        email: usuario.email || "",
        telefono: usuario.telefono || "",
        cedula: usuario.cedula || "",
        rol_id: usuario.rol_id || "",
        password: "",
        codigo_usuario: usuario.codigo_usuario || "",
        placa: usuario.placa || "",
        ruta_id: usuario.ruta_id || "",
      });
    } else {
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        cedula: "",
        rol_id: "",
        password: "",
        codigo_usuario: "",
        placa: "",
        ruta_id: "",
      });
    }
  }, [usuario, open]);

  const fetchRoles = async () => {
    const { data } = await supabase
      .from('roles')
      .select('*')
      .in('nombre', ['gerente', 'administrador', 'conductor', 'cobrador'])
      .order('nombre');
    
    if (data) setRoles(data);
  };

  const fetchRutas = async () => {
    const { data } = await supabase
      .from('rutas')
      .select('id, nombre, codigo')
      .eq('activo', true)
      .order('codigo');
    
    if (data) setRutas(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email || !formData.rol_id) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    if (!usuario && !formData.password) {
      toast.error("La contraseña es obligatoria para nuevos usuarios");
      return;
    }

    // Validar código/placa según el rol
    const selectedRole = roles.find(r => r.id === formData.rol_id);
    if (selectedRole) {
      if (['conductor', 'cobrador'].includes(selectedRole.nombre) && !formData.placa) {
        toast.error("La placa es obligatoria para conductores y cobradores");
        return;
      }
      if (['administrador', 'gerente'].includes(selectedRole.nombre) && !formData.codigo_usuario) {
        toast.error("El código de usuario es obligatorio");
        return;
      }
    }

    setLoading(true);

    try {
      if (usuario) {
        // Determinar el rol seleccionado
        const selectedRole = roles.find(r => r.id === formData.rol_id);
        const esConductorOCobrador = selectedRole && ['conductor', 'cobrador'].includes(selectedRole.nombre);
        
        // Update existing user
        const { error } = await supabase
          .from('usuarios')
          .update({
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            telefono: formData.telefono,
            cedula: formData.cedula,
            rol_id: formData.rol_id,
            // Si es conductor/cobrador, limpiar codigo_usuario. Si es admin/gerente, guardar el código
            codigo_usuario: esConductorOCobrador ? null : formData.codigo_usuario,
          })
          .eq('id', usuario.id);

        if (error) throw error;

        // Si es conductor o cobrador, gestionar la placa en tabla conductores
        if (esConductorOCobrador) {
          // Verificar si ya existe un registro en conductores
          const { data: existingConductor } = await supabase
            .from('conductores')
            .select('id')
            .eq('usuario_id', usuario.id)
            .single();

          if (existingConductor) {
            // Actualizar registro existente
            const { error: conductorError } = await supabase
              .from('conductores')
              .update({
                placa: formData.placa,
                licencia_numero: formData.placa,
                ruta_id: formData.ruta_id || null,
                activo: true,
              })
              .eq('usuario_id', usuario.id);

            if (conductorError) throw conductorError;
          } else {
            // Crear nuevo registro
            const { error: conductorError } = await supabase
              .from('conductores')
              .insert({
                usuario_id: usuario.id,
                placa: formData.placa,
                licencia_numero: formData.placa,
                ruta_id: formData.ruta_id || null,
                activo: true,
              });

            if (conductorError) throw conductorError;
          }
        } else {
          // Si cambió de conductor/cobrador a admin/gerente, desactivar el registro en conductores
          const { error: deactivateError } = await supabase
            .from('conductores')
            .update({ activo: false })
            .eq('usuario_id', usuario.id);
          
          // No lanzar error si no existe el registro (puede no haber sido conductor antes)
          if (deactivateError && !deactivateError.message.includes('no rows')) {
            console.warn('Error al desactivar conductor:', deactivateError);
          }
        }

        toast.success("Usuario actualizado exitosamente");
      } else {
        // Create new user in auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              nombre: formData.nombre,
              apellido: formData.apellido,
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("No se pudo crear el usuario en el sistema de autenticación");

        // Create user in usuarios table
        const { error: dbError } = await supabase
          .from('usuarios')
          .insert({
            id: authData.user.id,
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            telefono: formData.telefono,
            cedula: formData.cedula,
            rol_id: formData.rol_id,
            empresa_id: userData?.empresa_id,
            activo: true,
            codigo_usuario: formData.codigo_usuario,
          });

        if (dbError) throw dbError;

        // Si es conductor o cobrador, crear registro en conductores
        const selectedRole = roles.find(r => r.id === formData.rol_id);
        if (selectedRole && ['conductor', 'cobrador'].includes(selectedRole.nombre)) {
          const { error: conductorError } = await supabase
            .from('conductores')
            .insert({
              usuario_id: authData.user.id,
              placa: formData.placa,
              licencia_numero: formData.placa,
              ruta_id: formData.ruta_id || null,
              activo: true,
            });

          if (conductorError) throw conductorError;
        }

        toast.success("Usuario creado exitosamente");
      }

      onOpenChange(false);
      window.location.reload(); // Reload to show new user
    } catch (error: any) {
      console.error('Error al guardar usuario:', error);
      // Traducir mensajes de error comunes de Supabase/PostgreSQL
      let errorMessage = "Error al guardar usuario";
      if (error.message) {
        if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
          errorMessage = "Ya existe un usuario con ese correo o código";
        } else if (error.message.includes('violates foreign key')) {
          errorMessage = "Error de referencia en la base de datos";
        } else if (error.message.includes('not-null constraint')) {
          errorMessage = "Faltan campos obligatorios";
        } else {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {usuario ? "Editar Usuario" : "Nuevo Usuario"}
          </DialogTitle>
          <DialogDescription>
            {usuario 
              ? "Modifica la información del usuario" 
              : "Crea un nuevo usuario para tu empresa"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={!!usuario}
            />
          </div>

          {!usuario && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula</Label>
              <Input
                id="cedula"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol *</Label>
            <Select value={formData.rol_id} onValueChange={(value) => setFormData({ ...formData, rol_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((rol) => (
                  <SelectItem key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo condicional: Código de Usuario o Placa */}
          {formData.rol_id && (() => {
            const selectedRole = roles.find(r => r.id === formData.rol_id);
            if (selectedRole) {
              if (['conductor', 'cobrador'].includes(selectedRole.nombre)) {
                return (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="placa">Placa *</Label>
                      <Input
                        id="placa"
                        value={formData.placa}
                        onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                        placeholder="Ej: ABC-1234"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        La placa será usada como código de acceso
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ruta">Línea de Bus Asignada</Label>
                      <Select value={formData.ruta_id} onValueChange={(value) => setFormData({ ...formData, ruta_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una línea" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sin asignar</SelectItem>
                          {rutas.map((ruta) => (
                            <SelectItem key={ruta.id} value={ruta.id}>
                              {ruta.codigo} - {ruta.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Asigna la línea de bus que operará este conductor
                      </p>
                    </div>
                  </>
                );
              } else if (['administrador', 'gerente'].includes(selectedRole.nombre)) {
                return (
                  <div className="space-y-2">
                    <Label htmlFor="codigo_usuario">Código de Usuario *</Label>
                    <Input
                      id="codigo_usuario"
                      value={formData.codigo_usuario}
                      onChange={(e) => setFormData({ ...formData, codigo_usuario: e.target.value.toUpperCase() })}
                      placeholder="Ej: ADM001"
                      required
                    />
                  </div>
                );
              }
            }
            return null;
          })()}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {usuario ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
