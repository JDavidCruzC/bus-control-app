import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useRutasPublicas } from "@/hooks/useRutasPublicas";
import { useEmpresas } from "@/hooks/useEmpresas";
import { Search, MapPin, Clock, DollarSign, Route, Building2 } from "lucide-react";

export default function ConsultarRutas() {
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<string | null>(null);
  const { empresas } = useEmpresas();
  const { rutas, loading, error } = useRutasPublicas(empresaSeleccionada);
  const [searchTerm, setSearchTerm] = useState("");

  const rutasFiltradas = rutas.filter(ruta => 
    ruta.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ruta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ruta.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando rutas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" asChild>
              <Link to="/publico">
                ← Regresar al Inicio
              </Link>
            </Button>
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Consultar Rutas
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encuentra información detallada sobre nuestras rutas de transporte público
          </p>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={empresaSeleccionada || "todas"} onValueChange={(value) => setEmpresaSeleccionada(value === "todas" ? null : value)}>
                <SelectTrigger className="w-full sm:w-[280px]">
                  <SelectValue placeholder="Filtrar por empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las empresas</SelectItem>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código, nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Route className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rutas.length}</p>
                  <p className="text-sm text-muted-foreground">Rutas Activas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {rutas.reduce((acc, ruta) => acc + ruta.paraderos.length, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Paraderos Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    ${Math.min(...rutas.map(r => r.precio || 0)).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Precio Mínimo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de rutas */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {searchTerm ? `Resultados para "${searchTerm}"` : 'Todas las Rutas'}
            <span className="text-muted-foreground ml-2">({rutasFiltradas.length})</span>
          </h2>

          {rutasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  {searchTerm ? 'No se encontraron rutas que coincidan con tu búsqueda' : 'No hay rutas disponibles'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rutasFiltradas.map((ruta) => (
                <Card key={ruta.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {ruta.empresa && (
                          <Badge variant="secondary" className="gap-1 mb-2">
                            <Building2 className="h-3 w-3" />
                            {ruta.empresa.nombre}
                          </Badge>
                        )}
                        <CardTitle className="flex items-center gap-2">
                          <Badge variant="outline">{ruta.codigo}</Badge>
                          {ruta.nombre}
                        </CardTitle>
                        {ruta.descripcion && (
                          <CardDescription className="mt-2">
                            {ruta.descripcion}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Información de la ruta */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {ruta.precio && (
                        <div className="space-y-1">
                          <DollarSign className="h-4 w-4 mx-auto text-muted-foreground" />
                          <p className="text-sm font-medium">${ruta.precio.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Precio</p>
                        </div>
                      )}
                      
                      {ruta.tiempo_estimado_minutos && (
                        <div className="space-y-1">
                          <Clock className="h-4 w-4 mx-auto text-muted-foreground" />
                          <p className="text-sm font-medium">{ruta.tiempo_estimado_minutos} min</p>
                          <p className="text-xs text-muted-foreground">Duración</p>
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <MapPin className="h-4 w-4 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium">{ruta.paraderos.length}</p>
                        <p className="text-xs text-muted-foreground">Paraderos</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Lista de paraderos */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Paraderos
                      </h4>
                      
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {ruta.paraderos.map((paradero) => (
                          <div 
                            key={paradero.id}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-sm">{paradero.nombre}</p>
                              {paradero.direccion && (
                                <p className="text-xs text-muted-foreground">
                                  {paradero.direccion}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary" className="text-xs">
                                #{paradero.orden_secuencia}
                              </Badge>
                              {paradero.tiempo_llegada_estimado && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {paradero.tiempo_llegada_estimado}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}