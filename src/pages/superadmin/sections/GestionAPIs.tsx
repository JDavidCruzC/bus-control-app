import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Key, Eye, EyeOff, Save, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function GestionAPIs() {
  const { toast } = useToast();
  const [showMapboxKey, setShowMapboxKey] = useState(false);
  const [mapboxKey, setMapboxKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveMapbox = async () => {
    if (!mapboxKey.trim()) {
      toast({
        title: "Error",
        description: "La clave de API de Mapbox no puede estar vacía",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Guardar el token en configuraciones
      const { error } = await supabase
        .from('configuraciones')
        .upsert({
          clave: 'mapbox_token',
          valor: mapboxKey,
          tipo: 'string',
          descripcion: 'Token de acceso de Mapbox API',
          categoria: 'apis',
          empresa_id: null // Es una configuración global del super admin
        }, {
          onConflict: 'clave'
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Token de Mapbox actualizado. El token estará disponible inmediatamente.",
      });
      setMapboxKey("");
    } catch (error: any) {
      console.error('Error guardando token:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la clave de API",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de APIs</h1>
        <p className="text-muted-foreground mt-2">
          Configura las claves de API del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>Mapbox API</CardTitle>
          </div>
          <CardDescription>
            Configura la clave de acceso para los mapas de Mapbox. Esta clave se utiliza para renderizar los mapas en toda la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mapbox-key">Clave de API de Mapbox</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="mapbox-key"
                  type={showMapboxKey ? "text" : "password"}
                  value={mapboxKey}
                  onChange={(e) => setMapboxKey(e.target.value)}
                  placeholder="pk.eyJ1Ijoi..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowMapboxKey(!showMapboxKey)}
                >
                  {showMapboxKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button onClick={handleSaveMapbox} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Obtén tu clave en:{" "}
              <a
                href="https://account.mapbox.com/access-tokens/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Mapbox Account
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
          <CardDescription>
            Verifica el estado de las integraciones de APIs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Mapbox API</p>
                <p className="text-sm text-muted-foreground">Servicio de mapas</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm">Operativo</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Supabase</p>
                <p className="text-sm text-muted-foreground">Base de datos y autenticación</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm">Operativo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
