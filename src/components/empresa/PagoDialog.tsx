import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePagos } from "@/hooks/usePagos";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PagoDialog({ open, onOpenChange }: PagoDialogProps) {
  const { createPago } = usePagos();
  const { userData } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    monto: 0,
    metodo_pago: "transferencia",
    referencia_pago: "",
    descripcion: "",
    tipo_periodo: "mensual" as "mensual" | "anual",
  });

  useEffect(() => {
    if (open) {
      // Calcular el monto según el tipo de periodo y plan de la empresa
      const planActual = userData?.empresa?.tipo_plan || "basico";
      const montosPlanes = {
        basico: { mensual: 50, anual: 500 },
        premium: { mensual: 100, anual: 1000 },
        enterprise: { mensual: 200, anual: 2000 }
      };
      
      const montoCalculado = montosPlanes[planActual as keyof typeof montosPlanes]?.[formData.tipo_periodo] || 50;
      setFormData(prev => ({ ...prev, monto: montoCalculado }));
    }
  }, [open, formData.tipo_periodo, userData?.empresa?.tipo_plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData?.empresa?.id) {
      toast({
        title: "Error",
        description: "No se pudo identificar la empresa",
        variant: "destructive"
      });
      return;
    }

    if (!formData.referencia_pago.trim()) {
      toast({
        title: "Error",
        description: "La referencia de pago es obligatoria",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const descripcionCompleta = `Pago ${formData.tipo_periodo === 'mensual' ? 'mensual' : 'anual'} - ${formData.descripcion || 'Membresía'}`;
      
      await createPago({
        empresa_id: userData.empresa.id,
        membresia_id: null,
        monto: formData.monto,
        metodo_pago: formData.metodo_pago,
        estado: 'pendiente',
        fecha_pago: new Date().toISOString(),
        referencia_pago: formData.referencia_pago,
        descripcion: descripcionCompleta,
      });
      
      toast({
        title: "Éxito",
        description: "Pago registrado correctamente. Pendiente de validación por Super Admin.",
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating pago:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      monto: 0,
      metodo_pago: "transferencia",
      referencia_pago: "",
      descripcion: "",
      tipo_periodo: "mensual",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pago de Membresía</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo_periodo">Tipo de Periodo *</Label>
            <Select
              value={formData.tipo_periodo}
              onValueChange={(value: "mensual" | "anual") => setFormData({ ...formData, tipo_periodo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensual">Mensual</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto">Monto (USD) *</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              value={formData.monto}
              onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })}
              required
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Monto calculado según tu plan actual
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metodo_pago">Método de Pago *</Label>
            <Select
              value={formData.metodo_pago}
              onValueChange={(value) => setFormData({ ...formData, metodo_pago: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                <SelectItem value="deposito">Depósito Bancario</SelectItem>
                <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referencia_pago">Número de Referencia / Transacción *</Label>
            <Input
              id="referencia_pago"
              value={formData.referencia_pago}
              onChange={(e) => setFormData({ ...formData, referencia_pago: e.target.value })}
              placeholder="Ej: TRX123456789"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción Adicional</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Información adicional sobre el pago"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Registrar Pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
