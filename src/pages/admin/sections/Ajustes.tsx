import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useConfiguraciones } from "@/hooks/useConfiguraciones";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChangePasswordDialog } from "@/components/admin/ChangePasswordDialog";
import { 
  Settings, 
  Save,
  Database,
  Mail,
  Bell,
  Shield,
  Palette,
  Globe,
  Clock,
  Users,
  Truck,
  MapPin,
  Lock,
  User
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Ajustes() {
  const { userData } = useAuth();
  const { configuraciones, loading, updateConfiguracion } = useConfiguraciones();
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Estados locales para las configuraciones
  const [config, setConfig] = useState({
    // Sistema General
    nombre_sistema: "Bus Control - Bahía del Sur",
    timezone: "America/Lima",
    idioma: "es",
    moneda: "PEN",
    
    // Mapa
    map_default_lat: "-17.6396",
    map_default_lng: "-71.3378",
    map_default_zoom: "13",
    use_geolocation: true,
    
    // Notificaciones
    notificaciones_email: true,
    notificaciones_sms: false,
    alertas_retrasos: true,
    alertas_mantenimiento: true,
    
    // Seguridad
    sesion_duracion: 8,
    intentos_login: 3,
    backup_automatico: true,
    
    // Operaciones
    capacidad_maxima_default: 40,
    tiempo_espera_paradero: 5,
    velocidad_maxima: 80,
    
    // Integrations
    mapbox_token: "",
    email_smtp: "",
    sms_provider: ""
  });

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Save map configuration
      const configsToSave = [
        { clave: 'map_default_lat', valor: config.map_default_lat, tipo: 'string', categoria: 'mapa', descripcion: 'Latitud por defecto del mapa' },
        { clave: 'map_default_lng', valor: config.map_default_lng, tipo: 'string', categoria: 'mapa', descripcion: 'Longitud por defecto del mapa' },
        { clave: 'map_default_zoom', valor: config.map_default_zoom, tipo: 'string', categoria: 'mapa', descripcion: 'Zoom por defecto del mapa' },
      ];

      for (const conf of configsToSave) {
        const existing = configuraciones.find(c => c.clave === conf.clave);
        if (existing) {
          await updateConfiguracion(existing.id, { valor: conf.valor });
        }
      }

      toast({
        title: "Éxito",
        description: "Configuraciones guardadas correctamente",
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuración del Sistema</h1>
          <p className="text-muted-foreground">
            Ajusta las configuraciones generales del sistema
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <ChangePasswordDialog 
        open={passwordDialogOpen} 
        onOpenChange={setPasswordDialogOpen} 
      />

      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="perfil">Mi Perfil</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="mapa">Mapa</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
          <TabsTrigger value="operaciones">Operaciones</TabsTrigger>
          <TabsTrigger value="integraciones">Integraciones</TabsTrigger>
          <TabsTrigger value="avanzado">Avanzado</TabsTrigger>
        </TabsList>

        {/* Mi Perfil */}
        <TabsContent value="perfil">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={userData?.nombre || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Solo el gerente puede modificar esta información
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Apellido</Label>
                  <Input
                    value={userData?.apellido || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={userData?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Input
                    value={userData?.rol?.nombre || ""}
                    disabled
                    className="bg-muted capitalize"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Código de Usuario / Placa</Label>
                  <Input
                    value={userData?.codigo_usuario || "No asignado"}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este código no puede ser modificado por ti
                  </p>
                </div>

                <div className="pt-4">
                  <Label className="mb-3 block">Contraseña</Label>
                  <Button 
                    onClick={() => setPasswordDialogOpen(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Cambiar Contraseña
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Actualiza tu contraseña de acceso al sistema
                  </p>
                </div>

                <div className="pt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Último acceso</p>
                  <p className="text-xs text-muted-foreground">
                    {userData?.ultimo_login ? new Date(userData.ultimo_login).toLocaleString('es-ES') : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Mapa */}
        <TabsContent value="mapa">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación Por Defecto del Mapa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="map_default_lat">Latitud Por Defecto</Label>
                  <Input
                    id="map_default_lat"
                    type="number"
                    step="0.000001"
                    placeholder="-17.6396"
                    onChange={(e) => handleConfigChange('map_default_lat', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Latitud para centrar el mapa al abrir (Ej: Ilo, Perú = -17.6396)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="map_default_lng">Longitud Por Defecto</Label>
                  <Input
                    id="map_default_lng"
                    type="number"
                    step="0.000001"
                    placeholder="-71.3378"
                    onChange={(e) => handleConfigChange('map_default_lng', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Longitud para centrar el mapa al abrir (Ej: Ilo, Perú = -71.3378)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="map_default_zoom">Zoom Por Defecto</Label>
                  <Input
                    id="map_default_zoom"
                    type="number"
                    min="1"
                    max="20"
                    placeholder="13"
                    onChange={(e) => handleConfigChange('map_default_zoom', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Nivel de zoom al abrir el mapa (1-20, recomendado: 13)
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">💡 Ubicaciones Comunes</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Ilo, Perú: -17.6396, -71.3378</li>
                    <li>• Guayaquil, Ecuador: -2.17, -79.92</li>
                    <li>• Lima, Perú: -12.0464, -77.0428</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Preferencias de Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Usar Ubicación del Navegador</Label>
                    <p className="text-sm text-muted-foreground">
                      Intentar detectar tu ubicación automáticamente
                    </p>
                  </div>
                  <Switch 
                    checked={config.use_geolocation !== false}
                    onCheckedChange={(checked) => handleConfigChange('use_geolocation', checked)}
                  />
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Nota:</strong> Si activas la ubicación del navegador, el mapa intentará usar tu ubicación actual. Si falla o denigas el permiso, usará la ubicación por defecto configurada arriba.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* General */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Información del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre_sistema">Nombre del Sistema</Label>
                  <Input
                    id="nombre_sistema"
                    value={config.nombre_sistema}
                    onChange={(e) => handleConfigChange('nombre_sistema', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select 
                    value={config.timezone} 
                    onValueChange={(value) => handleConfigChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <Clock className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Lima">Lima (UTC-5)</SelectItem>
                      <SelectItem value="America/Bogota">Bogotá (UTC-5)</SelectItem>
                      <SelectItem value="America/Mexico_City">Ciudad de México (UTC-6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="idioma">Idioma del Sistema</Label>
                  <Select 
                    value={config.idioma} 
                    onValueChange={(value) => handleConfigChange('idioma', value)}
                  >
                    <SelectTrigger>
                      <Globe className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Configuración Regional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="moneda">Moneda</Label>
                  <Select 
                    value={config.moneda} 
                    onValueChange={(value) => handleConfigChange('moneda', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PEN">Soles Peruanos (PEN)</SelectItem>
                      <SelectItem value="USD">Dólares (USD)</SelectItem>
                      <SelectItem value="EUR">Euros (EUR)</SelectItem>
                      <SelectItem value="COP">Pesos Colombianos (COP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label>Versión del Sistema</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">v1.2.3</p>
                    <p className="text-xs text-muted-foreground">Última actualización: 15 Ene 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notificaciones */}
        <TabsContent value="notificaciones">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alertas del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones por Email</Label>
                    <p className="text-sm text-muted-foreground">Recibir alertas importantes por correo</p>
                  </div>
                  <Switch 
                    checked={config.notificaciones_email}
                    onCheckedChange={(checked) => handleConfigChange('notificaciones_email', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones SMS</Label>
                    <p className="text-sm text-muted-foreground">Alertas críticas por mensaje de texto</p>
                  </div>
                  <Switch 
                    checked={config.notificaciones_sms}
                    onCheckedChange={(checked) => handleConfigChange('notificaciones_sms', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Retrasos</Label>
                    <p className="text-sm text-muted-foreground">Notificar cuando hay retrasos en rutas</p>
                  </div>
                  <Switch 
                    checked={config.alertas_retrasos}
                    onCheckedChange={(checked) => handleConfigChange('alertas_retrasos', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Mantenimiento</Label>
                    <p className="text-sm text-muted-foreground">Recordatorios de mantenimiento</p>
                  </div>
                  <Switch 
                    checked={config.alertas_mantenimiento}
                    onCheckedChange={(checked) => handleConfigChange('alertas_mantenimiento', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Configuración de Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email_smtp">Servidor SMTP</Label>
                  <Input
                    id="email_smtp"
                    placeholder="smtp.gmail.com"
                    value={config.email_smtp}
                    onChange={(e) => handleConfigChange('email_smtp', e.target.value)}
                  />
                </div>
                
                <Button variant="outline" className="w-full">
                  Probar Configuración de Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Seguridad */}
        <TabsContent value="seguridad">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Políticas de Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sesion_duracion">Duración de Sesión (horas)</Label>
                  <Input
                    id="sesion_duracion"
                    type="number"
                    value={config.sesion_duracion}
                    onChange={(e) => handleConfigChange('sesion_duracion', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="intentos_login">Intentos de Login Permitidos</Label>
                  <Input
                    id="intentos_login"
                    type="number"
                    value={config.intentos_login}
                    onChange={(e) => handleConfigChange('intentos_login', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">Respaldo diario de datos</p>
                  </div>
                  <Switch 
                    checked={config.backup_automatico}
                    onCheckedChange={(checked) => handleConfigChange('backup_automatico', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Estado del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Base de Datos</span>
                    <Badge variant="default">Conectado</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Último Backup</span>
                    <span className="text-sm text-muted-foreground">Hoy 03:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Espacio Usado</span>
                    <span className="text-sm text-muted-foreground">2.3 GB</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  Crear Backup Manual
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operaciones */}
        <TabsContent value="operaciones">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Configuración de Vehículos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="capacidad_maxima">Capacidad Máxima por Defecto</Label>
                  <Input
                    id="capacidad_maxima"
                    type="number"
                    value={config.capacidad_maxima_default}
                    onChange={(e) => handleConfigChange('capacidad_maxima_default', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="velocidad_maxima">Velocidad Máxima Permitida (km/h)</Label>
                  <Input
                    id="velocidad_maxima"
                    type="number"
                    value={config.velocidad_maxima}
                    onChange={(e) => handleConfigChange('velocidad_maxima', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Configuración de Paraderos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tiempo_espera">Tiempo de Espera Máximo (minutos)</Label>
                  <Input
                    id="tiempo_espera"
                    type="number"
                    value={config.tiempo_espera_paradero}
                    onChange={(e) => handleConfigChange('tiempo_espera_paradero', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integraciones */}
        <TabsContent value="integraciones">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  APIs y Servicios Externos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mapbox_token">Mapbox Access Token</Label>
                  <Input
                    id="mapbox_token"
                    type="password"
                    placeholder="pk.eyJ1IjoiZXhhbXBsZS..."
                    value={config.mapbox_token}
                    onChange={(e) => handleConfigChange('mapbox_token', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Token para el servicio de mapas en tiempo real
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sms_provider">Proveedor SMS</Label>
                  <Select 
                    value={config.sms_provider} 
                    onValueChange={(value) => handleConfigChange('sms_provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="aws">AWS SNS</SelectItem>
                      <SelectItem value="local">Proveedor Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline">
                  Probar Conexiones
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Avanzado */}
        <TabsContent value="avanzado">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Settings className="h-5 w-5" />
                  Configuraciones Avanzadas
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  ⚠️ Estas configuraciones pueden afectar el funcionamiento del sistema
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="config_json">Configuración JSON</Label>
                  <Textarea
                    id="config_json"
                    placeholder='{"configuracion": "valor"}'
                    className="h-32"
                  />
                  <p className="text-sm text-muted-foreground">
                    Configuración avanzada en formato JSON
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline">
                    Validar JSON
                  </Button>
                  <Button variant="destructive">
                    Aplicar Configuración
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {hasChanges && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-orange-700">Tienes cambios sin guardar</p>
              <Button size="sm" onClick={handleSave}>
                Guardar Ahora
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}