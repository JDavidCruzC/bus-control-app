import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { usePagos, Pago } from "@/hooks/usePagos";
import { useMembresias } from "@/hooks/useMembresias";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ValidarPagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pago: Pago | null;
}

export function ValidarPagoDialog({ open, onOpenChange, pago }: ValidarPagoDialogProps) {
  const { updatePago } = usePagos();
  const { createMembresia } = useMembresias();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [notas, setNotas] = useState("");

  const calcularFechas = (tipoDescripcion: string) => {
    const fechaInicio = new Date();
    let mesesAAgregar = 1;
    
    if (tipoDescripcion.toLowerCase().includes('anual')) {
      mesesAAgregar = 12;
    }
    
    const fechaFin = new Date(fechaInicio);
    fechaFin.setMonth(fechaFin.getMonth() + mesesAAgregar);
    
    return {
      fecha_inicio: fechaInicio.toISOString().split('T')[0],
      fecha_fin: fechaFin.toISOString().split('T')[0],
      mesesAAgregar
    };
  };

  const handleAprobar = async () => {
    if (!pago) return;

    setLoading(true);
    try {
      // Actualizar el pago a completado
      await updatePago(pago.id, { 
        estado: 'completado',
        descripcion: `${pago.descripcion || ''}\nNotas de validación: ${notas || 'Aprobado'}`
      });

      // Obtener la empresa para verificar su plan actual
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .select('tipo_plan')
        .eq('id', pago.empresa_id)
        .single();

      if (empresaError) throw empresaError;

      const tipoPlan = empresaData?.tipo_plan || 'basico';
      const { fecha_inicio, fecha_fin } = calcularFechas(pago.descripcion || '');

      // Crear una nueva membresía
      await createMembresia({
        empresa_id: pago.empresa_id,
        tipo_plan: tipoPlan,
        precio: pago.monto,
        fecha_inicio,
        fecha_fin,
        estado: 'activa',
        auto_renovacion: false,
      });

      // Actualizar el estado de la empresa
      await supabase
        .from('empresas')
        .update({
          estado_membresia: 'activa',
          fecha_vencimiento_membresia: fecha_fin,
          tipo_plan: tipoPlan
        })
        .eq('id', pago.empresa_id);

      toast({
        title: "Pago Aprobado",
        description: "El pago ha sido validado y la membresía ha sido activada.",
      });

      onOpenChange(false);
      setNotas("");
    } catch (error: any) {
      console.error('Error al aprobar pago:', error);
      toast({
        title: "Error",
        description: "No se pudo aprobar el pago",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!pago) return;
    
    if (!notas.trim()) {
      toast({
        title: "Error",
        description: "Debes proporcionar un motivo de rechazo",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await updatePago(pago.id, { 
        estado: 'fallido',
        descripcion: `${pago.descripcion || ''}\nMotivo de rechazo: ${notas}`
      });

      toast({
        title: "Pago Rechazado",
        description: "El pago ha sido marcado como fallido.",
        variant: "destructive"
      });

      onOpenChange(false);
      setNotas("");
    } catch (error) {
      console.error('Error al rechazar pago:', error);
      toast({
        title: "Error",
        description: "No se pudo rechazar el pago",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!pago) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Validar Pago</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Empresa</Label>
              <p className="font-medium">{pago.empresa?.nombre || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Monto</Label>
              <p className="font-medium text-lg">${Number(pago.monto).toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Método de Pago</Label>
              <p className="font-medium capitalize">{pago.metodo_pago || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Estado Actual</Label>
              <Badge variant={pago.estado === 'pendiente' ? 'secondary' : 'default'}>
                {pago.estado}
              </Badge>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Referencia de Pago</Label>
            <p className="font-medium font-mono">{pago.referencia_pago || 'N/A'}</p>
          </div>

          <div>
            <Label className="text-muted-foreground">Descripción</Label>
            <p className="text-sm">{pago.descripcion || 'Sin descripción'}</p>
          </div>

          <div>
            <Label className="text-muted-foreground">Fecha de Registro</Label>
            <p className="text-sm">
              {pago.fecha_pago 
                ? new Date(pago.fecha_pago).toLocaleString('es-ES')
                : 'N/A'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas de Validación</Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Agregar comentarios sobre la validación..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleRechazar}
            disabled={loading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rechazar
          </Button>
          <Button 
            type="button"
            onClick={handleAprobar}
            disabled={loading}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {loading ? "Procesando..." : "Aprobar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
