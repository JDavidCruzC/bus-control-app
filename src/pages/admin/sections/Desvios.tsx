import { useState } from "react";
import { useDesvios, Desvio } from "@/hooks/useDesvios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, XCircle, MapPin, Clock, User, FileImage } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SimpleMapView } from "@/components/SimpleMapView";

export function Desvios() {
  const { desvios, loading, validarDesvio } = useDesvios();
  const [selectedDesvio, setSelectedDesvio] = useState<Desvio | null>(null);
  const [comentarios, setComentarios] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const pendientes = desvios.filter(d => d.estado_validacion === 'pendiente');
  const aprobados = desvios.filter(d => d.estado_validacion === 'aprobado');
  const rechazados = desvios.filter(d => d.estado_validacion === 'rechazado');

  const filteredDesvios = (list: Desvio[]) => 
    list.filter(d => 
      d.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.conductor?.usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.conductor?.usuario?.apellido.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleValidate = async (desvioId: string, estado: 'aprobado' | 'rechazado') => {
    setIsValidating(true);
    try {
      await validarDesvio(desvioId, estado, comentarios);
      setSelectedDesvio(null);
      setComentarios("");
    } finally {
      setIsValidating(false);
    }
  };

  const getHistorialConductor = (conductorId: string) => {
    return desvios.filter(d => d.conductor_id === conductorId);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Pendiente
        </Badge>;
      case 'aprobado':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Aprobado
        </Badge>;
      case 'rechazado':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
          <XCircle className="w-3 h-3 mr-1" />
          Rechazado
        </Badge>;
      default:
        return null;
    }
  };

  const DesvioCard = ({ desvio }: { desvio: Desvio }) => {
    const historial = getHistorialConductor(desvio.conductor_id);
    const desviosPrevios = historial.length - 1;

    return (
      <Card 
        className="cursor-pointer hover:border-primary transition-colors"
        onClick={() => setSelectedDesvio(desvio)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {desvio.conductor?.usuario?.nombre} {desvio.conductor?.usuario?.apellido}
                {desviosPrevios > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {desviosPrevios} desvío{desviosPrevios !== 1 ? 's' : ''} previo{desviosPrevios !== 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {format(new Date(desvio.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
              </CardDescription>
            </div>
            {getEstadoBadge(desvio.estado_validacion)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Motivo</p>
                <p className="text-sm text-muted-foreground">{desvio.motivo}</p>
              </div>
            </div>
            
            {desvio.descripcion_detallada && (
              <div className="flex items-start gap-2">
                <FileImage className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Descripción</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{desvio.descripcion_detallada}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Ubicación</p>
                <p className="text-xs text-muted-foreground">
                  Lat: {desvio.latitud.toFixed(6)}, Lng: {desvio.longitud.toFixed(6)}
                </p>
              </div>
            </div>

            {desvio.evidencia_url && desvio.evidencia_url.length > 0 && (
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm">
                  {desvio.evidencia_url.length} archivo{desvio.evidencia_url.length !== 1 ? 's' : ''} adjunto{desvio.evidencia_url.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Validación de Desvíos</h1>
        <p className="text-muted-foreground">
          Revisa y valida los desvíos reportados por los conductores
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendientes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Aprobados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aprobados.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Rechazados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rechazados.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Buscar por conductor o motivo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        <Tabs defaultValue="pendientes" className="w-full">
          <TabsList>
            <TabsTrigger value="pendientes">
              Pendientes ({pendientes.length})
            </TabsTrigger>
            <TabsTrigger value="aprobados">
              Aprobados ({aprobados.length})
            </TabsTrigger>
            <TabsTrigger value="rechazados">
              Rechazados ({rechazados.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pendientes" className="mt-4">
            <ScrollArea className="h-[600px] pr-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDesvios(pendientes).length > 0 ? (
                  filteredDesvios(pendientes).map((desvio) => (
                    <DesvioCard key={desvio.id} desvio={desvio} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No hay desvíos pendientes
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="aprobados" className="mt-4">
            <ScrollArea className="h-[600px] pr-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDesvios(aprobados).length > 0 ? (
                  filteredDesvios(aprobados).map((desvio) => (
                    <DesvioCard key={desvio.id} desvio={desvio} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No hay desvíos aprobados
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="rechazados" className="mt-4">
            <ScrollArea className="h-[600px] pr-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDesvios(rechazados).length > 0 ? (
                  filteredDesvios(rechazados).map((desvio) => (
                    <DesvioCard key={desvio.id} desvio={desvio} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No hay desvíos rechazados
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Detalles */}
      <Dialog open={!!selectedDesvio} onOpenChange={() => setSelectedDesvio(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedDesvio && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Detalles del Desvío</span>
                  {getEstadoBadge(selectedDesvio.estado_validacion)}
                </DialogTitle>
                <DialogDescription>
                  Reportado el {format(new Date(selectedDesvio.created_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Información del Conductor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Información del Conductor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Nombre</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDesvio.conductor?.usuario?.nombre} {selectedDesvio.conductor?.usuario?.apellido}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Licencia</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDesvio.conductor?.licencia_numero}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Desvíos Totales</p>
                      <p className="text-sm text-muted-foreground">
                        {getHistorialConductor(selectedDesvio.conductor_id).length} desvío(s)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Detalles del Desvío */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Detalles del Desvío
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Motivo</p>
                      <p className="text-sm text-muted-foreground">{selectedDesvio.motivo}</p>
                    </div>
                    {selectedDesvio.descripcion_detallada && (
                      <div>
                        <p className="text-sm font-medium">Descripción Detallada</p>
                        <p className="text-sm text-muted-foreground">{selectedDesvio.descripcion_detallada}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Mapa de Ubicación */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Ubicación del Desvío
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] rounded-lg overflow-hidden">
                      <SimpleMapView
                        center={[selectedDesvio.longitud, selectedDesvio.latitud]}
                        zoom={15}
                        markers={[{
                          longitude: selectedDesvio.longitud,
                          latitude: selectedDesvio.latitud,
                          color: '#ef4444',
                          label: 'Ubicación del desvío'
                        }]}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Coordenadas: {selectedDesvio.latitud.toFixed(6)}, {selectedDesvio.longitud.toFixed(6)}
                    </p>
                  </CardContent>
                </Card>

                {/* Galería de Evidencias */}
                {selectedDesvio.evidencia_url && selectedDesvio.evidencia_url.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileImage className="w-4 h-4" />
                        Evidencias Multimedia ({selectedDesvio.evidencia_url.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedDesvio.evidencia_url.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-video rounded-lg overflow-hidden border bg-muted hover:border-primary transition-colors"
                          >
                            {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <img
                                src={url}
                                alt={`Evidencia ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileImage className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white text-sm">Ver archivo</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Historial del Conductor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Historial de Desvíos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-3">
                        {getHistorialConductor(selectedDesvio.conductor_id)
                          .filter(d => d.id !== selectedDesvio.id)
                          .map((d) => (
                            <div key={d.id} className="flex items-start justify-between p-3 rounded-lg bg-muted">
                              <div className="space-y-1">
                                <p className="text-sm font-medium">{d.motivo}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(d.created_at), "dd MMM yyyy", { locale: es })}
                                </p>
                              </div>
                              {getEstadoBadge(d.estado_validacion)}
                            </div>
                          ))}
                        {getHistorialConductor(selectedDesvio.conductor_id).length === 1 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Este es el primer desvío del conductor
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Sistema de Validación */}
                {selectedDesvio.estado_validacion === 'pendiente' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Validar Desvío</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Comentarios sobre la validación (opcional)..."
                        value={comentarios}
                        onChange={(e) => setComentarios(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleValidate(selectedDesvio.id, 'aprobado')}
                          disabled={isValidating}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Aprobar
                        </Button>
                        <Button
                          onClick={() => handleValidate(selectedDesvio.id, 'rechazado')}
                          disabled={isValidating}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rechazar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Info de Validación (si ya está validado) */}
                {selectedDesvio.estado_validacion !== 'pendiente' && selectedDesvio.validado_por && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Información de Validación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Estado</p>
                        <p className="text-sm text-muted-foreground capitalize">{selectedDesvio.estado_validacion}</p>
                      </div>
                      {selectedDesvio.fecha_validacion && (
                        <div>
                          <p className="text-sm font-medium">Fecha de Validación</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(selectedDesvio.fecha_validacion), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                          </p>
                        </div>
                      )}
                      {selectedDesvio.comentarios_validacion && (
                        <div>
                          <p className="text-sm font-medium">Comentarios</p>
                          <p className="text-sm text-muted-foreground">{selectedDesvio.comentarios_validacion}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
