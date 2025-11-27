import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Building2, Eye, EyeOff } from "lucide-react";
import { loginSchema, registrationSchema } from "@/lib/validations/auth";

export default function EmpresaAuth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    ruc: "",
    telefono: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de nuevo",
      });

      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate password confirmation
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }

      // Validate input
      const validation = registrationSchema.safeParse({
        email: registerData.email,
        password: registerData.password,
        nombre: registerData.nombre,
        ruc: registerData.ruc,
        telefono: registerData.telefono,
      });

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError.message);
      }

      // Crear cuenta de auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error("No se pudo crear el usuario");

      // Crear empresa
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .insert([{
          nombre: validation.data.nombre,
          ruc: validation.data.ruc,
          telefono: validation.data.telefono,
          email: validation.data.email,
          estado_membresia: 'activa',
          tipo_plan: 'basico',
          fecha_vencimiento_membresia: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }])
        .select()
        .single();

      if (empresaError) throw empresaError;

      // Obtener rol de administrador
      const { data: rolData, error: rolError } = await supabase
        .from('roles')
        .select('id')
        .eq('nombre', 'administrador')
        .single();

      if (rolError) throw rolError;

      // Crear usuario en la tabla usuarios
      const { error: usuarioError } = await supabase
        .from('usuarios')
        .insert([{
          id: authData.user.id,
          email: validation.data.email,
          nombre: validation.data.nombre,
          empresa_id: empresaData.id,
          rol_id: rolData.id,
          activo: true,
        }]);

      if (usuarioError) throw usuarioError;

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. Tienes 7 días de prueba gratuita.",
      });

      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Portal de Empresas</CardTitle>
          <CardDescription>
            Accede o registra tu empresa de transporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="text"
                    autoComplete="email"
                    placeholder="empresa@ejemplo.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="register-nombre">Nombre de la Empresa *</Label>
                  <Input
                    id="register-nombre"
                    placeholder="Mi Empresa de Buses"
                    value={registerData.nombre}
                    onChange={(e) => setRegisterData({ ...registerData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-ruc">RUC</Label>
                  <Input
                    id="register-ruc"
                    placeholder="1234567890001"
                    value={registerData.ruc}
                    onChange={(e) => setRegisterData({ ...registerData, ruc: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-telefono">Teléfono</Label>
                  <Input
                    id="register-telefono"
                    placeholder="+593 99 123 4567"
                    value={registerData.telefono}
                    onChange={(e) => setRegisterData({ ...registerData, telefono: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email *</Label>
                  <Input
                    id="register-email"
                    type="text"
                    autoComplete="email"
                    placeholder="empresa@ejemplo.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirmar Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Registrando..." : "Registrar Empresa"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  7 días de prueba gratuita
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}