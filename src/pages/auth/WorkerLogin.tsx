import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Bus, ArrowLeft, Users, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { loginSchema, conductorLoginSchema } from "@/lib/validations/auth";

const WorkerLogin = () => {
  const [email, setEmail] = useState("");
  const [placa, setPlaca] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("admin");
  
  const { signInWorker, signInConductor } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate input
      const validation = loginSchema.safeParse({
        email,
        password,
      });

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError.message);
      }

      const { error: signInError } = await signInWorker(validation.data.email, validation.data.password);

      if (signInError) {
        throw new Error(signInError.message || "Credenciales incorrectas");
      }

      toast({
        title: "Bienvenido Administrador",
        description: "Inicio de sesión exitoso",
      });
      navigate("/admin");
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error de autenticación",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConductorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate input
      const validation = conductorLoginSchema.safeParse({
        placa,
        password,
      });

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError.message);
      }

      const { error: signInError } = await signInConductor(validation.data.placa, validation.data.password);

      if (signInError) {
        throw new Error(signInError.message || "Credenciales incorrectas");
      }

      toast({
        title: "Bienvenido Conductor",
        description: "Inicio de sesión exitoso",
      });
      navigate("/conductor");
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error de autenticación",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header con toggle de tema */}
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>
        
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
              <Bus className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">Bahía del Sur</h1>
          </div>
          <p className="text-muted-foreground">Portal de Trabajadores</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Selecciona tu tipo de acceso
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Administrador
                </TabsTrigger>
                <TabsTrigger value="conductor" className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Conductor
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="admin" className="space-y-4 mt-4">
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email Corporativo</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Contraseña</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Verificando..." : "Acceder como Administrador"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="conductor" className="space-y-4 mt-4">
                <form onSubmit={handleConductorSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="placa">Placa del Vehículo</Label>
                    <Input
                      id="placa"
                      type="text"
                      placeholder="ABC-123"
                      value={placa}
                      onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="conductor-password">Contraseña</Label>
                    <Input
                      id="conductor-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Verificando..." : "Acceder como Conductor"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                ¿No tienes acceso? Contacta a tu administrador
              </p>
              <Button variant="ghost" asChild>
                <Link to="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkerLogin;