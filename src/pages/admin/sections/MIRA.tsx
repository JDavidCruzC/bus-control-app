import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye,
  Camera,
  Cpu,
  Activity,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Settings,
  Monitor,
  Zap
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MIRA() {
  const [sistemaActivo, setSistemaActivo] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState("cam_001");
  const [showCalibracion, setShowCalibracion] = useState(false);
  const [showAjusteIA, setShowAjusteIA] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showZonaDeteccion, setShowZonaDeteccion] = useState(false);
  const [showConfiguracion, setShowConfiguracion] = useState(false);
  const { toast } = useToast();

  // Datos de ejemplo para el sistema MIRA
  const camaras = [
    { id: "cam_001", nombre: "Terminal Principal", estado: "activa", vehiculos_detectados: 3, ubicacion: "Entrada Norte" },
    { id: "cam_002", nombre: "Plaza Central", estado: "activa", vehiculos_detectados: 1, ubicacion: "Zona Centro" },
    { id: "cam_003", nombre: "Universidad", estado: "mantenimiento", vehiculos_detectados: 0, ubicacion: "Campus Este" },
    { id: "cam_004", nombre: "Hospital Regional", estado: "activa", vehiculos_detectados: 2, ubicacion: "Zona Sur" }
  ];

  const detecciones = [
    { id: "1", camera: "Terminal Principal", placa: "ABC-123", confianza: 95, timestamp: "2024-01-15 14:30:25", estado: "verificada" },
    { id: "2", camera: "Plaza Central", placa: "DEF-456", confianza: 88, timestamp: "2024-01-15 14:28:10", estado: "pendiente" },
    { id: "3", camera: "Universidad", placa: "GHI-789", confianza: 92, timestamp: "2024-01-15 14:25:45", estado: "verificada" },
    { id: "4", camera: "Terminal Principal", placa: "JKL-012", confianza: 78, timestamp: "2024-01-15 14:22:30", estado: "rechazada" }
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa': return 'default';
      case 'mantenimiento': return 'secondary';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getDeteccionColor = (estado: string) => {
    switch (estado) {
      case 'verificada': return 'default';
      case 'pendiente': return 'secondary';
      case 'rechazada': return 'destructive';
      default: return 'secondary';
    }
  };

  const getConfianzaColor = (confianza: number) => {
    if (confianza >= 90) return 'text-green-600';
    if (confianza >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sistema MIRA</h1>
          <p className="text-muted-foreground">
            Monitoreo Inteligente y Reconocimiento Automático de placas
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowConfiguracion(true)}
          >
            <Settings className="h-4 w-4" />
            Configurar
          </Button>
          <Button 
            variant={sistemaActivo ? "default" : "outline"}
            onClick={() => {
              setSistemaActivo(!sistemaActivo);
              toast({
                title: sistemaActivo ? "Sistema pausado" : "Sistema activado",
                description: sistemaActivo 
                  ? "El monitoreo ha sido pausado" 
                  : "El monitoreo está activo nuevamente"
              });
            }}
            className="flex items-center gap-2"
          >
            {sistemaActivo ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {sistemaActivo ? "Pausar" : "Activar"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Camera className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{camaras.length}</p>
                <p className="text-muted-foreground text-sm">Cámaras Instaladas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Eye className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {camaras.filter(c => c.estado === 'activa').length}
                </p>
                <p className="text-muted-foreground text-sm">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Cpu className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {detecciones.filter(d => d.estado === 'verificada').length}
                </p>
                <p className="text-muted-foreground text-sm">Detecciones Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(detecciones.reduce((acc, d) => acc + d.confianza, 0) / detecciones.length)}%
                </p>
                <p className="text-muted-foreground text-sm">Precisión Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monitor Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Monitor en Vivo
                </CardTitle>
                <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {camaras.map(camera => (
                      <SelectItem key={camera.id} value={camera.id}>
                        {camera.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {/* Placeholder del video feed */}
              <div className="w-full h-64 bg-black rounded-lg flex items-center justify-center relative">
                <div className="text-center space-y-2">
                  <Camera className="h-12 w-12 text-white/50 mx-auto" />
                  <p className="text-white/75">Video Feed - Cámara {selectedCamera}</p>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white/75 text-sm">EN VIVO</span>
                  </div>
                </div>
                
                {/* Overlay de detección simulado */}
                <div className="absolute top-4 left-4 bg-green-500 px-2 py-1 rounded text-white text-xs">
                  ABC-123 (95%)
                </div>
                <div className="absolute bottom-4 right-4 text-white text-xs">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detecciones Recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Detecciones Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cámara</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Confianza</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detecciones.map((deteccion) => (
                    <TableRow key={deteccion.id}>
                      <TableCell className="font-medium">{deteccion.camera}</TableCell>
                      <TableCell className="font-mono">{deteccion.placa}</TableCell>
                      <TableCell>
                        <span className={getConfianzaColor(deteccion.confianza)}>
                          {deteccion.confianza}%
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {deteccion.timestamp.split(' ')[1]}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getDeteccionColor(deteccion.estado)}>
                          {deteccion.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Control */}
        <div className="space-y-6">
          {/* Estado del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">IA de Reconocimiento</span>
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Activo
                  </Badge>
                </div>
                <Progress value={95} className="h-2" />
                <p className="text-xs text-muted-foreground">CPU: 95% - Memoria: 78%</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Base de Datos</span>
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Conectado
                  </Badge>
                </div>
                <Progress value={82} className="h-2" />
                <p className="text-xs text-muted-foreground">Latencia: 15ms</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Red de Cámaras</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    1 Offline
                  </Badge>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground">3 de 4 cámaras activas</p>
              </div>
            </CardContent>
          </Card>

          {/* Cámaras */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Estado de Cámaras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {camaras.map((camera) => (
                <div key={camera.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{camera.nombre}</p>
                    <p className="text-xs text-muted-foreground">{camera.ubicacion}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={getEstadoColor(camera.estado)} className="text-xs">
                      {camera.estado}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {camera.vehiculos_detectados} detectados
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Configuración Rápida */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowCalibracion(true)}
              >
                <Camera className="h-4 w-4 mr-2" />
                Calibrar Cámaras
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowAjusteIA(true)}
              >
                <Cpu className="h-4 w-4 mr-2" />
                Ajustar IA
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowLogs(true)}
              >
                <Activity className="h-4 w-4 mr-2" />
                Ver Logs
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowZonaDeteccion(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Zona de Detección
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Configuración General */}
      <Dialog open={showConfiguracion} onOpenChange={setShowConfiguracion}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración General del Sistema
            </DialogTitle>
            <DialogDescription>
              Ajusta los parámetros generales del sistema MIRA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tiempo de retención de videos (días)</Label>
              <Input type="number" defaultValue={30} />
            </div>
            <div className="space-y-2">
              <Label>Resolución de grabación</Label>
              <Select defaultValue="1080p">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="4k">4K</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>FPS de grabación</Label>
              <Input type="number" defaultValue={30} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfiguracion(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setShowConfiguracion(false);
                toast({ title: "Configuración guardada", description: "Los cambios se han aplicado correctamente" });
              }}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Calibración de Cámaras */}
      <Dialog open={showCalibracion} onOpenChange={setShowCalibracion}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Calibración de Cámaras
            </DialogTitle>
            <DialogDescription>
              Ajusta la configuración individual de cada cámara
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Seleccionar Cámara</Label>
              <Select defaultValue="cam_001">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {camaras.map((cam) => (
                    <SelectItem key={cam.id} value={cam.id}>
                      {cam.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Brillo</Label>
              <Slider defaultValue={[50]} max={100} step={1} />
            </div>
            <div className="space-y-2">
              <Label>Contraste</Label>
              <Slider defaultValue={[50]} max={100} step={1} />
            </div>
            <div className="space-y-2">
              <Label>Saturación</Label>
              <Slider defaultValue={[50]} max={100} step={1} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCalibracion(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setShowCalibracion(false);
                toast({ title: "Calibración completada", description: "La cámara ha sido calibrada exitosamente" });
              }}>
                Aplicar Calibración
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Ajuste de IA */}
      <Dialog open={showAjusteIA} onOpenChange={setShowAjusteIA}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Ajuste de Parámetros de IA
            </DialogTitle>
            <DialogDescription>
              Configura los parámetros del modelo de reconocimiento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Umbral de Confianza Mínimo (%)</Label>
              <Slider defaultValue={[75]} max={100} step={1} />
              <p className="text-xs text-muted-foreground">
                Detecciones con confianza menor a este valor serán rechazadas
              </p>
            </div>
            <div className="space-y-2">
              <Label>Velocidad de Procesamiento</Label>
              <Select defaultValue="balanced">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Rápido (menor precisión)</SelectItem>
                  <SelectItem value="balanced">Balanceado</SelectItem>
                  <SelectItem value="accurate">Preciso (más lento)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Intervalo de Detección (segundos)</Label>
              <Input type="number" defaultValue={2} min={1} max={10} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAjusteIA(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setShowAjusteIA(false);
                toast({ title: "Parámetros actualizados", description: "La IA ha sido reconfigurada correctamente" });
              }}>
                Guardar Parámetros
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Logs del Sistema */}
      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Logs del Sistema
            </DialogTitle>
            <DialogDescription>
              Registro de actividad y eventos del sistema MIRA
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-2 font-mono text-xs">
              <div className="p-2 bg-muted rounded">
                <span className="text-green-600">[2024-01-15 14:30:25]</span> INFO: Detección exitosa - Placa ABC-123 (95% confianza)
              </div>
              <div className="p-2 bg-muted rounded">
                <span className="text-blue-600">[2024-01-15 14:28:10]</span> INFO: Detección exitosa - Placa DEF-456 (88% confianza)
              </div>
              <div className="p-2 bg-muted rounded">
                <span className="text-yellow-600">[2024-01-15 14:25:45]</span> WARN: Cámara Universidad - Calidad de imagen baja
              </div>
              <div className="p-2 bg-muted rounded">
                <span className="text-green-600">[2024-01-15 14:22:30]</span> INFO: Sistema de IA reiniciado correctamente
              </div>
              <div className="p-2 bg-muted rounded">
                <span className="text-red-600">[2024-01-15 14:20:15]</span> ERROR: Cámara Universidad desconectada
              </div>
              <div className="p-2 bg-muted rounded">
                <span className="text-green-600">[2024-01-15 14:15:00]</span> INFO: Calibración de cámara Terminal Principal completada
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end">
            <Button onClick={() => setShowLogs(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Zona de Detección */}
      <Dialog open={showZonaDeteccion} onOpenChange={setShowZonaDeteccion}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Editor de Zonas de Detección
            </DialogTitle>
            <DialogDescription>
              Define las áreas donde se realizará el reconocimiento de placas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Seleccionar Cámara</Label>
              <Select defaultValue="cam_001">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {camaras.map((cam) => (
                    <SelectItem key={cam.id} value={cam.id}>
                      {cam.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full h-64 bg-black rounded-lg flex items-center justify-center relative border-2 border-dashed border-primary">
              <div className="text-center space-y-2">
                <Camera className="h-12 w-12 text-white/50 mx-auto" />
                <p className="text-white/75">Vista previa de la cámara</p>
                <p className="text-white/50 text-sm">Haz clic y arrastra para definir zonas de detección</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowZonaDeteccion(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setShowZonaDeteccion(false);
                toast({ title: "Zonas guardadas", description: "Las zonas de detección han sido configuradas" });
              }}>
                Guardar Zonas
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}