import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEmpresas } from "@/hooks/useEmpresas";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

export function GestionEmpresas() {
  const { empresas, loading, refetch } = useEmpresas();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmpresas = empresas.filter(e =>
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.ruc && e.ruc.includes(searchTerm))
  );

  const handleToggleEstado = async (empresaId: string, currentEstado: string) => {
    const newEstado = currentEstado === 'activa' ? 'suspendida' : 'activa';
    
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ estado_membresia: newEstado })
        .eq('id', empresaId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Empresa ${newEstado === 'activa' ? 'activada' : 'suspendida'} correctamente`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la empresa",
        variant: "destructive",
      });
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activa':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Activa</Badge>;
      case 'suspendida':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" /> Suspendida</Badge>;
      case 'vencida':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Vencida</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (loading) {
    return <div>Cargando empresas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Empresas</h1>
          <p className="text-muted-foreground mt-2">
            Administra las empresas del ecosistema
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Buscar por nombre o RUC..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4">
        {filteredEmpresas.map((empresa) => (
          <Card key={empresa.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <Building2 className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {empresa.nombre}
                      {getEstadoBadge(empresa.estado_membresia || 'activa')}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {empresa.ruc && `RUC: ${empresa.ruc}`}
                    </p>
                  </div>
                </div>
                <Button
                  variant={empresa.estado_membresia === 'activa' ? 'destructive' : 'default'}
                  onClick={() => handleToggleEstado(empresa.id, empresa.estado_membresia || 'activa')}
                >
                  {empresa.estado_membresia === 'activa' ? 'Suspender' : 'Activar'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{empresa.telefono || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{empresa.email || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plan</p>
                  <p className="font-medium">{empresa.tipo_plan || 'Básico'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vencimiento</p>
                  <p className="font-medium">
                    {empresa.fecha_vencimiento_membresia 
                      ? new Date(empresa.fecha_vencimiento_membresia).toLocaleDateString()
                      : 'Sin fecha'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmpresas.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No se encontraron empresas</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}